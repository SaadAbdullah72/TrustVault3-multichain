import { ChainAdapter, VaultState, ClaimableVault } from '../adapters/types';
import { EthereumAdapter } from '../adapters/evmAdapter';
import { SolanaAdapter } from '../adapters/solanaAdapter';
import { AlgorandAdapter } from '../adapters/algorandAdapter';

/**
 * TrustVault SDK
 * Unified interface for decentralized inheritance across all supported chains.
 */
export class TrustVaultSDK {
    private adapter: ChainAdapter;

    constructor(adapter: ChainAdapter) {
        this.adapter = adapter;
    }

    /**
     * Initialize the SDK for a specific chain.
     */
    static forEVM(rpcUrl: string, provider?: any): TrustVaultSDK {
        return new TrustVaultSDK(new EthereumAdapter(rpcUrl, provider));
    }

    static forSolana(rpcUrl: string): TrustVaultSDK {
        return new TrustVaultSDK(new SolanaAdapter(rpcUrl));
    }

    static forAlgorand(server: string, port: string, token: string): TrustVaultSDK {
        return new TrustVaultSDK(new AlgorandAdapter(server, port, token));
    }

    // ============ Core Operations ============

    async createVault(params: {
        beneficiary: string;
        lockDuration: number;
        depositAmount: number;
        vaultName?: string;
        onStatus?: (msg: string) => void;
    }): Promise<string> {
        return this.adapter.createVault(
            params.beneficiary,
            params.lockDuration,
            params.depositAmount,
            params.onStatus,
            params.vaultName
        );
    }

    async heartbeat(vaultId: string): Promise<string> {
        return this.adapter.heartbeat(vaultId);
    }

    async withdraw(vaultId: string, amount: number): Promise<string> {
        return this.adapter.withdraw(vaultId, amount);
    }

    async autoRelease(vaultId: string): Promise<string> {
        return this.adapter.autoRelease(vaultId);
    }

    // ============ Monitoring & State ============

    async getVaultState(vaultId: string): Promise<VaultState | null> {
        return this.adapter.fetchVaultState(vaultId);
    }

    async getBalance(vaultId: string): Promise<number> {
        return this.adapter.getVaultBalance(vaultId);
    }

    async isExpired(vaultId: string): Promise<boolean> {
        const state = await this.getVaultState(vaultId);
        if (!state) return false;
        
        const now = Math.floor(Date.now() / 1000);
        return !state.released && (now > state.lastHeartbeat + state.lockDuration);
    }

    /**
     * Scans for vaults that are ready to be released.
     * Useful for building a "Global Heartbeat Monitor".
     */
    async findReleasable(vaultIds: string[]): Promise<string[]> {
        const releasable: string[] = [];
        for (const id of vaultIds) {
            if (await this.isExpired(id)) {
                releasable.push(id);
            }
        }
        return releasable;
    }

    getAdapter(): ChainAdapter {
        return this.adapter;
    }
}
