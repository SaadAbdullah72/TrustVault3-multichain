import React from 'react'
import { Shield, Clock, ArrowRight, Plus, ExternalLink, Timer } from 'lucide-react'

export interface VaultMetadata {
    vault_id: string;
    vault_name: string;
    owner_address: string;
    beneficiary_address: string;
}

interface VaultListProps {
    vaults: VaultMetadata[];
    inheritedVaults: VaultMetadata[];
    activeListTab: 'owned' | 'inherited';
    setActiveListTab: (tab: 'owned' | 'inherited') => void;
    onSelect: (vaultId: string) => void;
    onCreateNew: () => void;
    formatAddr: (addr: string) => string;
    currentChain: any;
    isDiscovering: boolean;
}

export default function VaultList({ 
    vaults, 
    inheritedVaults,
    activeListTab,
    setActiveListTab,
    onSelect, 
    onCreateNew, 
    formatAddr, 
    currentChain, 
    isDiscovering 
}: VaultListProps) {
    if (isDiscovering) {
        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                <div className="spinner" style={{ width: '48px', height: '48px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px' }}>SCANNING {currentChain.name.toUpperCase()}...</span>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Existing Vaults</h2>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button 
                            onClick={() => setActiveListTab('owned')}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: activeListTab === 'owned' ? '#fff' : '#475569', 
                                fontWeight: 800, 
                                fontSize: '14px', 
                                cursor: 'pointer',
                                borderBottom: activeListTab === 'owned' ? '2px solid #fff' : 'none',
                                padding: '8px 0'
                            }}
                        >
                            OWNED
                        </button>
                        <button 
                            onClick={() => setActiveListTab('inherited')}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: activeListTab === 'inherited' ? '#fff' : '#475569', 
                                fontWeight: 800, 
                                fontSize: '14px', 
                                cursor: 'pointer',
                                borderBottom: activeListTab === 'inherited' ? '2px solid #fff' : 'none',
                                padding: '8px 0'
                            }}
                        >
                            INHERITED
                        </button>
                    </div>
                </div>
                <button 
                    onClick={onCreateNew}
                    style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                >
                    <Plus size={16} /> New Vault
                </button>
            </div>

            {(activeListTab === 'owned' ? vaults : inheritedVaults).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Shield size={32} color="#475569" />
                    </div>
                    <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>No Vaults Found</h3>
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>We couldn't find any inheritance vaults linked to your address on this chain.</p>
                    <button 
                        onClick={onCreateNew}
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Create Your First Vault
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {(activeListTab === 'owned' ? vaults : inheritedVaults).map((vault) => (
                        <div 
                            key={vault.vault_id}
                            onClick={() => onSelect(vault.vault_id)}
                            style={{ 
                                background: '#111e2f', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '20px', 
                                padding: '24px', 
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            className="vault-card-hover"
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Shield size={22} color="#fff" />
                                </div>
                                <ArrowRight size={20} color="#64748b" />
                            </div>

                            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{vault.vault_name || 'Unnamed Vault'}</h3>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px', wordBreak: 'break-all' }}>{formatAddr(vault.vault_id)}</div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Beneficiary</div>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{vault.beneficiary_address ? formatAddr(vault.beneficiary_address) : '?...?'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>Network</div>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{currentChain.name}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .vault-card-hover:hover {
                    border-color: rgba(255,255,255,0.3) !important;
                    transform: translateY(-4px);
                    background: #15253a !important;
                }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}
