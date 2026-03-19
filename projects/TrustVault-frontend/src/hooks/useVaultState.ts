/**
 * useVaultState — Chain-agnostic vault state fetching.
 * Uses the ChainAdapter from ChainContext.
 */
import { useState, useCallback, useEffect } from 'react'
import { useChain } from '../contexts/ChainContext'
import { VaultState } from '../adapters/types'

export const useVaultState = (selectedVaultId: string | null) => {
    const { adapter } = useChain()
    const [vaultState, setVaultState] = useState<VaultState | null>(null)
    const [vaultBalance, setVaultBalance] = useState<number>(0)

    const loadVaultState = useCallback(async () => {
        if (selectedVaultId === null) return
        try {
            const [state, balance] = await Promise.all([
                adapter.fetchVaultState(selectedVaultId),
                adapter.getVaultBalance(selectedVaultId)
            ])
            setVaultState(state)
            setVaultBalance(balance)
        } catch (e) {
            console.error('State load error', e)
        }
    }, [selectedVaultId, adapter])

    // Load state on vault change + every 5s
    useEffect(() => {
        if (selectedVaultId) {
            loadVaultState()
            const interval = setInterval(loadVaultState, 5000)
            return () => clearInterval(interval)
        } else {
            setVaultState(null)
            setVaultBalance(0)
            return undefined
        }
    }, [selectedVaultId, loadVaultState])

    return {
        vaultState,
        vaultBalance,
        loadVaultState
    }
}
