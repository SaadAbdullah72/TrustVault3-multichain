import algosdk from 'algosdk'
import { APPROVAL_TEAL, CLEAR_TEAL } from './constants'

// Testnet Configuration
export const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'
export const ALGOD_PORT = 443
export const ALGOD_TOKEN = ''

export const INDEXER_SERVER = 'https://testnet-idx.algonode.cloud'
export const INDEXER_PORT = 443
export const INDEXER_TOKEN = ''

// Create clients
export const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)
export const indexerClient = new algosdk.Indexer(INDEXER_TOKEN, INDEXER_SERVER, INDEXER_PORT)

// App ID fallback (for testing or initial load)
export const APP_ID = 755263236

// Note prefix for automatic discovery
export const VAULT_NOTE_PREFIX = 'TrustVault:v1:beneficiary:'

// --- PERFORMANCE CACHE ---
const fetchCache: Record<string, { data: any, timestamp: number }> = {}
const CACHE_DURATION = 2000 // 2 seconds

function getCached<T>(key: string): T | null {
    const cached = fetchCache[key]
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data as T
    }
    return null
}

function setCache(key: string, data: any) {
    fetchCache[key] = { data, timestamp: Date.now() }
}

// Type for claimable vault (beneficiary auto-discovery)
export interface ClaimableVault {
    appId: bigint
    state: VaultState
}

// Discover all vaults related to a user (as owner or beneficiary)
// Returns unique IDs, sorted by latest first
export const discoverAllRelatedVaults = async (address: string): Promise<bigint[]> => {
    const cacheKey = `discovery_${address}`
    const cached = getCached<bigint[]>(cacheKey)
    if (cached) return cached

    try {
        console.log(`[Discovery] Starting unified scan for ${address.slice(0, 8)}...`)
        const foundIds = new Set<string>()

        // Run primary discovery methods in parallel
        const [createdApps, involvedTxs, noteTxs, supabaseOwner, supabaseBen] = await Promise.all([
            indexerClient.searchForApplications().creator(address).do().catch(() => ({ applications: [] })),
            indexerClient.searchForTransactions().address(address).txType('appl').do().catch(() => ({ transactions: [] })),
            indexerClient.searchForTransactions().notePrefix(new TextEncoder().encode(VAULT_NOTE_PREFIX + address)).do().catch(() => ({ transactions: [] })),
            import('./supabase').then(m => m.getVaultsByOwner(address)).catch(() => []),
            import('./supabase').then(m => m.getVaultsByBeneficiary(address)).catch(() => [])
        ])

        // 1. Creator search
        createdApps.applications?.forEach((app: any) => app.id > 0 && foundIds.add(app.id.toString()))

        // 2. Tx history search
        const allTxs = [...(involvedTxs.transactions || []), ...(noteTxs.transactions || [])]
        allTxs.forEach((tx: any) => {
            const appId = tx['application-transaction']?.['application-id']
            if (appId && appId > 0) foundIds.add(appId.toString())
        })

        // 3. Supabase results
        supabaseOwner.forEach((id: string) => foundIds.add(id))
        supabaseBen.forEach((id: string) => foundIds.add(id))

        // 4. Local storage fallbacks
        if (typeof window !== 'undefined') {
            const cachedIds = localStorage.getItem(`trustvault_ids_${address}`)
            if (cachedIds) {
                try {
                    const parsed = JSON.parse(cachedIds)
                    Array.isArray(parsed) && parsed.forEach((id: string) => foundIds.add(id))
                } catch (e) { }
            }
        }

        const scanResults = Array.from(foundIds).filter(id => id && id !== '0').map(id => BigInt(id))
        const sorted = scanResults.sort((a, b) => Number(b - a))

        setCache(cacheKey, sorted)
        console.log(`[Discovery] Found ${sorted.length} unique vault(s)`)
        return sorted
    } catch (e) {
        console.error('[Discovery] Unified scan failed:', e)
        return []
    }
}

// Optimized version for just finding claimable vaults for beneficiary
export const discoverBeneficiaryVaults = async (address: string): Promise<ClaimableVault[]> => {
    try {
        const allIds = await discoverAllRelatedVaults(address)
        if (allIds.length === 0) return []

        // Fetch states in parallel
        const states = await Promise.all(allIds.map(id => fetchVaultState(id)))
        const results: ClaimableVault[] = []

        states.forEach((state, idx) => {
            if (state &&
                state.beneficiary.toUpperCase() === address.toUpperCase() &&
                !state.released) {
                results.push({ appId: allIds[idx], state })
            }
        })

        return results
    } catch (e) {
        return []
    }
}

// Save beneficiary-to-vault mapping in global localStorage registry
export const saveBeneficiaryMapping = (beneficiaryAddress: string, appId: bigint) => {
    if (typeof window === 'undefined') return
    try {
        const registry: Record<string, string[]> = JSON.parse(
            localStorage.getItem('trustvault_beneficiary_registry') || '{}'
        )
        const key = beneficiaryAddress.toUpperCase()
        if (!registry[key]) registry[key] = []
        const idStr = appId.toString()
        if (!registry[key].includes(idStr)) {
            registry[key].push(idStr)
        }
        localStorage.setItem('trustvault_beneficiary_registry', JSON.stringify(registry))
        console.log(`Saved vault #${idStr} for beneficiary ${beneficiaryAddress.slice(0, 8)}...`)
    } catch (e) {
        console.warn('Failed to save beneficiary mapping:', e)
    }
}

// Check account balance before vault creation
export const checkAccountBalance = async (address: string, requiredMicroAlgos: number): Promise<{ ok: boolean, balance: number, needed: number }> => {
    try {
        const info = await algodClient.accountInformation(address).do()
        const balance = Number(info.amount || 0)
        const minBalance = Number((info as any).minBalance || (info as any)['min-balance'] || 100000)
        const available = balance - minBalance
        return {
            ok: available >= requiredMicroAlgos,
            balance: balance,
            needed: minBalance + requiredMicroAlgos
        }
    } catch (e) {
        return { ok: true, balance: 0, needed: 0 } // Allow attempt if check fails
    }
}

// Get vault's ALGO balance
export const getVaultBalance = async (appId: bigint): Promise<number> => {
    const cacheKey = `balance_${appId.toString()}`
    const cached = getCached<number>(cacheKey)
    if (cached !== null) return cached

    try {
        const appAddress = getAppAddress(appId)
        const info = await algodClient.accountInformation(appAddress).do()
        const balance = Number(info.amount || 0) / 1_000_000
        setCache(cacheKey, balance)
        return balance
    } catch (e) {
        return 0
    }
}

// Function to deploy a new vault
export const deployVault = async (sender: string, signer: any) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 500))
        const params = await algodClient.getTransactionParams().do()

        // Compile programs
        console.log('[Deploy] Compiling TEAL scripts...')
        const approvalRes = await algodClient.compile(APPROVAL_TEAL).do()
        const clearRes = await algodClient.compile(CLEAR_TEAL).do()

        const approvalProgram = new Uint8Array(Buffer.from(approvalRes.result, 'base64'))
        const clearProgram = new Uint8Array(Buffer.from(clearRes.result, 'base64'))

        console.log('[Deploy] Creating Application Create Transaction...')
        // Create the application creation transaction
        const txn = algosdk.makeApplicationCreateTxnFromObject({
            sender: sender,
            suggestedParams: params,
            onComplete: algosdk.OnApplicationComplete.NoOpOC,
            approvalProgram: approvalProgram,
            clearProgram: clearProgram,
            numLocalInts: 0,
            numLocalByteSlices: 0,
            numGlobalInts: 3, // LockDuration, LastHeartbeat, Released
            numGlobalByteSlices: 2, // Owner, Beneficiary
            note: new TextEncoder().encode(`TrustVault:deploy:${Date.now()}`)
        })

        console.log('[Deploy] Awaiting Pera Wallet Signature...')

        // Use direct transaction signer instead of ATC for raw creation.
        // ATC can sometimes have issues with bare app creations on Pera WCv2

        // We must wrap the transaction in a group, even if it's single
        algosdk.assignGroupID([txn])

        // The signer function expects array of txns and array of indices to sign
        const signedTxns = await signer([txn], [0])

        console.log('[Deploy] Signature received! Sending to Algod network...')

        const sendResult = await algodClient.sendRawTransaction(signedTxns[0]).do()
        const txId = sendResult.txid
        console.log('App Create TxID:', txId)

        await algosdk.waitForConfirmation(algodClient, txId, 4)

        const txInfo = await algodClient.pendingTransactionInformation(txId).do()
        return txInfo.applicationIndex
    } catch (error) {
        console.error('Deployment failed:', error)
        throw error
    }
}

// Global State Keys
export const STATE_KEYS = {
    OWNER: 'Owner',
    BENEFICIARY: 'Beneficiary',
    LOCK_DURATION: 'LockDuration',
    LAST_HEARTBEAT: 'LastHeartbeat',
    RELEASED: 'Released'
}

// Type for contract state
export interface VaultState {
    owner: string
    beneficiary: string
    lockDuration: number
    lastHeartbeat: number
    released: boolean
}

// Fetch contract state
export async function fetchVaultState(appId: number | bigint): Promise<VaultState | null> {
    const cacheKey = `state_${appId.toString()}`
    const cached = getCached<VaultState>(cacheKey)
    if (cached) return cached

    try {
        const appInfo = await algodClient.getApplicationByID(appId).do()
        const globalState = appInfo.params?.globalState || []
        const senderAddr = appInfo.params?.creator || ''

        const state: any = {}
        globalState.forEach((item: any) => {
            const key = Buffer.from(item.key, 'base64').toString()
            const value = item.value
            if (value.type === 1) { // Bytes
                const addr = algosdk.encodeAddress(Buffer.from(value.bytes, 'base64'))
                state[key] = String(addr)
            } else { // Uint
                state[key] = Number(value.uint)
            }
        })

        const result: VaultState = {
            owner: String(state[STATE_KEYS.OWNER] || senderAddr),
            beneficiary: String(state[STATE_KEYS.BENEFICIARY] || ''),
            lockDuration: Number(state[STATE_KEYS.LOCK_DURATION]) || 0,
            lastHeartbeat: Number(state[STATE_KEYS.LAST_HEARTBEAT]) || 0,
            released: state[STATE_KEYS.RELEASED] === 1
        }
        setCache(cacheKey, result)
        return result
    } catch (error) {
        console.error('Failed to fetch vault state:', error)
        return null
    }
}

// Call heartbeat function
export async function callHeartbeat(
    appId: number | bigint,
    senderAddress: string,
    signer: any
): Promise<string> {
    const suggestedParams = await algodClient.getTransactionParams().do()
    const method = new algosdk.ABIMethod({
        name: 'heartbeat',
        args: [],
        returns: { type: 'void' }
    })

    const atc = new algosdk.AtomicTransactionComposer()
    atc.addMethodCall({
        appID: appId,
        method: method,
        sender: senderAddress,
        suggestedParams: { ...suggestedParams, flatFee: true, fee: 2000 },
        signer: signer,
        note: new TextEncoder().encode(`TrustVault:heartbeat:${Date.now()}`)
    })

    const result = await atc.execute(algodClient, 4)
    return result.txIDs[0]
}

// Call auto_release function
export async function callAutoRelease(
    appId: number | bigint,
    senderAddress: string,
    signer: any
): Promise<string> {
    const suggestedParams = await algodClient.getTransactionParams().do()
    const method = new algosdk.ABIMethod({
        name: 'auto_release',
        args: [],
        returns: { type: 'void' }
    })

    const atc = new algosdk.AtomicTransactionComposer()
    atc.addMethodCall({
        appID: appId,
        method: method,
        sender: senderAddress,
        suggestedParams: { ...suggestedParams, flatFee: true, fee: 3000 }, // Higher fee for release as it sends funds
        signer: signer,
        note: new TextEncoder().encode(`TrustVault:claim:${Date.now()}`)
    })

    const result = await atc.execute(algodClient, 4)
    return result.txIDs[0]
}

// Deposit ALGO to the vault
export async function depositAlgo(
    sender: string,
    vaultAddress: string,
    amountInAlgos: number,
    signer: any
) {
    const params = await algodClient.getTransactionParams().do()
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: sender,
        receiver: vaultAddress,
        amount: Math.round(amountInAlgos * 1_000_000), // Convert to microAlgos
        suggestedParams: params,
    })

    const result = await signer([txn])
    const signedTxn = Array.isArray(result) ? result[0] : result
    const response = await algodClient.sendRawTransaction(signedTxn).do()
    await algosdk.waitForConfirmation(algodClient, response.txid, 4)
    return response.txid
}

// Call withdraw function
export async function callWithdraw(
    appId: number | bigint,
    amount: number,
    senderAddress: string,
    signer: any
): Promise<string> {
    const suggestedParams = await algodClient.getTransactionParams().do()
    const method = new algosdk.ABIMethod({
        name: 'withdraw',
        args: [{ type: 'uint64', name: 'amount' }],
        returns: { type: 'void' }
    })

    const atc = new algosdk.AtomicTransactionComposer()
    atc.addMethodCall({
        appID: appId,
        method: method,
        methodArgs: [BigInt(Math.round(amount * 1_000_000))], // Amount in microAlgos
        sender: senderAddress,
        suggestedParams: { ...suggestedParams, flatFee: true, fee: 2000 },
        signer: signer,
        note: new TextEncoder().encode(`TrustVault:withdraw:${Date.now()}`)
    })

    const result = await atc.execute(algodClient, 4)
    return result.txIDs[0]
}

// Get application address
export function getAppAddress(appId: number | bigint): string {
    const addr = algosdk.getApplicationAddress(appId)
    return String(addr)
}
