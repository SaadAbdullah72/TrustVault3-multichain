import { Shield, ChevronDown, CheckCircle, X, Plus, RefreshCw, Copy, Asterisk, MoreHorizontal } from 'lucide-react'
import { RegistryVault } from '../utils/supabase'

export interface VaultDropdownProps {
    currentChain: any;
    userVaults: RegistryVault[];
    vaultRoles: Record<string, string>;
    selectedVaultId: string | null;
    setSelectedVaultId: (id: string | null) => void;
    adapter: any;
    handleDeleteVaultId: (id: string) => void;
    isDiscovering: boolean;
    handleManualScan: () => void;
    uiStatus: any;
    setShowCreateForm: (show: boolean) => void;
    showVaultSelector: boolean;
    setShowVaultSelector: (show: boolean) => void;
    vaultAddress: string;
    walletAddress: string | null;
    copied: boolean;
    copyToClipboard: (text: string) => void;
    formatAddr: (addr: string) => string;
    inheritedVaults: RegistryVault[];
    activeListTab: 'owned' | 'inherited';
    setActiveListTab: (tab: 'owned' | 'inherited') => void;
}

export default function VaultDropdown({
    currentChain,
    userVaults,
    vaultRoles,
    selectedVaultId,
    setSelectedVaultId,
    adapter,
    handleDeleteVaultId,
    isDiscovering,
    handleManualScan,
    uiStatus,
    setShowCreateForm,
    showVaultSelector,
    setShowVaultSelector,
    vaultAddress,
    walletAddress,
    copied,
    copyToClipboard,
    formatAddr,
    inheritedVaults,
    activeListTab,
    setActiveListTab
}: VaultDropdownProps) {

    return (
        <div style={{ position: 'relative', zIndex: 150 }}>
            {showVaultSelector && (
                <div style={{ 
                    position: 'absolute', 
                    bottom: '100%', 
                    left: '20px', 
                    right: '20px', 
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
                        <button onClick={() => setShowVaultSelector(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
                    </div>

                    <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(activeListTab === 'owned' ? userVaults : inheritedVaults).length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                No {activeListTab} vaults found
                            </div>
                        )}
                        {(activeListTab === 'owned' ? userVaults : inheritedVaults).map(v => (
                            <div key={v.vault_id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button 
                                    onClick={() => { setSelectedVaultId(v.vault_id); setShowVaultSelector(false) }}
                                    style={{ 
                                        flex: 1, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px', 
                                        padding: '14px', 
                                        background: selectedVaultId === v.vault_id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                        border: `1px solid ${selectedVaultId === v.vault_id ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        color: '#fff'
                                    }}
                                >
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
                                        <Shield size={18} color={selectedVaultId === v.vault_id ? '#fff' : '#94a3b8'} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 700 }}>{v.vault_name || 'Unnamed Vault'}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{formatAddr(v.vault_id)}</div>
                                    </div>
                                    {selectedVaultId === v.vault_id && <CheckCircle size={16} color="#fff" />}
                                </button>
                                {activeListTab === 'owned' && (
                                    <button onClick={() => handleDeleteVaultId(v.vault_id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}><X size={16} /></button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => { setShowCreateForm(true); setShowVaultSelector(false) }}
                        style={{ width: '100%', marginTop: '20px', padding: '16px', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.2)', background: 'transparent', color: '#94a3b8', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}
                    >
                        <Plus size={18} />
                        New Vault
                    </button>
                </div>
            )}

            <div style={{ padding: '12px 24px 24px', background: '#0B131E', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div 
                    onClick={() => setShowVaultSelector(!showVaultSelector)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#111e2f', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>{walletAddress ? formatAddr(walletAddress) : ''}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                            {selectedVaultId 
                                ? (userVaults.find(v => v.vault_id === selectedVaultId)?.vault_name || `Vault #${selectedVaultId.slice(0, 6)}`)
                                : 'No Vault'}
                        </span>
                        <ChevronDown size={14} color="#94a3b8" />
                    </div>
                </div>
            </div>
        </div>
    )
}
