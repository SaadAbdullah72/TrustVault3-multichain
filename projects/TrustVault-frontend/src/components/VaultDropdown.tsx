import { Shield, ChevronDown, CheckCircle, X, Plus, RefreshCw, Copy } from 'lucide-react'
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
        <div className="wallet-account-header">
            <div className="vault-selector-trigger" onClick={() => setShowVaultSelector(!showVaultSelector)}>
                <div className="vault-avatar">
                    <Shield className="vault-avatar-icon" />
                </div>
                <div className="vault-selector-info">
                    <span className="vault-selector-label">
                        {selectedVaultId ? `Vault #${selectedVaultId.slice(0, 8)}...` : 'No Vault Selected'}
                    </span>
                    <span className="vault-selector-addr">
                        {vaultAddress ? formatAddr(vaultAddress) : 'Select or create a vault'}
                    </span>
                </div>
                <ChevronDown className={`vault-selector-chevron ${showVaultSelector ? 'rotated' : ''}`} />
            </div>

            {showVaultSelector && (
                <div className="vault-selector-dropdown">
                    <div className="vault-dropdown-header">
                        <span>{t('my_vaults', { chain: currentChain.name })}</span>
                        <button onClick={handleManualScan} className="vault-dropdown-scan" disabled={uiStatus.loading || isDiscovering}>
                            <RefreshCw className={`vault-dropdown-scan-icon ${isDiscovering ? 'spinning' : ''}`} />
                        </button>
                    </div>
                    {userVaults.length === 0 && (
                        <div className="vault-dropdown-empty">
                            <Shield className="vault-dropdown-empty-icon" />
                            <span>{t('no_vault', { chain: currentChain.name })}</span>
                        </div>
                    )}
                    {userVaults.map(id => (
                        <div key={id} className={`vault-dropdown-row ${selectedVaultId === id ? 'active' : ''}`}>
                            <button
                                className="vault-dropdown-item"
                                onClick={() => { setSelectedVaultId(id); setShowVaultSelector(false) }}
                            >
                                <div className="vault-dropdown-item-avatar">
                                    <Shield className="vault-dropdown-item-icon" />
                                </div>
                                <div className="vault-dropdown-item-info">
                                    <div className="vault-dropdown-item-header">
                                        <span className="vault-dropdown-item-name">Vault #{id.length > 12 ? id.slice(0, 8) + '...' : id}</span>
                                        {vaultRoles[id] && (
                                            <span className={`vault-dropdown-item-badge ${vaultRoles[id]}`}>
                                                {vaultRoles[id]}
                                            </span>
                                        )}
                                    </div>
                                    <span className="vault-dropdown-item-addr">{formatAddr(adapter.getVaultAddress(id))}</span>
                                </div>
                                {selectedVaultId === id && <CheckCircle className="vault-dropdown-item-check" />}
                            </button>
                            <button
                                className="vault-dropdown-delete"
                                onClick={(e) => { e.stopPropagation(); handleDeleteVaultId(id) }}
                                title="Remove from history"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    <div className="vault-dropdown-actions">
                        <button className="vault-dropdown-action-btn" onClick={() => { setShowCreateForm(true); setShowVaultSelector(false) }}>
                            <Plus className="vault-dropdown-action-icon" />
                            <span>{t('create_vault')}</span>
                        </button>
                        <button className="vault-dropdown-action-btn scan" onClick={handleManualScan} disabled={isDiscovering}>
                            <RefreshCw className={`vault-dropdown-action-icon ${isDiscovering ? 'spinning' : ''}`} />
                            <span>{t('full_scan')}</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="wallet-address-bar">
                <div className="wallet-address-dot" style={{ background: currentChain.color }} />
                <span className="wallet-address-text">{walletAddress ? formatAddr(walletAddress) : ''}</span>
                <button className="wallet-address-copy" onClick={() => copyToClipboard(walletAddress!)} title="Copy Address">
                    {copied ? <CheckCircle className="copy-icon copied" /> : <Copy className="copy-icon" />}
                </button>
            </div>
        </div>
    )
}
