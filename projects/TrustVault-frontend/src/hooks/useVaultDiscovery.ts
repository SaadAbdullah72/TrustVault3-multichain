import { useState, useCallback, useEffect } from 'react'
import {
    discoverAllRelatedVaults,
    discoverBeneficiaryVaults,
    fetchVaultState,
    ClaimableVault
} from '../utils/algorand'

export const useVaultDiscovery = (activeAddress: string | null) => {
    const [userVaults, setUserVaults] = useState<bigint[]>([])
    const [selectedAppId, setSelectedAppId] = useState<bigint | null>(null)
    const [claimableVaults, setClaimableVaults] = useState<ClaimableVault[]>([])
    const [vaultRoles, setVaultRoles] = useState<Record<string, 'owner' | 'beneficiary'>>({})
    const [isDiscovering, setIsDiscovering] = useState(false)
    const [isScanningClaims, setIsScanningClaims] = useState(false)

    const loadUserVaults = useCallback(async () => {
        if (!activeAddress) return
        setIsDiscovering(true)
        try {
            const ids = await discoverAllRelatedVaults(activeAddress)

            // Filter out released/dead vaults
            const activeVaults: bigint[] = []
            const states = await Promise.all(
                ids.map(id => fetchVaultState(id).catch(() => null))
            )

            const roles: Record<string, 'owner' | 'beneficiary'> = {}

            ids.forEach((id, idx) => {
                const state = states[idx]
                if (!state || !state.released) {
                    activeVaults.push(id)
                }
                if (state) {
                    roles[id.toString()] = state.owner.toUpperCase() === activeAddress.toUpperCase() ? 'owner' : 'beneficiary'
                }
            })

            setUserVaults(activeVaults)
            setVaultRoles(roles)
            localStorage.setItem(`trustvault_ids_${activeAddress}`, JSON.stringify(activeVaults.map(id => id.toString())))

            if (activeVaults.length > 0 && selectedAppId === null) {
                setSelectedAppId(activeVaults[0])
            }
        } catch (e) {
            console.error('Discovery error', e)
        } finally {
            setIsDiscovering(false)
        }
    }, [activeAddress, selectedAppId])

    const scanForClaimableVaults = useCallback(async () => {
        if (!activeAddress) return
        setIsScanningClaims(true)
        try {
            const vaults = await discoverBeneficiaryVaults(activeAddress)
            setClaimableVaults(vaults)
        } catch (e) {
            console.error('Beneficiary scan error', e)
        } finally {
            setIsScanningClaims(false)
        }
    }, [activeAddress])

    // Auto-scan on connect + every 30 seconds
    useEffect(() => {
        if (activeAddress) {
            loadUserVaults()
            scanForClaimableVaults()
            const interval = setInterval(scanForClaimableVaults, 30000)
            return () => clearInterval(interval)
        } else {
            setUserVaults([])
            setSelectedAppId(null)
            setClaimableVaults([])
            return undefined
        }
    }, [activeAddress, loadUserVaults, scanForClaimableVaults])

    const handleManualScan = useCallback(async () => {
        await loadUserVaults()
        await scanForClaimableVaults()
    }, [loadUserVaults, scanForClaimableVaults])

    return {
        userVaults,
        setUserVaults,
        selectedAppId,
        setSelectedAppId,
        claimableVaults,
        setClaimableVaults,
        vaultRoles,
        setVaultRoles,
        isDiscovering,
        isScanningClaims,
        loadUserVaults,
        scanForClaimableVaults,
        handleManualScan
    }
}
