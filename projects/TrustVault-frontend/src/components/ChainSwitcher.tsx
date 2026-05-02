import { useState, useRef, useEffect } from 'react'
import { useChain } from '../contexts/ChainContext'
import { ChainConfig } from '../config/chains'
import { ChevronDown, Search, Zap, Clock, CircleDot } from 'lucide-react'

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

    const handleSelect = (chain: ChainConfig) => {
        if (chain.status === 'coming-soon') return
        switchChain(chain.id)
        setIsOpen(false)
        setSearchQuery('')
    }

    return (
        <div className="chain-switcher" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '6px 12px', 
                    background: 'var(--nb-glass)', 
                    border: '1px solid var(--nb-glass-border)', 
                    borderRadius: '12px',
                    cursor: 'pointer',
                    color: '#fff',
                    transition: 'var(--nb-transition)'
                }}
            >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentChain.color, boxShadow: `0 0 10px ${currentChain.color}` }}></div>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{currentChain.name}</span>
                <ChevronDown size={14} style={{ opacity: 0.5, transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>

            {isOpen && (
                <div className="glass-effect" style={{ 
                    position: 'absolute', 
                    top: 'calc(100% + 12px)', 
                    right: 0, 
                    width: '280px', 
                    borderRadius: '20px', 
                    zIndex: 1000,
                    overflow: 'hidden',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--nb-glass-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={14} style={{ opacity: 0.5 }} />
                        <input 
                            placeholder="Search networks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '13px', outline: 'none', width: '100%' }}
                            autoFocus
                        />
                    </div>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px 0' }}>
                        {filteredChains.map(chain => (
                            <button
                                key={chain.id}
                                onClick={() => handleSelect(chain)}
                                style={{ 
                                    width: '100%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '12px', 
                                    padding: '12px 16px', 
                                    background: 'transparent', 
                                    border: 'none', 
                                    cursor: chain.status === 'coming-soon' ? 'not-allowed' : 'pointer',
                                    textAlign: 'left',
                                    opacity: chain.status === 'coming-soon' ? 0.4 : 1,
                                    transition: '0.2s'
                                }}
                                className="chain-row-hover"
                            >
                                <div style={{ 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '10px', 
                                    background: chain.color, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: 800
                                }}>
                                    {CHAIN_EMOJI[chain.id] || '●'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{chain.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--nb-text-dim)' }}>{chain.nativeCurrency.symbol}</div>
                                </div>
                                {chain.id === currentChain.id && <CircleDot size={12} color="var(--nb-accent)" />}
                                {chain.status === 'coming-soon' && <span style={{ fontSize: '9px', fontWeight: 800, background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>SOON</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <style>{`
                .chain-row-hover:hover { background: rgba(255,255,255,0.05) !important; }
            `}</style>
        </div>
    )
}
