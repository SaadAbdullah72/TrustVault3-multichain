/**
 * ChainContext — provides multichain state to the entire app.
 * Manages current chain, adapter instance, and wallet state.
 */
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { ChainConfig, SUPPORTED_CHAINS, DEFAULT_CHAIN, getChainById } from '../config/chains'
import { ChainAdapter } from '../adapters/types'
import { AlgorandAdapter } from '../adapters/algorandAdapter'
import { EVMAdapter } from '../adapters/evmAdapter'
import { SolanaAdapter } from '../adapters/solanaAdapter'
import { ComingSoonAdapter } from '../adapters/comingSoonAdapter'

interface ChainContextType {
    currentChain: ChainConfig
    adapter: ChainAdapter
    supportedChains: ChainConfig[]
    switchChain: (chainId: string) => void
    walletAddress: string | null
    isConnected: boolean
    connectWallet: () => Promise<void>
    disconnectWallet: () => Promise<void>
}

const ChainContext = createContext<ChainContextType | null>(null)

// Singleton adapter instances (cached per chain id)
const adapterCache: Record<string, ChainAdapter> = {}

function getOrCreateAdapter(chain: ChainConfig): ChainAdapter {
    if (adapterCache[chain.id]) return adapterCache[chain.id]

    let adapter: ChainAdapter

    switch (chain.type) {
        case 'algorand':
            adapter = new AlgorandAdapter()
            break
        case 'evm':
            adapter = new EVMAdapter(chain)
            break
        case 'solana':
            adapter = new SolanaAdapter(chain)
            break
        case 'sui':
            adapter = new ComingSoonAdapter('sui', 'Sui')
            break
        case 'aptos':
            adapter = new ComingSoonAdapter('aptos', 'Aptos')
            break
        default:
            adapter = new ComingSoonAdapter(chain.type, chain.name)
    }

    adapterCache[chain.id] = adapter
    return adapter
}

export function ChainProvider({ children }: { children: React.ReactNode }) {
    const [currentChainId, setCurrentChainId] = useState<string>(() => {
        // Restore last used chain from localStorage
        if (typeof window !== 'undefined') {
            return localStorage.getItem('trustvault_chain') || DEFAULT_CHAIN.id
        }
        return DEFAULT_CHAIN.id
    })

    // Algorand wallet context (used when chain type is 'algorand')
    const { wallets, activeAddress, transactionSigner } = useWallet()

    // Solana wallet context
    const solanaWallet = useSolanaWallet()
    const { setVisible: setSolanaModalVisible } = useWalletModal()

    const currentChain = useMemo(() =>
        getChainById(currentChainId) || DEFAULT_CHAIN, [currentChainId]
    )

    const adapter = useMemo(() =>
        getOrCreateAdapter(currentChain), [currentChain]
    )

    // Sync Algorand wallet context to adapter
    useEffect(() => {
        if (adapter instanceof AlgorandAdapter) {
            adapter.setWalletContext(wallets, activeAddress ?? null, transactionSigner)
        }
    }, [adapter, wallets, activeAddress, transactionSigner])

    // Sync Solana wallet context to adapter
    useEffect(() => {
        if (adapter instanceof SolanaAdapter) {
            adapter.setExternalWallet(solanaWallet)
        }
    }, [adapter, solanaWallet])

    // Track EVM wallet address
    const [evmAddress, setEvmAddress] = useState<string | null>(null)

    // Initial load for EVM address
    useEffect(() => {
        if (currentChain.type === 'evm' && typeof window !== 'undefined' && (window as any).ethereum) {
            (window as any).ethereum.request({ method: 'eth_accounts' })
                .then((accounts: string[]) => {
                    if (accounts.length > 0) {
                        setEvmAddress(accounts[0])
                    }
                })
                .catch(console.error)
        }
    }, [currentChain.type])

    // Listen for MetaMask account changes
    useEffect(() => {
        if (typeof window === 'undefined' || !(window as any).ethereum) return
        const handleAccountsChanged = (accounts: string[]) => {
            if (currentChain.type === 'evm') {
                setEvmAddress(accounts[0] || null)
            }
        }
        const handleChainChanged = () => {
            // Reload on chain change from MetaMask
            if (currentChain.type === 'evm') {
                window.location.reload()
            }
        }
        ;(window as any).ethereum.on('accountsChanged', handleAccountsChanged)
        ;(window as any).ethereum.on('chainChanged', handleChainChanged)
        return () => {
            ;(window as any).ethereum?.removeListener('accountsChanged', handleAccountsChanged)
            ;(window as any).ethereum?.removeListener('chainChanged', handleChainChanged)
        }
    }, [currentChain.type])

    // Derive wallet address based on chain type
    const walletAddress = useMemo(() => {
        if (currentChain.type === 'algorand') return activeAddress ?? null
        if (currentChain.type === 'evm') return evmAddress
        if (currentChain.type === 'solana') return solanaWallet.publicKey?.toString() ?? null
        return null
    }, [currentChain.type, activeAddress, evmAddress, solanaWallet.publicKey])

    const isConnected = !!walletAddress

    const switchChain = useCallback((chainId: string) => {
        setCurrentChainId(chainId)
        if (typeof window !== 'undefined') {
            localStorage.setItem('trustvault_chain', chainId)
        }
        // Reset EVM address when switching away from EVM
        const newChain = getChainById(chainId)
        if (newChain?.type !== 'evm') {
            setEvmAddress(null)
        }
    }, [])

    const connectWallet = useCallback(async () => {
        if (currentChain.type === 'algorand') {
            // Use Algorand adapter's connect (internally uses Pera etc.)
            const algoAdapter = adapter as AlgorandAdapter
            await algoAdapter.connect()
        } else if (currentChain.type === 'evm') {
            const address = await adapter.connect()
            setEvmAddress(address)
        } else if (currentChain.type === 'solana') {
            setSolanaModalVisible(true)
        } else {
            // Coming soon chains
            await adapter.connect()
        }
    }, [adapter, currentChain.type, setSolanaModalVisible])

    const disconnectWallet = useCallback(async () => {
        await adapter.disconnect()
        if (currentChain.type === 'solana') {
            await solanaWallet.disconnect()
        }
        if (currentChain.type === 'evm') setEvmAddress(null)
    }, [adapter, currentChain.type, solanaWallet])

    const value = useMemo<ChainContextType>(() => ({
        currentChain,
        adapter,
        supportedChains: SUPPORTED_CHAINS,
        switchChain,
        walletAddress,
        isConnected,
        connectWallet,
        disconnectWallet,
    }), [currentChain, adapter, switchChain, walletAddress, isConnected, connectWallet, disconnectWallet])

    return (
        <ChainContext.Provider value={value}>
            {children}
        </ChainContext.Provider>
    )
}

export function useChain(): ChainContextType {
    const context = useContext(ChainContext)
    if (!context) throw new Error('useChain must be used within ChainProvider')
    return context
}

export default ChainContext
