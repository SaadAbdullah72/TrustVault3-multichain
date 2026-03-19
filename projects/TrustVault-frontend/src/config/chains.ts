/**
 * Chain configuration registry for all supported blockchains.
 */

export type ChainType = 'algorand' | 'evm' | 'solana' | 'sui' | 'aptos'
export type ChainStatus = 'live' | 'coming-soon'

export interface ChainConfig {
    id: string
    name: string
    type: ChainType
    icon: string
    color: string
    status: ChainStatus
    testnet: {
        chainId?: number
        rpcUrl: string
        explorerUrl: string
        factoryAddress?: string
    }
    nativeCurrency: {
        name: string
        symbol: string
        decimals: number
    }
}

// ============================================================
// EVM CHAINS (16 chains)
// ============================================================

const ethereumSepolia: ChainConfig = {
    id: 'ethereum',
    name: 'Ethereum',
    type: 'evm',
    icon: '/chains/ethereum.svg',
    color: '#627EEA',
    status: 'live',
    testnet: {
        chainId: 11155111,
        rpcUrl: 'https://rpc.sepolia.org',
        explorerUrl: 'https://sepolia.etherscan.io',
        factoryAddress: '0x7335F7Fd143C41837B762f53B0904A5678eEc139',
    },
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
}

const polygonAmoy: ChainConfig = {
    id: 'polygon',
    name: 'Polygon',
    type: 'evm',
    icon: '/chains/polygon.svg',
    color: '#8247E5',
    status: 'live',
    testnet: {
        chainId: 80002,
        rpcUrl: 'https://rpc-amoy.polygon.technology',
        explorerUrl: 'https://amoy.polygonscan.com',
        factoryAddress: '0xea9fa0eaDb580337f39D8eDfF1cEBb694E9c6727',
    },
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
}

const bscTestnet: ChainConfig = {
    id: 'bsc',
    name: 'BNB Chain',
    type: 'evm',
    icon: '/chains/bsc.svg',
    color: '#F0B90B',
    status: 'live',
    testnet: {
        chainId: 97,
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        explorerUrl: 'https://testnet.bscscan.com',
    },
    nativeCurrency: { name: 'BNB', symbol: 'tBNB', decimals: 18 },
}

const arbitrumSepolia: ChainConfig = {
    id: 'arbitrum',
    name: 'Arbitrum',
    type: 'evm',
    icon: '/chains/arbitrum.svg',
    color: '#28A0F0',
    status: 'live',
    testnet: {
        chainId: 421614,
        rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
        explorerUrl: 'https://sepolia.arbiscan.io',
    },
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
}

const baseSepolia: ChainConfig = {
    id: 'base',
    name: 'Base',
    type: 'evm',
    icon: '/chains/base.svg',
    color: '#0052FF',
    status: 'live',
    testnet: {
        chainId: 84532,
        rpcUrl: 'https://sepolia.base.org',
        explorerUrl: 'https://sepolia.basescan.org',
    },
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
}

const avalancheFuji: ChainConfig = {
    id: 'avalanche',
    name: 'Avalanche',
    type: 'evm',
    icon: '/chains/avalanche.svg',
    color: '#E84142',
    status: 'live',
    testnet: {
        chainId: 43113,
        rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
        explorerUrl: 'https://testnet.snowtrace.io',
    },
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
}

const optimismSepolia: ChainConfig = {
    id: 'optimism',
    name: 'Optimism',
    type: 'evm',
    icon: '/chains/optimism.svg',
    color: '#FF0420',
    status: 'live',
    testnet: {
        chainId: 11155420,
        rpcUrl: 'https://sepolia.optimism.io',
        explorerUrl: 'https://sepolia-optimistic.etherscan.io',
    },
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
}

const fantomTestnet: ChainConfig = {
    id: 'fantom',
    name: 'Fantom',
    type: 'evm',
    icon: '/chains/fantom.svg',
    color: '#1969FF',
    status: 'live',
    testnet: {
        chainId: 4002,
        rpcUrl: 'https://rpc.testnet.fantom.network',
        explorerUrl: 'https://testnet.ftmscan.com',
    },
    nativeCurrency: { name: 'FTM', symbol: 'FTM', decimals: 18 },
}

const cronosTestnet: ChainConfig = {
    id: 'cronos',
    name: 'Cronos',
    type: 'evm',
    icon: '/chains/cronos.svg',
    color: '#002D74',
    status: 'live',
    testnet: {
        chainId: 338,
        rpcUrl: 'https://evm-t3.cronos.org',
        explorerUrl: 'https://cronos.org/explorer/testnet3',
    },
    nativeCurrency: { name: 'CRO', symbol: 'tCRO', decimals: 18 },
}

const celoAlfajores: ChainConfig = {
    id: 'celo',
    name: 'Celo',
    type: 'evm',
    icon: '/chains/celo.svg',
    color: '#35D07F',
    status: 'live',
    testnet: {
        chainId: 44787,
        rpcUrl: 'https://alfajores-forno.celo-testnet.org',
        explorerUrl: 'https://alfajores.celoscan.io',
    },
    nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
}

const gnosisChiado: ChainConfig = {
    id: 'gnosis',
    name: 'Gnosis',
    type: 'evm',
    icon: '/chains/gnosis.svg',
    color: '#04795B',
    status: 'live',
    testnet: {
        chainId: 10200,
        rpcUrl: 'https://rpc.chiadochain.net',
        explorerUrl: 'https://gnosis-chiado.blockscout.com',
    },
    nativeCurrency: { name: 'xDAI', symbol: 'xDAI', decimals: 18 },
}

const zkSyncSepolia: ChainConfig = {
    id: 'zksync',
    name: 'zkSync',
    type: 'evm',
    icon: '/chains/zksync.svg',
    color: '#8C8DFC',
    status: 'live',
    testnet: {
        chainId: 300,
        rpcUrl: 'https://sepolia.era.zksync.dev',
        explorerUrl: 'https://sepolia.explorer.zksync.io',
    },
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
}

const scrollSepolia: ChainConfig = {
    id: 'scroll',
    name: 'Scroll',
    type: 'evm',
    icon: '/chains/scroll.svg',
    color: '#FFEEDA',
    status: 'live',
    testnet: {
        chainId: 534351,
        rpcUrl: 'https://sepolia-rpc.scroll.io',
        explorerUrl: 'https://sepolia.scrollscan.com',
    },
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
}

const lineaSepolia: ChainConfig = {
    id: 'linea',
    name: 'Linea',
    type: 'evm',
    icon: '/chains/linea.svg',
    color: '#61DFFF',
    status: 'live',
    testnet: {
        chainId: 59141,
        rpcUrl: 'https://rpc.sepolia.linea.build',
        explorerUrl: 'https://sepolia.lineascan.build',
    },
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
}

const mantleTestnet: ChainConfig = {
    id: 'mantle',
    name: 'Mantle',
    type: 'evm',
    icon: '/chains/mantle.svg',
    color: '#000000',
    status: 'live',
    testnet: {
        chainId: 5003,
        rpcUrl: 'https://rpc.sepolia.mantle.xyz',
        explorerUrl: 'https://sepolia.mantlescan.xyz',
    },
    nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
}

const blastSepolia: ChainConfig = {
    id: 'blast',
    name: 'Blast',
    type: 'evm',
    icon: '/chains/blast.svg',
    color: '#FCFC03',
    status: 'live',
    testnet: {
        chainId: 168587773,
        rpcUrl: 'https://sepolia.blast.io',
        explorerUrl: 'https://sepolia.blastscan.io',
    },
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
}

// ============================================================
// NON-EVM CHAINS
// ============================================================

const algorand: ChainConfig = {
    id: 'algorand',
    name: 'Algorand',
    type: 'algorand',
    icon: '/chains/algorand.svg',
    color: '#000000',
    status: 'live',
    testnet: {
        rpcUrl: 'https://testnet-api.algonode.cloud',
        explorerUrl: 'https://testnet.explorer.perawallet.app',
    },
    nativeCurrency: { name: 'Algo', symbol: 'ALGO', decimals: 6 },
}

const solana: ChainConfig = {
    id: 'solana',
    name: 'Solana',
    type: 'solana',
    icon: '/chains/solana.svg',
    color: '#9945FF',
    status: 'live',
    testnet: {
        rpcUrl: 'https://api.testnet.solana.com',
        explorerUrl: 'https://explorer.solana.com/address/{address}?cluster=testnet',
        factoryAddress: '9CHePjTYinAK5hZ8xHyN3RcT1TavQg1oVsYto4C3PKQg'
    },
    nativeCurrency: { name: 'SOL', symbol: 'SOL', decimals: 9 },
}

const sui: ChainConfig = {
    id: 'sui',
    name: 'Sui',
    type: 'sui',
    icon: '/chains/sui.svg',
    color: '#4DA2FF',
    status: 'coming-soon',
    testnet: {
        rpcUrl: 'https://fullnode.testnet.sui.io',
        explorerUrl: 'https://suiexplorer.com/?network=testnet',
    },
    nativeCurrency: { name: 'SUI', symbol: 'SUI', decimals: 9 },
}

const aptos: ChainConfig = {
    id: 'aptos',
    name: 'Aptos',
    type: 'aptos',
    icon: '/chains/aptos.svg',
    color: '#2DD8A3',
    status: 'coming-soon',
    testnet: {
        rpcUrl: 'https://fullnode.testnet.aptoslabs.com/v1',
        explorerUrl: 'https://explorer.aptoslabs.com/?network=testnet',
    },
    nativeCurrency: { name: 'APT', symbol: 'APT', decimals: 8 },
}

// ============================================================
// EXPORTS
// ============================================================

export const SUPPORTED_CHAINS: ChainConfig[] = [
    // Non-EVM (featured)
    algorand,
    solana,
    sui,
    aptos,
    // EVM
    ethereumSepolia,
    polygonAmoy,
    bscTestnet,
    arbitrumSepolia,
    baseSepolia,
    avalancheFuji,
    optimismSepolia,
    fantomTestnet,
    cronosTestnet,
    celoAlfajores,
    gnosisChiado,
    zkSyncSepolia,
    scrollSepolia,
    lineaSepolia,
    mantleTestnet,
    blastSepolia,
]

export const DEFAULT_CHAIN = algorand

export const getChainById = (id: string): ChainConfig | undefined =>
    SUPPORTED_CHAINS.find(c => c.id === id)

export const getChainsByType = (type: ChainType): ChainConfig[] =>
    SUPPORTED_CHAINS.filter(c => c.type === type)

export const getLiveChains = (): ChainConfig[] =>
    SUPPORTED_CHAINS.filter(c => c.status === 'live')

export const getEVMChains = (): ChainConfig[] =>
    SUPPORTED_CHAINS.filter(c => c.type === 'evm')
