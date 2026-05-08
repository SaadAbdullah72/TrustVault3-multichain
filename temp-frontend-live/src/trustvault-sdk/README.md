# TrustVault SDK Core

Unified multi-chain SDK for decentralized inheritance.

## Installation

```bash
npm install @trustvault/sdk-core
```

## Usage

### Initialize
```typescript
import { TrustVaultSDK } from '@trustvault/sdk-core';

const sdk = TrustVaultSDK.forEVM(chainConfig);
```

### Create Vault
```typescript
const vaultId = await sdk.createVault({
  beneficiary: "0x...",
  lockDuration: 86400 * 30,
  depositAmount: 1.0
});
```

### Heartbeat
```typescript
await sdk.heartbeat(vaultId);
```

## Supported Chains
- Ethereum / EVM (Sepolia)
- Solana (Devnet)
- Algorand (Testnet)
