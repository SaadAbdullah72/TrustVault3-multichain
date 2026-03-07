<p align="center">
  <img src="projects/TrustVault-frontend/public/logo.svg" alt="TrustVault Logo" width="120" height="120" />
</p>

<h1 align="center">🛡️ TrustVault — Autonomous Inheritance Protocol</h1>

<p align="center">
  <strong>Decentralized, trustless, and fully autonomous digital asset inheritance on the Algorand blockchain.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#smart-contract">Smart Contract</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Algorand-Blockchain-black?style=for-the-badge&logo=algorand&logoColor=white" alt="Algorand" />
  <img src="https://img.shields.io/badge/PyTEAL-Smart%20Contract-blue?style=for-the-badge&logo=python&logoColor=white" alt="PyTEAL" />
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-Typed-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/AlgoKit-CLI-00DC82?style=for-the-badge" alt="AlgoKit" />
  <img src="https://img.shields.io/badge/AVM-v8-purple?style=for-the-badge" alt="AVM v8" />
</p>

---

## 🔍 Overview

**TrustVault** is a fully decentralized **autonomous inheritance protocol** deployed on the Algorand blockchain. It solves the critical problem of **digital asset transfer upon death or prolonged inactivity** — without relying on any centralized intermediary, lawyer, or third-party custodian.

The protocol operates on a simple but powerful **Dead Man's Switch** mechanism:

> 💀 If the vault owner stops sending periodic **heartbeat** signals within a configurable time window, the smart contract autonomously releases all locked funds to the pre-designated **beneficiary**.

No oracles. No trusted third parties. Pure on-chain logic.

---

## ✨ Features

### 🔐 Core Protocol
- **🏦 Vault Creation** — Deploy a personal inheritance vault with a single transaction
- **💓 Heartbeat Mechanism** — Owner periodically signals "I'm alive" to reset the inactivity timer
- **⏰ Configurable Lock Duration** — Set custom inactivity periods (minutes, hours, days, months)
- **🔓 Autonomous Release** — Smart contract auto-releases funds to beneficiary when the timer expires
- **💸 Owner Withdrawals** — Vault owner can freely withdraw funds while active
- **📥 Deposit Anytime** — Anyone can deposit ALGO into a vault at any time

### 🌐 Frontend Application
- **🎨 Premium UI** — Dark-themed glassmorphic interface with neural network animated background
- **🔗 Wallet Integration** — Supports Pera, Defly, Exodus, Daffi, and KMD wallets via `use-wallet`
- **📡 Auto-Discovery** — Automatically scans the blockchain to discover vaults linked to your address
- **🎯 Beneficiary Detection** — Auto-detects if you are a beneficiary of any claimable vaults
- **⚡ Real-time Updates** — Live countdown timers, balance tracking, and vault status monitoring
- **📱 Fully Responsive** — Optimized for desktop, tablet, and mobile devices
- **☁️ Cloud Registry** — Vault metadata stored on Supabase for cross-device vault discovery

### 🛡️ Security
- **Zero-Trust Architecture** — No admin keys, no backdoors, no upgrade paths
- **On-Chain Verification** — All operations validated by AVM bytecode
- **Owner-Only Operations** — Only the vault creator can heartbeat or withdraw
- **Immutable Beneficiary** — Once set during bootstrap, the beneficiary cannot be changed

---

## 🏗️ Architecture

```
TrustVault/
├── projects/
│   ├── TrustVault-contracts/          # Smart Contract (PyTEAL)
│   │   └── smart_contracts/
│   │       └── trust_vault/
│   │           ├── contract.py        # Core vault logic (AVM v8)
│   │           ├── deploy.py          # Deployment script
│   │           └── deploy_config.py   # Network configuration
│   │
│   └── TrustVault-frontend/           # React Frontend (TypeScript)
│       └── src/
│           ├── pages/
│           │   └── VaultPage.tsx       # Main vault dashboard (725 lines)
│           ├── components/
│           │   ├── NeuralBackground.tsx   # Animated canvas background
│           │   ├── Countdown.tsx          # Live countdown timer
│           │   ├── VaultStatus.tsx        # Vault status indicator
│           │   ├── ConnectWallet.tsx      # Wallet connection modal
│           │   └── ...
│           └── utils/
│               ├── algorand.ts         # Blockchain interaction layer
│               ├── supabase.ts         # Cloud registry functions
│               └── constants.ts        # App configuration
│
├── artifacts/                          # Compiled TEAL bytecode
│   ├── approval.teal                   # Approval program
│   ├── clear.teal                      # Clear state program
│   └── contract.json                   # ABI contract spec
│
└── .github/workflows/                  # CI/CD pipelines
```

---

## 📜 Smart Contract

The `AutoInheritanceVault` contract is written in **PyTEAL** and compiled to **AVM v8 bytecode** (TEAL). It implements 5 core methods:

| Method | Access | Description |
|--------|--------|-------------|
| `bootstrap(beneficiary, lock_duration)` | Creator | Initialize vault with beneficiary address and inactivity timer |
| `deposit()` | Anyone | Deposit ALGO into the vault |
| `heartbeat()` | Owner Only | Reset the inactivity timer ("I'm still alive") |
| `withdraw(amount)` | Owner Only | Withdraw a specific amount of ALGO |
| `auto_release()` | Anyone | Trigger autonomous fund release when timer expires |

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

- [Python 3.12+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (for LocalNet)
- [AlgoKit CLI 2.0+](https://github.com/algorandfoundation/algokit-cli#install)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SaadAbdullah72/TrustVault3.git
cd TrustVault3

# 2. Bootstrap all dependencies
algokit project bootstrap all

# 3. Setup environment for LocalNet
cd projects/TrustVault-contracts
algokit generate env-file -a target_network localnet

# 4. Start local Algorand network
algokit localnet start

# 5. Build smart contracts
algokit project run build

# 6. Start frontend dev server
cd ../TrustVault-frontend
npm run dev
```

### Quick Deploy to TestNet

```bash
# Set up TestNet environment
algokit generate env-file -a target_network testnet

# Deploy contracts
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
