/**
 * Unified ChainAdapter interface.
 * All chain adapters (Algorand, EVM, Solana, Sui, Aptos) implement this.
 */

export interface VaultState {
    owner: string
    beneficiary: string
    lockDuration: number
    lastHeartbeat: number
    released: boolean
}

export interface ClaimableVault {
    vaultId: string
    state: VaultState
}

export interface ChainAdapter {
    /** Chain type identifier */
    readonly chainType: string

    // ============ Wallet ============

    /** Connect wallet and return active address */
    connect(): Promise<string>

    /** Disconnect wallet */
    disconnect(): Promise<void>

    /** Get currently connected address or null */
    getActiveAddress(): string | null

    /** Check if wallet is connected */
    isConnected(): boolean

    // ============ Vault Operations ============

    /**
     * Deploy a new vault, bootstrap it with beneficiary and lock duration,
     * and optionally fund it.
     * Returns the vault identifier (app ID for Algorand, contract address for EVM, etc.)
     */
    createVault(
        beneficiary: string,
        lockDuration: number,
        depositAmount: number,
        onStatus?: (msg: string) => void
    ): Promise<string>

    /** Send heartbeat to reset inactivity timer */
    heartbeat(vaultId: string): Promise<string>

    /** Withdraw amount from vault (in native currency units, e.g. 1.5 ALGO/ETH) */
    withdraw(vaultId: string, amount: number): Promise<string>

    /** Trigger auto-release when timer has expired */
    autoRelease(vaultId: string): Promise<string>

    /** Deposit native currency into vault */
    deposit(vaultId: string, amount: number): Promise<string>

    // ============ State Reading ============

    /** Fetch vault on-chain state */
    fetchVaultState(vaultId: string): Promise<VaultState | null>

    /** Get vault balance in native currency */
    getVaultBalance(vaultId: string): Promise<number>

    /** Get the on-chain address of a vault */
    getVaultAddress(vaultId: string): string

    // ============ Discovery ============

    /** Discover all vaults related to the connected address */
    discoverVaults(address: string): Promise<string[]>

    /** Discover vaults that the address can claim as beneficiary */
    discoverClaimableVaults(address: string): Promise<ClaimableVault[]>
}
