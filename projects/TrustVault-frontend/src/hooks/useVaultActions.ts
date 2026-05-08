import { useState, useCallback, useMemo } from 'react'
import { useChain } from '../contexts/ChainContext'
import { TrustVaultSDK } from '../sdk/TrustVaultSDK'

export const useVaultActions = () => {
    const { adapter, walletAddress, connectWallet, disconnectWallet } = useChain()
    
    // Wrap the adapter in the new SDK
    const sdk = useMemo(() => new TrustVaultSDK(adapter), [adapter])

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

    const extractErrorMessage = (e: any): string => {
        const errorStr = (typeof e === 'string' ? e : JSON.stringify(e)).toLowerCase()
        
        // Technical cleanup
        if (errorStr.includes('user rejected')) return 'Transaction cancelled.'
        if (errorStr.includes('insufficient funds')) return 'Insufficient funds. Please top up your wallet.'
        if (errorStr.includes('overspend')) return 'Insufficient balance for network fees.'
        if (errorStr.includes('rejected')) return 'Transaction rejected by wallet.'
        if (errorStr.includes('cannot convert')) return 'Invalid data provided.'
        
        // Fallbacks
        if (e.reason) return e.reason.charAt(0).toUpperCase() + e.reason.slice(1)
        if (e.message) {
            if (e.message.length > 60) return 'Action failed. Please verify your inputs and try again.'
            return e.message
        }
        return 'An unexpected error occurred. Please try again.'
    }

    const handleConnect = useCallback(async () => {
        try {
            updateStatus({ loading: true, error: '' })
            await connectWallet()
        } catch (e: any) {
            console.error('Connection aborted:', e)
            updateStatus({ error: e.message || 'Connection failed. Please try again.' })
        } finally {
            updateStatus({ loading: false })
        }
    }, [connectWallet, updateStatus])

    const handleDisconnect = useCallback(async () => {
        await disconnectWallet()
    }, [disconnectWallet])

    const handleCreateVault = useCallback(async (
        beneficiaryInput: string,
        lockDurationInput: string,
        depositInput: string,
        onSuccess: (vaultId: string) => void,
        vaultName: string = 'Unnamed Vault'
    ) => {
        if (!walletAddress) return
        if (!beneficiaryInput || !lockDurationInput || !depositInput) {
            updateStatus({ error: 'Please fill all fields' })
            return
        }

        const duration = Number(lockDurationInput)
        const deposit = parseFloat(depositInput)

        if (isNaN(duration) || duration <= 0) {
            updateStatus({ error: 'Invalid lock duration. Please enter a positive number.' })
            return
        }

        if (isNaN(deposit) || deposit <= 0) {
            updateStatus({ error: 'Invalid deposit amount. Please enter a positive number.' })
            return
        }

        updateStatus({ loading: true, error: '', txId: 'Creating vault...' })
        try {
            const vaultId = await sdk.createVault({
                beneficiary: beneficiaryInput.trim(),
                lockDuration: duration,
                depositAmount: deposit,
                onStatus: (msg: string) => updateStatus({ txId: msg }),
                vaultName
            })

            updateStatus({ txId: 'Vault created successfully.' })
            onSuccess(vaultId)
        } catch (e: any) {
            updateStatus({ error: extractErrorMessage(e), txId: '' })
        } finally {
            updateStatus({ loading: false })
        }
    }, [walletAddress, sdk, updateStatus])

    const handleHeartbeat = useCallback(async (vaultId: string, onComplete?: () => void) => {
        if (!walletAddress || !vaultId) return
        updateStatus({ loading: true, error: '', txId: 'Processing Heartbeat...' })
        try {
            await sdk.heartbeat(vaultId)
            updateStatus({ txId: `Heartbeat signal confirmed.` })
            onComplete?.()
        } catch (e: any) {
            updateStatus({ error: extractErrorMessage(e), txId: '' })
        } finally {
            updateStatus({ loading: false })
        }
    }, [walletAddress, sdk, updateStatus])

    const handleClaim = useCallback(async (vaultId: string, onComplete?: () => void) => {
        if (!walletAddress || !vaultId) return
        updateStatus({ loading: true, error: '', txId: 'Claiming Inheritance funds...' })
        try {
            await sdk.autoRelease(vaultId)
            updateStatus({ txId: `Inheritance funds claimed successfully.` })
            onComplete?.()
        } catch (e: any) {
            updateStatus({ error: extractErrorMessage(e), txId: '' })
        } finally {
            updateStatus({ loading: false })
        }
    }, [walletAddress, sdk, updateStatus])

    const handleWithdraw = useCallback(async (vaultId: string, amount: number, onComplete?: () => void) => {
        if (!walletAddress || !vaultId) return
        updateStatus({ loading: true, error: '', txId: 'Processing Withdrawal...' })
        try {
            await sdk.withdraw(vaultId, amount)
            updateStatus({ txId: `Withdrawal completed successfully.` })
            onComplete?.()
        } catch (e: any) {
            updateStatus({ error: extractErrorMessage(e), txId: '' })
        } finally {
            updateStatus({ loading: false })
        }
    }, [walletAddress, sdk, updateStatus])

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
