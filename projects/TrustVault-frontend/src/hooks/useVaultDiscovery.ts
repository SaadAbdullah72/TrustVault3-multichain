/**
 * useVaultDiscovery — Chain-agnostic vault discovery.
 * Uses the ChainAdapter from ChainContext.
 */
import { useState, useCallback, useEffect } from 'react'
import { useChain } from '../contexts/ChainContext'
import { ClaimableVault, VaultState } from '../adapters/types'

export const useVaultDiscovery = () => {
    const { adapter, walletAddress, currentChain } = useChain()

    const [userVaults, setUserVaults] = useState<string[]>([])
    const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null)
    const [claimableVaults, setClaimableVaults] = useState<ClaimableVault[]>([])
    const [vaultRoles, setVaultRoles] = useState<Record<string, 'owner' | 'beneficiary'>>({})
    const [isDiscovering, setIsDiscovering] = useState(false)
    const [isScanningClaims, setIsScanningClaims] = useState(false)

    const loadUserVaults = useCallback(async () => {
        if (!walletAddress) return
        setIsDiscovering(true)
        try {
            const ids = await adapter.discoverVaults(walletAddress)
            
            // Also find vaults where user is beneficiary to show them in the list
            const claimables = await adapter.discoverClaimableVaults(walletAddress)
            const claimableIds = claimables.map(c => c.vaultId)
            
            // Merge and deduplicate
            const allIds = Array.from(new Set([...ids, ...claimableIds]))

            // Fetch states to filter released and determine roles
            const activeVaults: string[] = []
            const roles: Record<string, 'owner' | 'beneficiary'> = {}

            const states = await Promise.all(
                allIds.map(id => adapter.fetchVaultState(id).catch(() => null))
            )

            allIds.forEach((id, idx) => {
                const state = states[idx]
                if (!state || !state.released) {
                    activeVaults.push(id)
                }
                if (state && walletAddress) {
                    let isOwner = false
                    if (currentChain.type === 'solana') {
                        isOwner = state.owner === walletAddress
                    } else {
                        isOwner = state.owner.toUpperCase() === walletAddress.toUpperCase()
                    }
                    roles[id] = isOwner ? 'owner' : 'beneficiary'
                }
            })

            setUserVaults(activeVaults)
            setVaultRoles(roles)
            setClaimableVaults(claimables)

            // ONLY set selectedVaultId if none is currently selected 
            // This prevents the infinite loop when setSelectedVaultId is called
            if (activeVaults.length > 0) {
                setSelectedVaultId(prev => (prev === null ? activeVaults[0] : prev))
            }
        } catch (e) {
            console.error('Discovery error', e)
        } finally {
            setIsDiscovering(false)
        }
    }, [walletAddress, adapter, currentChain.type]) // Removed selectedVaultId from deps

    const scanForClaimableVaults = useCallback(async () => {
        if (!walletAddress) return
        setIsScanningClaims(true)
        try {
            const vaults = await adapter.discoverClaimableVaults(walletAddress)
            setClaimableVaults(vaults)
            
            // Sync userVaults if new ones are found
            setUserVaults(prev => {
                const currentIds = new Set(prev)
                const toAdd = vaults.map(v => v.vaultId).filter(id => !currentIds.has(id))
                return toAdd.length > 0 ? [...prev, ...toAdd] : prev
            })
        } catch (e) {
            console.error('Beneficiary scan error', e)
        } finally {
            setIsScanningClaims(false)
        }
    }, [walletAddress, adapter])

    // Reset on chain change
    useEffect(() => {
        setUserVaults([])
        setSelectedVaultId(null)
        setClaimableVaults([])
        setVaultRoles({})
    }, [currentChain.id])

    // Auto-scan on connect + every 60 seconds (increased from 30 to reduce load)
    useEffect(() => {
        if (walletAddress) {
            loadUserVaults()
            // scanForClaimableVaults() // Already covered in loadUserVaults
            const interval = setInterval(scanForClaimableVaults, 60000)
            return () => clearInterval(interval)
        } else {
            setUserVaults([])
            setSelectedVaultId(null)
            setClaimableVaults([])
            return undefined
        }
    }, [walletAddress, loadUserVaults, scanForClaimableVaults])

    const handleManualScan = useCallback(async () => {
        await loadUserVaults()
        // scanForClaimableVaults() // Already covered in loadUserVaults
    }, [loadUserVaults])

    return {
        userVaults,
        setUserVaults,
        selectedVaultId,
        setSelectedVaultId,
        claimableVaults,
        vaultRoles,
        isDiscovering,
        isScanningClaims,
        handleManualScan
    }
}
