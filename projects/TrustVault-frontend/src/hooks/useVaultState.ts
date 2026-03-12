import { useState, useCallback, useEffect } from 'react'
import {
    fetchVaultState,
    getVaultBalance,
    VaultState
} from '../utils/algorand'

export const useVaultState = (selectedAppId: bigint | null) => {
    const [vaultState, setVaultState] = useState<VaultState | null>(null)
    const [vaultBalance, setVaultBalance] = useState<number>(0)

    const loadVaultState = useCallback(async () => {
        if (selectedAppId === null) return
        try {
            const [state, balance] = await Promise.all([
                fetchVaultState(selectedAppId),
                getVaultBalance(selectedAppId)
            ])
            setVaultState(state)
            setVaultBalance(balance)
        } catch (e) {
            console.error('State load error', e)
        }
    }, [selectedAppId])

    // Load state for selected vault on change + every 5s
    useEffect(() => {
        if (selectedAppId) {
            loadVaultState()
            const interval = setInterval(loadVaultState, 5000)
            return () => clearInterval(interval)
        } else {
            setVaultState(null)
            setVaultBalance(0)
            return undefined
        }
    }, [selectedAppId, loadVaultState])

    return {
        vaultState,
        vaultBalance,
        loadVaultState
    }
}
