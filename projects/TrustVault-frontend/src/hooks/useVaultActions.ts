import { useState, useCallback } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import {
    deployVault,
    callHeartbeat,
    callAutoRelease,
    callWithdraw,
    getAppAddress,
    checkAccountBalance,
    saveBeneficiaryMapping,
    algodClient,
    VAULT_NOTE_PREFIX
} from '../utils/algorand'
import { saveVaultToRegistry } from '../utils/supabase'

export const useVaultActions = () => {
    const { wallets, transactionSigner, activeAddress } = useWallet()
    const [uiStatus, setUIStatus] = useState({
        loading: false,
        error: '',
        txId: ''
    })

    const updateStatus = useCallback((updates: Partial<typeof uiStatus>) => {
        setUIStatus(prev => ({ ...prev, ...updates }))
    }, [])

    const resetStatus = useCallback(() => {
        setUIStatus({ loading: false, error: '', txId: '' })
    }, [])

    const handleConnect = useCallback(async () => {
        try {
            updateStatus({ loading: true, error: '' })
            const pera = wallets.find(w => w.id === 'pera') || wallets[0]
            if (!pera) throw new Error('No wallet provider found')

            try {
                await pera.disconnect()
                await new Promise(resolve => setTimeout(resolve, 800))
            } catch (err) {
                console.warn('Initial disconnect check (can ignore):', err)
            }

            try {
                await pera.connect()
            } catch (connectError: any) {
                if (connectError.message?.includes('Session currently connected')) {
                    console.log('Detected ghost session, performing emergency disconnect and retry...')
                    await pera.disconnect().catch(() => { })
                    await new Promise(resolve => setTimeout(resolve, 1500))
                    await pera.connect()
                } else {
                    throw connectError
                }
            }
        } catch (e: any) {
            console.error('Connection aborted:', e)
            updateStatus({ error: e.message || 'Connection failed. Please try again.' })
        } finally {
            updateStatus({ loading: false })
        }
    }, [wallets, updateStatus])

    const handleCreateVault = useCallback(async (
        beneficiaryInput: string,
        lockDurationInput: string,
        depositInput: string,
        onSuccess: (appId: bigint) => void
    ) => {
        if (!activeAddress) return
        if (!beneficiaryInput || !lockDurationInput || !depositInput) {
            updateStatus({ error: 'Please fill all fields' })
            return
        }

        updateStatus({ loading: true, error: '', txId: 'Checking balance...' })
        try {
            const depositMicro = Math.round(parseFloat(depositInput) * 1_000_000)
            const totalNeeded = depositMicro + 500_000
            const balCheck = await checkAccountBalance(activeAddress, totalNeeded)
            if (!balCheck.ok) {
                updateStatus({
                    error: `Insufficient balance! You have ${(balCheck.balance / 1_000_000).toFixed(2)} ALGO but need ~${(balCheck.needed / 1_000_000).toFixed(2)} ALGO.`,
                    loading: false,
                    txId: ''
                })
                return
            }

            updateStatus({ txId: 'Step 1/2: Deploying Vault...' })
            const appId = await deployVault(activeAddress, transactionSigner)
            if (!appId) throw new Error('Deployment failed')

            updateStatus({ txId: 'Step 1/2 Complete! Finalizing (3s)...' })
            await new Promise(resolve => setTimeout(resolve, 3000))

            updateStatus({ txId: 'Step 2/2: Setting up & Funding...' })
            await new Promise(resolve => setTimeout(resolve, 500))

            const appAddress = getAppAddress(appId)
            const suggestedParams = await algodClient.getTransactionParams().do()
            const method = new algosdk.ABIMethod({
                name: 'bootstrap',
                args: [{ name: 'beneficiary', type: 'address' }, { name: 'lock_duration', type: 'uint64' }],
                returns: { type: 'void' }
            })

            const encodedNote = new TextEncoder().encode(VAULT_NOTE_PREFIX + beneficiaryInput.trim())
            const bootstrapTxn = algosdk.makeApplicationCallTxnFromObject({
                sender: activeAddress,
                appIndex: Number(appId),
                onComplete: algosdk.OnApplicationComplete.NoOpOC,
                suggestedParams: { ...suggestedParams, flatFee: true, fee: 2000 },
                appArgs: [
                    method.getSelector(),
                    algosdk.decodeAddress(beneficiaryInput.trim()).publicKey,
                    algosdk.encodeUint64(Number(lockDurationInput))
                ],
                accounts: [beneficiaryInput.trim()],
                note: encodedNote
            })

            const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: activeAddress,
                receiver: appAddress,
                amount: depositMicro,
                suggestedParams: { ...suggestedParams, flatFee: true, fee: 1000 },
            })

            const txns = [bootstrapTxn, payTxn]
            algosdk.assignGroupID(txns)
            const signedTxns = await transactionSigner(txns, [0, 1])
            await algodClient.sendRawTransaction(signedTxns).do()
            await algosdk.waitForConfirmation(algodClient, bootstrapTxn.txID().toString(), 4)

            updateStatus({ txId: 'Vault established! Finalizing secure registry...' })
            saveBeneficiaryMapping(beneficiaryInput.trim(), appId)
            const synced = await saveVaultToRegistry(appId.toString(), beneficiaryInput, activeAddress)

            updateStatus({
                txId: synced ? 'Vault established! ✨' : 'Vault created! (Registry sync delayed)'
            })

            onSuccess(appId)
        } catch (e: any) {
            updateStatus({ error: e.message || 'Creation failed', txId: '' })
        } finally {
            updateStatus({ loading: false })
        }
    }, [activeAddress, transactionSigner, updateStatus])

    const handleHeartbeat = useCallback(async (appId: bigint, onComplete?: () => void) => {
        if (!activeAddress || !appId) return
        updateStatus({ loading: true, error: '', txId: 'Step 1/1: Processing Heartbeat...' })
        try {
            await new Promise(resolve => setTimeout(resolve, 500))
            const id = await callHeartbeat(appId, activeAddress, transactionSigner)
            updateStatus({ txId: `Heartbeat confirmed! TX: ${id}` })
            onComplete?.()
        } catch (e: any) {
            updateStatus({ error: e.message || 'Heartbeat failed', txId: '' })
        } finally {
            updateStatus({ loading: false })
        }
    }, [activeAddress, transactionSigner, updateStatus])

    const handleClaim = useCallback(async (appId: bigint, onComplete?: () => void) => {
        if (!activeAddress || !appId) return
        updateStatus({ loading: true, error: '', txId: 'Step 1/1: Claiming Inheritance funds...' })
        try {
            await new Promise(resolve => setTimeout(resolve, 500))
            const id = await callAutoRelease(appId, activeAddress, transactionSigner)
            updateStatus({ txId: `Inheritance claimed successfully! TX: ${id}` })
            onComplete?.()
        } catch (e: any) {
            updateStatus({ error: e.message || 'Claim failed', txId: '' })
        } finally {
            updateStatus({ loading: false })
        }
    }, [activeAddress, transactionSigner, updateStatus])

    const handleWithdraw = useCallback(async (appId: bigint, amount: number, onComplete?: () => void) => {
        if (!activeAddress || !appId) return
        updateStatus({ loading: true, error: '', txId: 'Step 1/1: Processing Withdrawal...' })
        try {
            await new Promise(resolve => setTimeout(resolve, 500))
            const id = await callWithdraw(appId, amount, activeAddress, transactionSigner)
            updateStatus({ txId: `Funds Withdrawn! TX: ${id}` })
            onComplete?.()
        } catch (e: any) {
            updateStatus({ error: e.message || 'Withdrawal failed', txId: '' })
        } finally {
            updateStatus({ loading: false })
        }
    }, [activeAddress, transactionSigner, updateStatus])

    const handleDisconnect = useCallback(async () => {
        const active = wallets.find(w => w.isActive)
        if (active) {
            await active.disconnect()
        }
    }, [wallets])

    return {
        uiStatus,
        updateStatus,
        resetStatus,
        handleConnect,
        handleDisconnect,
        handleCreateVault,
        handleHeartbeat,
        handleClaim,
        handleWithdraw
    }
}
