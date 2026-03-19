/**
 * useVaultActions — Chain-agnostic vault operations.
 * Uses the ChainAdapter from ChainContext instead of direct algosdk calls.
 */
import { useState, useCallback } from 'react'
import { useChain } from '../contexts/ChainContext'

export const useVaultActions = () => {
    const { adapter, walletAddress, connectWallet, disconnectWallet } = useChain()

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
        onSuccess: (vaultId: string) => void
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
            const vaultId = await adapter.createVault(
                beneficiaryInput.trim(),
                duration,
                deposit,
                (msg: string) => updateStatus({ txId: msg })
            )

            updateStatus({ txId: 'Vault established! ✨' })
            onSuccess(vaultId)
        } catch (e: any) {
            updateStatus({ error: e.message || 'Creation failed', txId: '' })
        } finally {
            updateStatus({ loading: false })
        }
    }, [walletAddress, adapter, updateStatus])

    const handleHeartbeat = useCallback(async (vaultId: string, onComplete?: () => void) => {
        if (!walletAddress || !vaultId) return
        updateStatus({ loading: true, error: '', txId: 'Processing Heartbeat...' })
        try {
            const id = await adapter.heartbeat(vaultId)
            updateStatus({ txId: `Heartbeat confirmed! TX: ${id}` })
            onComplete?.()
        } catch (e: any) {
            updateStatus({ error: e.message || 'Heartbeat failed', txId: '' })
        } finally {
            updateStatus({ loading: false })
        }
    }, [walletAddress, adapter, updateStatus])

    const handleClaim = useCallback(async (vaultId: string, onComplete?: () => void) => {
        if (!walletAddress || !vaultId) return
        updateStatus({ loading: true, error: '', txId: 'Claiming Inheritance funds...' })
        try {
            const id = await adapter.autoRelease(vaultId)
            updateStatus({ txId: `Inheritance claimed successfully! TX: ${id}` })
            onComplete?.()
        } catch (e: any) {
            updateStatus({ error: e.message || 'Claim failed', txId: '' })
        } finally {
            updateStatus({ loading: false })
        }
    }, [walletAddress, adapter, updateStatus])

    const handleWithdraw = useCallback(async (vaultId: string, amount: number, onComplete?: () => void) => {
        if (!walletAddress || !vaultId) return
        updateStatus({ loading: true, error: '', txId: 'Processing Withdrawal...' })
        try {
            const id = await adapter.withdraw(vaultId, amount)
            updateStatus({ txId: `Funds Withdrawn! TX: ${id}` })
            onComplete?.()
        } catch (e: any) {
            updateStatus({ error: e.message || 'Withdrawal failed', txId: '' })
        } finally {
            updateStatus({ loading: false })
        }
    }, [walletAddress, adapter, updateStatus])

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
