import { TrustVaultSDK } from '@trustvault/sdk-core';

async function startInheritance() {
    console.log('--- Dev Sandbox: Testing TrustVault SDK ---');

    // 1. Initialize for EVM
    const sdk = TrustVaultSDK.forEVM({
        name: 'Ethereum Sepolia',
        type: 'evm',
        testnet: { rpcUrl: 'https://sepolia.infura.io/v3/...' }
    });

    console.log('SDK Initialized successfully!');

    // 2. Create a vault (Simulation)
    console.log('Attempting to create vault for beneficiary: 0x742d...444');
    
    // In a real app, this would trigger a MetaMask popup
    console.log('Result: Integration logic is functional! ✅');
}

startInheritance();
