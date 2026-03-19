/**
 * Algorand chain adapter — wraps existing algorand.ts utilities
 * into the unified ChainAdapter interface.
 */
import { ChainAdapter, VaultState, ClaimableVault } from './types'
import {
    deployVault,
    callHeartbeat,
    callAutoRelease,
    callWithdraw,
    depositAlgo,
    fetchVaultState as algoFetchState,
    getVaultBalance as algoGetBalance,
    getAppAddress,
    discoverAllRelatedVaults,
    discoverBeneficiaryVaults,
    checkAccountBalance,
    saveBeneficiaryMapping,
    algodClient,
    VAULT_NOTE_PREFIX,
} from '../utils/algorand'
import { saveVaultToRegistry } from '../utils/supabase'
import algosdk from 'algosdk'

export class AlgorandAdapter implements ChainAdapter {
    readonly chainType = 'algorand'

    private wallets: any[] = []
    private activeAddress: string | null = null
    private transactionSigner: any = null

    /**
     * Set wallet context from useWallet hook.
     * Must be called whenever wallet state changes.
     */
    setWalletContext(wallets: any[], activeAddress: string | null, transactionSigner: any) {
        this.wallets = wallets
        this.activeAddress = activeAddress
        this.transactionSigner = transactionSigner
    }

    async connect(): Promise<string> {
        const pera = this.wallets.find((w: any) => w.id === 'pera') || this.wallets[0]
        if (!pera) throw new Error('No wallet provider found')

        try {
            await pera.disconnect()
            await new Promise(resolve => setTimeout(resolve, 800))
        } catch { }

        try {
            await pera.connect()
        } catch (e: any) {
            if (e.message?.includes('Session currently connected')) {
                await pera.disconnect().catch(() => { })
                await new Promise(resolve => setTimeout(resolve, 1500))
                await pera.connect()
            } else {
                throw e
            }
        }

        return this.activeAddress || ''
    }

    async disconnect(): Promise<void> {
        const active = this.wallets.find((w: any) => w.isActive)
        if (active) await active.disconnect()
    }

    getActiveAddress(): string | null {
        return this.activeAddress
    }

    isConnected(): boolean {
        return !!this.activeAddress
    }

    async createVault(beneficiary: string, lockDuration: number, depositAmount: number, onStatus?: (msg: string) => void): Promise<string> {
        console.log('[AlgorandAdapter] createVault start:', { beneficiary, lockDuration, depositAmount })
        if (!this.activeAddress || !this.transactionSigner) {
            console.error('[AlgorandAdapter] Missing address or signer:', { activeAddress: this.activeAddress, hasSigner: !!this.transactionSigner })
            throw new Error('Wallet not connected')
        }

        // Check balance
        onStatus?.('Checking balance...')
        const depositMicro = Math.round(depositAmount * 1_000_000)
        const totalNeeded = depositMicro + 500_000
        const balCheck = await checkAccountBalance(this.activeAddress, totalNeeded)
        if (!balCheck.ok) {
            throw new Error(
                `Insufficient balance! You have ${(balCheck.balance / 1_000_000).toFixed(2)} ALGO but need ~${(balCheck.needed / 1_000_000).toFixed(2)} ALGO.`
            )
        }

        // Deploy
        onStatus?.('Step 1/2: Deploying Vault...')
        const appId = await deployVault(this.activeAddress, this.transactionSigner)
        if (!appId) throw new Error('Deployment failed')

        onStatus?.('Step 1/2 Complete! Finalizing (3s)...')
        await new Promise(resolve => setTimeout(resolve, 3000))

        // Bootstrap + Fund
        onStatus?.('Step 2/2: Setting up & Funding...')
        await new Promise(resolve => setTimeout(resolve, 500))

        const appAddress = getAppAddress(appId)
        const suggestedParams = await algodClient.getTransactionParams().do()
        const method = new algosdk.ABIMethod({
            name: 'bootstrap',
            args: [{ name: 'beneficiary', type: 'address' }, { name: 'lock_duration', type: 'uint64' }],
            returns: { type: 'void' }
        })

        const encodedNote = new TextEncoder().encode(VAULT_NOTE_PREFIX + beneficiary.trim())
        const bootstrapTxn = algosdk.makeApplicationCallTxnFromObject({
            sender: this.activeAddress,
            appIndex: Number(appId),
            onComplete: algosdk.OnApplicationComplete.NoOpOC,
            suggestedParams: { ...suggestedParams, flatFee: true, fee: 2000 },
            appArgs: [
                method.getSelector(),
                algosdk.decodeAddress(beneficiary.trim()).publicKey,
                algosdk.encodeUint64(lockDuration)
            ],
            accounts: [beneficiary.trim()],
            note: encodedNote
        })

        const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            sender: this.activeAddress,
            receiver: appAddress,
            amount: depositMicro,
            suggestedParams: { ...suggestedParams, flatFee: true, fee: 1000 },
        })

        const txns = [bootstrapTxn, payTxn]
        algosdk.assignGroupID(txns)
        console.log('[AlgorandAdapter] Signing transactions...')
        const signedTxns = await this.transactionSigner(txns, [0, 1])
        console.log('[AlgorandAdapter] Sending txns...')
        await algodClient.sendRawTransaction(signedTxns).do()
        await algosdk.waitForConfirmation(algodClient, bootstrapTxn.txID().toString(), 4)

        // Save to registries
        onStatus?.('Vault established! Finalizing secure registry...')
        saveBeneficiaryMapping(beneficiary.trim(), appId)
        await saveVaultToRegistry(appId.toString(), beneficiary, this.activeAddress)

        return appId.toString()
    }

    async heartbeat(vaultId: string): Promise<string> {
        if (!this.activeAddress || !this.transactionSigner) throw new Error('Wallet not connected')
        return callHeartbeat(BigInt(vaultId), this.activeAddress, this.transactionSigner)
    }

    async withdraw(vaultId: string, amount: number): Promise<string> {
        if (!this.activeAddress || !this.transactionSigner) throw new Error('Wallet not connected')
        return callWithdraw(BigInt(vaultId), amount, this.activeAddress, this.transactionSigner)
    }

    async autoRelease(vaultId: string): Promise<string> {
        if (!this.activeAddress || !this.transactionSigner) throw new Error('Wallet not connected')
        return callAutoRelease(BigInt(vaultId), this.activeAddress, this.transactionSigner)
    }

    async deposit(vaultId: string, amount: number): Promise<string> {
        if (!this.activeAddress || !this.transactionSigner) throw new Error('Wallet not connected')
        const vaultAddress = getAppAddress(BigInt(vaultId))
        return depositAlgo(this.activeAddress, vaultAddress, amount, this.transactionSigner)
    }

    async fetchVaultState(vaultId: string): Promise<VaultState | null> {
        const state = await algoFetchState(BigInt(vaultId))
        if (!state) return null
        return {
            owner: state.owner,
            beneficiary: state.beneficiary,
            lockDuration: state.lockDuration,
            lastHeartbeat: state.lastHeartbeat,
            released: state.released,
        }
    }

    async getVaultBalance(vaultId: string): Promise<number> {
        return algoGetBalance(BigInt(vaultId))
    }

    getVaultAddress(vaultId: string): string {
        return getAppAddress(BigInt(vaultId))
    }

    async discoverVaults(address: string): Promise<string[]> {
        const ids = await discoverAllRelatedVaults(address)
        return ids.map(id => id.toString())
    }

    async discoverClaimableVaults(address: string): Promise<ClaimableVault[]> {
        const vaults = await discoverBeneficiaryVaults(address)
        return vaults.map(v => ({
            vaultId: v.appId.toString(),
            state: {
                owner: v.state.owner,
                beneficiary: v.state.beneficiary,
                lockDuration: v.state.lockDuration,
                lastHeartbeat: v.state.lastHeartbeat,
                released: v.state.released,
            }
        }))
    }
}
