<p align="center">
  <img src="projects/TrustVault-frontend/public/logo.svg" alt="TrustVault Logo" width="120" height="120" />
</p>

<h1 align="center">🛡️ TrustVault³ — Multichain Inheritance Protocol</h1>

<p align="center">
  <strong>Decentralized, trustless, and fully autonomous digital asset inheritance across Algorand, Solana, and EVM chains.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#smart-contracts">Smart Contracts</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Algorand-Blockchain-black?style=for-the-badge&logo=algorand&logoColor=white" alt="Algorand" />
  <img src="https://img.shields.io/badge/Solana-Blockchain-9945FF?style=for-the-badge&logo=solana&logoColor=white" alt="Solana" />
  <img src="https://img.shields.io/badge/Ethereum-EVM-blue?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum" />
  <img src="https://img.shields.io/badge/Anchor-Solana%20Framework-00DC82?style=for-the-badge" alt="Anchor" />
  <img src="https://img.shields.io/badge/TypeScript-Typed-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

## 🔍 Overview

**TrustVault³** is a fully decentralized **multichain autonomous inheritance protocol**. It solves the critical problem of **digital asset transfer upon death or prolonged inactivity** — without relying on any centralized intermediary, lawyer, or third-party custodian.

The protocol operates on a simple but powerful **Dead Man's Switch** mechanism:

> 💀 If the vault owner stops sending periodic **heartbeat** signals within a configurable time window, the smart contract autonomously releases all locked funds to the pre-designated **beneficiary**.

### Supported Ecosystems
- **Algorand**: PyTEAL Contracts (AVM v8)
- **Solana**: Anchor/Rust Programs (PDA Architecture)
- **EVM (Coming Soon)**: Solidity Smart Contracts

---

## ✨ Features

### 🔐 Core Protocol
- **🏦 Multichain Vaults** — Deploy inheritance vaults on Algorand and Solana.
- **💓 Heartbeat Mechanism** — Owner periodically signals "I'm alive" to reset the inactivity timer.
- **⏰ Flexible Timers** — Set custom inactivity periods from minutes to years.
- **🔓 Autonomous Release** — Smart contracts auto-release funds to beneficiary when the timer expires.
- **💸 Non-Custodial** — Owner retains full control and withdrawal rights while active.
- **📥 Open Deposits** — Anyone can contribute to a vault's legacy.

### 🌐 Frontend Application
- **🎨 Premium UI** — Dark-themed glassmorphic interface with neural network animated background
- **🔗 Wallet Integration** — Supports Pera, Defly, Exodus, Daffi, and KMD wallets via `use-wallet`
- **📡 Auto-Discovery** — Automatically scans the blockchain to discover vaults linked to your address
- **🎯 Beneficiary Detection** — Auto-detects if you are a beneficiary of any claimable vaults
- **⚡ Real-time Updates** — Live countdown timers, balance tracking, and vault status monitoring
- **📱 Fully Responsive** — Optimized for desktop, tablet, and mobile devices
- **☁️ Cloud Registry** — Vault metadata stored on Supabase for cross-device vault discovery

### 🛡️ Security
- **Zero-Trust Architecture** — No admin keys, no backdoors, no upgrade paths.
- **On-Chain Verification** — All operations validated by native blockchain bytecode (TEAL/Solana BPF).
- **Owner-Only Operations** — Only the vault creator can heartbeat or withdraw funds.
- **Immutable Beneficiary** — Once set during bootstrap, the beneficiary cannot be changed.

---

## 🏗️ Architecture

```
TrustVault/
├── projects/
│   ├── TrustVault-contracts/          # Algorand Smart Contracts (PyTEAL)
│   │   └── smart_contracts/
│   │       └── trust_vault/
│   │           ├── contract.py        # Core vault logic (AVM v8)
│   │           └── deploy.py          # Deployment script
│   │
│   ├── solana/                         # Solana Programs (Anchor/Rust)
│   │   ├── programs/trust_vault/src/lib.rs # Program logic
│   │   └── Anchor.toml                # Anchor configuration
│   │
│   └── TrustVault-frontend/           # Unified React Frontend (TypeScript)
│       └── src/
│           ├── adapters/               # Chain-agnostic adapters
│           │   ├── algorandAdapter.ts
│           │   └── solanaAdapter.ts
│           ├── contexts/
│           │   └── ChainContext.tsx    # Multichain state provider
│           └── pages/
│               └── VaultPage.tsx       # Unified dashboard
│
├── artifacts/                          # Compiled contract artifacts
└── .github/workflows/                  # CI/CD pipelines
```

---

## 📜 Smart Contracts

### Algorand (PyTEAL)
The vault logic is implemented in **PyTEAL** and compiled to AVM v8 bytecode. It manages state via Global State on the account.

### Solana (Anchor/Rust)
Implemented using the **Anchor Framework**. It uses **Program Derived Addresses (PDAs)** to store vault data securely, mapped to the owner's public key.

| Method | Access | Description |
|--------|--------|-------------|
| `initialize` | Creator | (Solana) Create vault PDA and set beneficiary/timer |
| `bootstrap` | Creator | (Algorand) Initialize vault state |
| `heartbeat` | Owner Only | Reset the inactivity timer |
| `withdraw` | Owner Only | Withdraw funds from the vault |
| `auto_release` | Anyone | Trigger fund release to beneficiary |

### Global State Schema

| Key | Type | Description |
|-----|------|-------------|
| `Owner` | Address | Vault creator / heartbeat sender |
| `Beneficiary` | Address | Designated inheritor |
| `LockDuration` | Uint64 | Inactivity window in seconds |
| `LastHeartbeat` | Uint64 | Timestamp of last heartbeat |
| `Released` | Uint64 | Boolean flag (0 = active, 1 = released) |

### Release Logic

```
IF (current_time >= last_heartbeat + lock_duration) AND (released == 0):
    → Transfer ALL vault funds to Beneficiary
    → Mark as Released
```

---

## ⚙️ Tech Stack

### Smart Contract Layer
| Technology | Purpose |
|-----------|---------|
| [Algorand](https://www.algorand.com/) | Layer-1 blockchain with instant finality |
| [PyTEAL](https://pyteal.readthedocs.io/) | Python-to-TEAL smart contract compiler |
| [AlgoKit CLI](https://github.com/algorandfoundation/algokit-cli) | Development toolkit for Algorand |
| [AVM v8](https://developer.algorand.org/docs/get-details/dapps/avm/) | Algorand Virtual Machine |

### Frontend Layer
| Technology | Purpose |
|-----------|---------|
| [React 18](https://reactjs.org/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [daisyUI](https://daisyui.com/) | Component library |
| [use-wallet](https://github.com/txnlab/use-wallet) | Multi-wallet integration |
| [Lucide Icons](https://lucide.dev/) | Modern icon system |
| [Supabase](https://supabase.com/) | Cloud vault registry |
| [algosdk](https://github.com/algorand/js-algorand-sdk) | Algorand SDK for JavaScript |

### Dev & CI/CD
| Technology | Purpose |
|-----------|---------|
| [Poetry](https://python-poetry.org/) | Python dependency management |
| [Jest](https://jestjs.io/) | Unit testing |
| [Playwright](https://playwright.dev/) | E2E browser testing |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipelines |
| [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) | Code quality |
| [Black](https://github.com/psf/black) + [Ruff](https://github.com/charliermarsh/ruff) | Python formatting & linting |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Rust](https://www.rust-lang.org/tools/install) (for Solana programs)
- [Solana CLI](https://docs.solana.com/working-with-solana/install-solana-cli-tools)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)
- [AlgoKit CLI](https://github.com/algorandfoundation/algokit-cli) (for Algorand)
- [Docker](https://www.docker.com/) (for Algorand LocalNet)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SaadAbdullah72/TrustVault3-multichain.git
cd TrustVault3-multichain

# 2. Setup Algorand (Optional)
algokit project bootstrap all

# 3. Setup Solana
cd projects/solana
anchor build

# 4. Start Frontend
cd ../TrustVault-frontend
npm install
npm run dev
```

### Deployment

#### Solana
```bash
cd projects/solana
anchor deploy --provider.cluster testnet
```

#### Algorand
```bash
algokit project deploy testnet
```

---

## 🔄 How It Works

```
                    ┌─────────────────────────────────────────┐
                    │          TRUSTVAULT PROTOCOL             │
                    └─────────────────────────────────────────┘

  ┌──────────┐         bootstrap()          ┌──────────────────┐
  │  OWNER   │ ─────────────────────────── ▶│  SMART CONTRACT  │
  │ (Alive)  │         heartbeat()          │  (On-Chain)      │
  │          │ ─────── resets timer ──────▶ │                  │
  │          │         withdraw()           │  Global State:   │
  │          │ ─────── pulls funds ──────▶ │  • Owner         │
  └──────────┘                              │  • Beneficiary   │
                                            │  • LockDuration  │
                                            │  • LastHeartbeat  │
  ┌──────────┐                              │  • Released      │
  │BENEFICIARY│        auto_release()       │                  │
  │ (Heir)    │◀─── timer expired ─────── │                  │
  │          │    all funds transferred     │                  │
  └──────────┘                              └──────────────────┘

  Timeline:
  ═══════════════════════════════════════════════════════════════
  │ heartbeat │ heartbeat │ heartbeat │         ...silence...    │ AUTO RELEASE ▶ Funds → Beneficiary
  ═══════════════════════════════════════════════════════════════
              ▲                       ▲                          ▲
         timer reset             timer reset               timer expires
```

1. **Owner creates a vault** → Sets beneficiary address + inactivity duration
2. **Owner sends heartbeats** → Periodically confirms they are active
3. **If owner goes silent** → Timer counts down
4. **Timer expires** → Anyone can trigger `auto_release()`
5. **Funds are transferred** → All ALGO moves to the beneficiary on-chain

---

## 🔮 Use Cases

| Scenario | How TrustVault Helps |
|----------|---------------------|
| 🏦 **Crypto Inheritance** | Pass digital assets to family members without lawyers |
| 🔒 **Dead Man's Switch** | Automatically release sensitive data/funds if you go inactive |
| 📋 **Estate Planning** | Decentralized will execution with zero intermediaries |
| 🏢 **DAO Treasury** | Fallback fund release for organizational continuity |
| 💼 **Business Continuity** | Auto-transfer operational funds to partners if founder goes silent |

---

## 🧪 Testing

```bash
# Run smart contract unit tests
cd projects/TrustVault-contracts
algokit project run test

# Run frontend tests
cd projects/TrustVault-frontend
npm test

# Run E2E tests
npx playwright test
```

---

## 📦 Deployment

### CI/CD Pipeline (GitHub Actions)

| Trigger | Actions |
|---------|---------|
| Push to `main` | Lint → Test → Build → Deploy to TestNet |
| Pull Request | Lint → Test → Build → Output Stability Check |

### Manual Deployment

```bash
# Deploy to TestNet
algokit project deploy testnet

# Deploy frontend (Vercel/Netlify)
cd projects/TrustVault-frontend
npm run build
# Deploy the `dist/` folder to your hosting provider
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built with 💜 on Algorand</strong>
  <br />
  <sub>TrustVault — Because your legacy deserves trustless security.</sub>
</p>
