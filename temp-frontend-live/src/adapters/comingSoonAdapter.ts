/**
 * Coming Soon adapter — placeholder for chains not yet implemented.
 * Used for Solana, Sui, Aptos until their smart contracts are deployed.
 */
import { ChainAdapter, VaultState, ClaimableVault } from './types'

export class ComingSoonAdapter implements ChainAdapter {
    readonly chainType: string
    private chainName: string

    constructor(chainType: string, chainName: string) {
        this.chainType = chainType
        this.chainName = chainName
    }

    private fail(): never {
        throw new Error(`${this.chainName} integration is coming soon! Stay tuned.`)
    }

    async connect(): Promise<string> { this.fail() }
    async disconnect(): Promise<void> { }
    getActiveAddress(): string | null { return null }
    isConnected(): boolean { return false }

    async createVault(): Promise<string> { this.fail() }
    async heartbeat(): Promise<string> { this.fail() }
    async withdraw(): Promise<string> { this.fail() }
    async autoRelease(): Promise<string> { this.fail() }
    async deposit(): Promise<string> { this.fail() }

    async fetchVaultState(): Promise<VaultState | null> { return null }
    async getVaultBalance(): Promise<number> { return 0 }
    getVaultAddress(vaultId: string): string { return vaultId }

    async discoverVaults(): Promise<string[]> { return [] }
    async discoverClaimableVaults(): Promise<ClaimableVault[]> { return [] }
}
