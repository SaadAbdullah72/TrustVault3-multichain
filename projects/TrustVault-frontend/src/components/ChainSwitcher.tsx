/**
 * ChainSwitcher — Premium dropdown for switching between blockchains.
 * Shows chain icons, names, brand colors, and "Coming Soon" badges.
 */
import { useState, useRef, useEffect } from 'react'
import { useChain } from '../contexts/ChainContext'
import { ChainConfig } from '../config/chains'
import { ChevronDown, Search, Zap, Clock } from 'lucide-react'

// Chain emoji/letter fallbacks when SVG icons aren't available
const CHAIN_EMOJI: Record<string, string> = {
    algorand: 'Ⓐ', ethereum: 'Ξ', polygon: '⬡', bsc: '◆',
    arbitrum: '▲', base: '◎', avalanche: '▲', optimism: '⊕',
    fantom: '♦', cronos: '◈', celo: '○', gnosis: '◇',
    zksync: 'z', scroll: '◉', linea: '▬', mantle: '▣',
    blast: '⚡', solana: '◐', sui: '◑', aptos: '◒',
}

export default function ChainSwitcher() {
    const { currentChain, supportedChains, switchChain } = useChain()
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
                setSearchQuery('')
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const filteredChains = supportedChains.filter(chain =>
        chain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chain.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chain.nativeCurrency.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Group chains
    const evmChains = filteredChains.filter(c => c.type === 'evm')
    const nonEvmChains = filteredChains.filter(c => c.type !== 'evm')

    const handleSelect = (chain: ChainConfig) => {
        if (chain.status === 'coming-soon') return
        switchChain(chain.id)
        setIsOpen(false)
        setSearchQuery('')
    }

    return (
        <div className="chain-switcher" ref={dropdownRef}>
            <button
                className="chain-switcher-trigger"
                onClick={() => setIsOpen(!isOpen)}
                style={{ '--chain-color': currentChain.color } as any}
            >
                <div className="chain-switcher-icon" style={{ background: currentChain.color }}>
                    <span>{CHAIN_EMOJI[currentChain.id] || '●'}</span>
                </div>
                <span className="chain-switcher-name">{currentChain.name}</span>
                <ChevronDown className={`chain-switcher-chevron ${isOpen ? 'rotated' : ''}`} />
            </button>

            {isOpen && (
                <div className="chain-switcher-dropdown">
                    <div className="chain-dropdown-header">
                        <span className="chain-dropdown-title">Select Network</span>
                        <span className="chain-dropdown-count">{supportedChains.length} chains</span>
                    </div>

                    <div className="chain-dropdown-search">
                        <Search className="chain-search-icon" />
                        <input
                            type="text"
                            placeholder="Search chains..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="chain-search-input"
                            autoFocus
                        />
                    </div>

                    <div className="chain-dropdown-list">
                        {/* Non-EVM (Featured) */}
                        {nonEvmChains.length > 0 && (
                            <>
                                <div className="chain-group-label">
                                    <Zap className="chain-group-icon" />
                                    <span>Featured Chains</span>
                                </div>
                                {nonEvmChains.map(chain => (
                                    <ChainRow
                                        key={chain.id}
                                        chain={chain}
                                        isActive={currentChain.id === chain.id}
                                        onSelect={handleSelect}
                                    />
                                ))}
                            </>
                        )}

                        {/* EVM */}
                        {evmChains.length > 0 && (
                            <>
                                <div className="chain-group-label">
                                    <span className="chain-group-evm-badge">EVM</span>
                                    <span>EVM Compatible</span>
                                </div>
                                {evmChains.map(chain => (
                                    <ChainRow
                                        key={chain.id}
                                        chain={chain}
                                        isActive={currentChain.id === chain.id}
                                        onSelect={handleSelect}
                                    />
                                ))}
                            </>
                        )}

                        {filteredChains.length === 0 && (
                            <div className="chain-dropdown-empty">
                                <span>No chains found</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function ChainRow({
    chain, isActive, onSelect
}: {
    chain: ChainConfig, isActive: boolean, onSelect: (c: ChainConfig) => void
}) {
    const isComingSoon = chain.status === 'coming-soon'

    return (
        <button
            className={`chain-row ${isActive ? 'active' : ''} ${isComingSoon ? 'coming-soon' : ''}`}
            onClick={() => onSelect(chain)}
            disabled={isComingSoon}
        >
            <div className="chain-row-icon" style={{ background: chain.color }}>
                <span>{CHAIN_EMOJI[chain.id] || '●'}</span>
            </div>
            <div className="chain-row-info">
                <span className="chain-row-name">{chain.name}</span>
                <span className="chain-row-currency">{chain.nativeCurrency.symbol}</span>
            </div>
            {isComingSoon && (
                <div className="chain-coming-soon-badge">
                    <Clock size={10} />
                    <span>Soon</span>
                </div>
            )}
            {isActive && (
                <div className="chain-active-dot" />
            )}
        </button>
    )
}
