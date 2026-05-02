import { Shield, ChevronDown, CheckCircle, X, Plus, RefreshCw, Copy, Asterisk, MoreHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface VaultDropdownProps {
    currentChain: any;
    userVaults: string[];
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
    formatAddr
}: VaultDropdownProps) {
    const { t } = useTranslation()

    return (
        <div style={{ position: 'relative', zIndex: 50 }}>
            {showVaultSelector && (
                <div className="glass-effect" style={{ 
                    position: 'absolute', 
                    top: '0', 
                    left: '24px', 
                    right: '24px', 
                    borderRadius: '24px', 
                    padding: '24px',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
                    zIndex: 100
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '1px' }}>MY VAULTS</span>
                        <button onClick={() => setShowVaultSelector(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
                    </div>

                    <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {userVaults.map(id => (
                            <div key={id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <button 
                                    onClick={() => { setSelectedVaultId(id); setShowVaultSelector(false) }}
                                    style={{ 
                                        flex: 1, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '16px', 
                                        padding: '16px', 
                                        background: selectedVaultId === id ? 'var(--nb-glass)' : 'transparent',
                                        border: `1px solid ${selectedVaultId === id ? 'var(--nb-accent)' : 'var(--nb-glass-border)'}`,
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        color: '#fff'
                                    }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--nb-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Shield size={20} color={selectedVaultId === id ? 'var(--nb-accent)' : '#fff'} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '13px', fontWeight: 700 }}>Vault #{id.slice(0, 8)}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--nb-text-dim)' }}>{formatAddr(adapter.getVaultAddress(id))}</div>
                                    </div>
                                    {selectedVaultId === id && <CheckCircle size={16} color="var(--nb-accent)" />}
                                </button>
                                <button onClick={() => handleDeleteVaultId(id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}><X size={16} /></button>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => { setShowCreateForm(true); setShowVaultSelector(false) }}
                        style={{ width: '100%', marginTop: '24px', padding: '16px', borderRadius: '16px', border: '1px dashed var(--nb-glass-border)', background: 'transparent', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                    >
                        <Plus size={18} />
                        Create New Vault
                    </button>
                </div>
            )}

            <div style={{ padding: '0 24px', marginTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--nb-glass)', borderRadius: '14px', border: '1px solid var(--nb-glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--nb-text-dim)' }}>Connected Wallet</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700 }}>{walletAddress ? formatAddr(walletAddress) : ''}</span>
                        <button onClick={() => copyToClipboard(walletAddress!)} style={{ background: 'none', border: 'none', color: 'var(--nb-text-dim)', cursor: 'pointer' }}>
                            {copied ? <CheckCircle size={14} color="#22c55e" /> : <Copy size={14} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
