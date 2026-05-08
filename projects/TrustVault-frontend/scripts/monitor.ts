import { TrustVaultSDK } from '../src/sdk/TrustVaultSDK';
import { getAllVaults } from '../src/utils/supabase';
import * as dotenv from 'dotenv';
import { chains } from '../src/config/chains';

// Load environment variables
dotenv.config();

/**
 * TrustVault Global Heartbeat Monitor
 * Scans all registered vaults and identifies those ready for release.
 */
async function runMonitor() {
    console.log('--- TrustVault Global Monitor Starting ---');
    
    try {
        const vaults = await getAllVaults();
        console.log(`Found ${vaults.length} vaults in registry.`);

        for (const vault of vaults) {
            try {
                const chain = chains.find(c => c.name.toLowerCase() === vault.chain_type.toLowerCase() || c.id === vault.chain_type);
                if (!chain) {
                    console.warn(`[Vault ${vault.vault_id}] Unknown chain type: ${vault.chain_type}`);
                    continue;
                }

                // Initialize SDK for this specific chain
                let sdk: TrustVaultSDK;
                if (chain.type === 'evm') {
                    sdk = TrustVaultSDK.forEVM(chain.testnet.rpcUrl);
                } else if (chain.type === 'solana') {
                    sdk = TrustVaultSDK.forSolana(chain.testnet.rpcUrl);
                } else {
                    // Algorand fallback
                    sdk = TrustVaultSDK.forAlgorand(chain.testnet.rpcUrl, '', '');
                }

                const isExpired = await sdk.isExpired(vault.vault_id);
                const status = isExpired ? '⚠️ EXPIRED' : '✅ ACTIVE';
                
                console.log(`[${vault.chain_type.toUpperCase()}] Vault ${vault.vault_id.slice(0, 8)}... | ${status} | Owner: ${vault.owner_address.slice(0, 6)}...`);

                if (isExpired) {
                    console.log(`  -> Ready for auto-release!`);
                    // In a production monitor, you would call sdk.autoRelease(vault.vault_id) here
                    // if you have a funded operator wallet.
                }
            } catch (err) {
                console.error(`[Vault ${vault.vault_id}] Failed to check status:`, err);
            }
        }
    } catch (err) {
        console.error('Monitor failed:', err);
    }

    console.log('--- Monitor Cycle Complete ---');
}

runMonitor();
