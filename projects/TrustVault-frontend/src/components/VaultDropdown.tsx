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
        <div style={{ position: 'relative', zIndex: 150 }}>
            {showVaultSelector && (
                <div style={{ 
                    position: 'absolute', 
                    bottom: '100%', 
                    left: '20px', 
                    right: '20px', 
                    borderRadius: '24px', 
                    padding: '24px',
                    background: '#fff',
                    boxShadow: '0 -20px 60px rgba(0,0,0,0.1)',
                    marginBottom: '20px',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <span style={{ fontWeight: 800, fontSize: '13px', color: '#94a3b8', letterSpacing: '1px' }}>MY VAULTS</span>
                        <button onClick={() => setShowVaultSelector(false)} style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer' }}><X size={20} /></button>
                    </div>

                    <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {userVaults.map(id => (
                            <div key={id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button 
                                    onClick={() => { setSelectedVaultId(id); setShowVaultSelector(false) }}
                                    style={{ 
                                        flex: 1, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px', 
                                        padding: '14px', 
                                        background: selectedVaultId === id ? '#f1f5f9' : 'transparent',
                                        border: `1px solid ${selectedVaultId === id ? '#cbd5e1' : '#f1f5f9'}`,
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        color: '#000'
                                    }}
                                >
                                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                        <Shield size={18} color={selectedVaultId === id ? '#38bdf8' : '#94a3b8'} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 700 }}>Vault #{id.slice(0, 8)}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{formatAddr(adapter.getVaultAddress(id))}</div>
                                    </div>
                                    {selectedVaultId === id && <CheckCircle size={16} color="#38bdf8" />}
                                </button>
                                <button onClick={() => handleDeleteVaultId(id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}><X size={16} /></button>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => { setShowCreateForm(true); setShowVaultSelector(false) }}
                        style={{ width: '100%', marginTop: '20px', padding: '16px', borderRadius: '16px', border: '1px dashed #cbd5e1', background: 'transparent', color: '#64748b', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}
                    >
                        <Plus size={18} />
                        New Vault
                    </button>
                </div>
            )}

            <div style={{ padding: '12px 24px 24px', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
                <div 
                    onClick={() => setShowVaultSelector(!showVaultSelector)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>{walletAddress ? formatAddr(walletAddress) : ''}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#000' }}>
                            {selectedVaultId ? `Vault #${selectedVaultId.slice(0, 6)}` : 'No Vault'}
                        </span>
                        <ChevronDown size={14} color="#94a3b8" />
                    </div>
                </div>
            </div>
        </div>
    )
}
