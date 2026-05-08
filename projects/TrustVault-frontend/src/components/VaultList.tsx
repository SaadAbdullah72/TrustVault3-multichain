import React from 'react'
import { Shield, Clock, ArrowRight, Plus, ExternalLink, Timer, X } from 'lucide-react'

export interface VaultMetadata {
    vault_id: string;
    vault_name: string;
    owner_address: string;
    beneficiary_address: string;
    isClaimed?: boolean;
}

interface VaultListProps {
    vaults: VaultMetadata[];
    inheritedVaults: VaultMetadata[];
    activeListTab: 'owned' | 'inherited';
    setActiveListTab: (tab: 'owned' | 'inherited') => void;
    onSelect: (vaultId: string) => void;
    onDelete: (vaultId: string) => void;
    onDeleteAll: () => void;
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
    onDelete,
    onDeleteAll,
    onCreateNew, 
    formatAddr, 
    currentChain, 
    isDiscovering 
}: VaultListProps) {
    const currentList = activeListTab === 'owned' ? vaults : inheritedVaults;

    if (isDiscovering) {
        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                <div className="spinner" style={{ width: '48px', height: '48px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px' }}>SCANNING {currentChain.name.toUpperCase()}...</span>
            </div>
        )
    }

    return (
        <div className="vault-list-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '20px' }}>
            <div className="vault-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Existing Vaults</h2>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button 
                            onClick={() => setActiveListTab('owned')}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: activeListTab === 'owned' ? '#fff' : '#475569', 
                                fontWeight: 800, 
                                fontSize: '13px', 
                                cursor: 'pointer',
                                borderBottom: activeListTab === 'owned' ? '2px solid #3b82f6' : '2px solid transparent',
                                padding: '8px 0',
                                transition: 'all 0.2s'
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
                                fontSize: '13px', 
                                cursor: 'pointer',
                                borderBottom: activeListTab === 'inherited' ? '2px solid #3b82f6' : '2px solid transparent',
                                padding: '8px 0',
                                transition: 'all 0.2s'
                            }}
                        >
                            INHERITED
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', width: 'auto', flexWrap: 'wrap' }}>
                    {currentList.length > 0 && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); if (window.confirm('Remove ALL vaults in this list?')) onDeleteAll(); }}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '10px 16px', borderRadius: '14px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                        >
                            Remove All
                        </button>
                    )}
                    <button 
                        onClick={onCreateNew}
                        style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '14px', fontWeight: 900, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,255,255,0.1)' }}
                    >
                        <Plus size={18} strokeWidth={3} /> New Vault
                    </button>
                </div>
            </div>

            {currentList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <Shield size={40} color="#334155" />
                    </div>
                    <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>No Vaults Detected</h3>
                    <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px', maxWidth: '300px', marginInline: 'auto', lineHeight: 1.6 }}>We couldn't find any active inheritance vaults linked to this wallet address.</p>
                    <button 
                        onClick={onCreateNew}
                        style={{ background: '#fff', color: '#000', border: 'none', padding: '14px 32px', borderRadius: '16px', fontWeight: 900, fontSize: '15px', cursor: 'pointer' }}
                    >
                        Create First Vault
                    </button>
                </div>
            ) : (
                <div className="vault-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {(activeListTab === 'owned' ? vaults : inheritedVaults).map((vault) => (
                        <div 
                            key={vault.vault_id}
                            onClick={() => onSelect(vault.vault_id)}
                            style={{ 
                                background: 'linear-gradient(135deg, #111e2f 0%, #0d1724 100%)', 
                                border: '1px solid rgba(255,255,255,0.08)', 
                                borderRadius: '28px', 
                                padding: '28px', 
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            className="vault-card-hover"
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.04)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <Shield size={24} color="#fff" />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    {vault.isClaimed && (
                                        <div style={{ padding: '6px 12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#22c55e', borderRadius: '10px', fontSize: '10px', fontWeight: 900, letterSpacing: '1px' }}>CLAIMED</div>
                                    )}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); if (window.confirm('Really want to remove this vault from list?')) onDelete(vault.vault_id); }}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                                        className="delete-btn"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', marginBottom: '6px', letterSpacing: '-0.5px' }}>{vault.vault_name || 'Unnamed Vault'}</h3>
                            <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '28px', fontUnderline: 'none', wordBreak: 'break-all' }}>{formatAddr(vault.vault_id)}</div>

                            <div className="vault-card-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>Beneficiary</div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{vault.beneficiary_address ? formatAddr(vault.beneficiary_address) : '?...?'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>Network</div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{currentChain.name}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .vault-card-hover:hover {
                    border-color: rgba(59, 130, 246, 0.4) !important;
                    transform: translateY(-6px);
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
                }
                .delete-btn:hover {
                    background: #ef4444 !important;
                    color: #fff !important;
                }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                @media (max-width: 600px) {
                    .vault-list-header {
                        flex-direction: column !important;
                        align-items: stretch !important;
                    }
                    .vault-list-header > div {
                        width: 100% !important;
                    }
                    .vault-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .vault-list-container {
                        padding: 16px !important;
                    }
                    .vault-card-grid {
                        grid-template-columns: 1fr !important;
                        gap: 12px !important;
                    }
                }
            `}</style>
        </div>
    )
}
