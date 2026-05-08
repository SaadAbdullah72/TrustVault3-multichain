import React from 'react'
import { Shield, ChevronDown, CheckCircle, X, Plus, RefreshCw, Copy, Asterisk, MoreHorizontal, ExternalLink } from 'lucide-react'

interface VaultMetadata {
    vault_id: string;
    vault_name: string;
    owner_address: string;
    beneficiary_address: string;
    isClaimed?: boolean;
}

interface VaultDropdownProps {
    vaults: VaultMetadata[];
    inheritedVaults: VaultMetadata[];
    activeListTab: 'owned' | 'inherited';
    setActiveListTab: (tab: 'owned' | 'inherited') => void;
    onSelect: (vaultId: string) => void;
    onDelete: (vaultId: string) => void;
    onDeleteAll: () => void;
    onCreateNew: () => void;
    formatAddr: (addr: string) => string;
    showVaultSelector: boolean;
    setShowVaultSelector: (show: boolean) => void;
    selectedVaultId: string | null;
}

export default function VaultDropdown({ 
    vaults, 
    inheritedVaults,
    activeListTab,
    setActiveListTab,
    onSelect, 
    onDelete, 
    onDeleteAll,
    onCreateNew, 
    formatAddr,
    showVaultSelector,
    setShowVaultSelector,
    selectedVaultId
}: VaultDropdownProps) {

    const currentList = activeListTab === 'owned' ? vaults : inheritedVaults;

    return (
        <div style={{ position: 'relative', zIndex: 150 }}>
            {/* Main Selector Button */}
            <div 
                onClick={() => setShowVaultSelector(!showVaultSelector)}
                style={{ 
                    background: '#111e2f', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '20px', 
                    padding: '16px 20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={18} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Vault</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{selectedVaultId ? formatAddr(selectedVaultId) : 'Select Vault'}</div>
                    </div>
                </div>
                <ChevronDown size={20} color="#94a3b8" />
            </div>

            {/* Overlay Menu */}
            {showVaultSelector && (
                <div style={{ 
                    position: 'absolute', 
                    bottom: '100%', 
                    left: 0, 
                    right: 0, 
                    zIndex: 200, 
                    borderRadius: '24px', 
                    padding: '24px',
                    background: '#111e2f',
                    boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
                    marginBottom: '20px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button 
                                onClick={() => setActiveListTab('owned')}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: activeListTab === 'owned' ? '#fff' : '#94a3b8', 
                                    fontWeight: activeListTab === 'owned' ? 800 : 500,
                                    fontSize: '13px',
                                    letterSpacing: '1px',
                                    cursor: 'pointer',
                                    padding: '4px 0',
                                    borderBottom: activeListTab === 'owned' ? '2px solid #fff' : 'none'
                                }}
                            >
                                MY VAULTS
                            </button>
                            <button 
                                onClick={() => setActiveListTab('inherited')}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: activeListTab === 'inherited' ? '#fff' : '#94a3b8', 
                                    fontWeight: activeListTab === 'inherited' ? 800 : 500,
                                    fontSize: '13px',
                                    letterSpacing: '1px',
                                    cursor: 'pointer',
                                    padding: '4px 0',
                                    borderBottom: activeListTab === 'inherited' ? '2px solid #fff' : 'none'
                                }}
                            >
                                INHERITED
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {currentList.length > 0 && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); if (window.confirm('Really remove ALL vaults in this list?')) onDeleteAll(); }}
                                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '8px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}
                                >
                                    REMOVE ALL
                                </button>
                            )}
                            <button onClick={() => setShowVaultSelector(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', padding: '8px', borderRadius: '10px' }}><X size={18} /></button>
                        </div>
                    </div>

                    <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {currentList.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#475569', fontSize: '13px' }}>No vaults found in this category</div>
                        ) : (
                            currentList.map((v) => (
                                <div 
                                    key={v.vault_id}
                                    onClick={() => { onSelect(v.vault_id); setShowVaultSelector(false); }}
                                    style={{ 
                                        padding: '16px', 
                                        background: selectedVaultId === v.vault_id ? 'rgba(255,255,255,0.05)' : 'transparent', 
                                        border: '1px solid',
                                        borderColor: selectedVaultId === v.vault_id ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        borderRadius: '16px', 
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '10px', height: '100%', background: v.isClaimed ? '#22c55e' : 'transparent', position: 'absolute', left: 0, borderRadius: '10px' }}></div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {v.vault_name || 'Unnamed Vault'}
                                                {v.isClaimed && <span style={{ fontSize: '8px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '2px 6px', borderRadius: '4px' }}>CLAIMED</span>}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{formatAddr(v.vault_id)}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); if (window.confirm('Remove from list?')) onDelete(v.vault_id); }}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', padding: '8px', cursor: 'pointer' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <button 
                        onClick={() => { onCreateNew(); setShowVaultSelector(false); }}
                        style={{ width: '100%', marginTop: '20px', padding: '16px', background: '#fff', color: '#000', border: 'none', borderRadius: '16px', fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <Plus size={18} /> New Vault
                    </button>
                </div>
            )}
        </div>
    )
}
