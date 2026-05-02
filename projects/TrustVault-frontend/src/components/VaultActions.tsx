import { Heart, ArrowUpFromLine, Unlock, Copy, Search, RefreshCw, Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface VaultActionsProps {
    isOwner: boolean;
    isBeneficiary: boolean;
    isExpired: boolean;
    canRelease: boolean;
    vaultState: any;
    uiStatus: any;
    selectedVaultId: string;
    vaultAddress: string;
    handleHeartbeat: (id: string, callback: () => void) => void;
    handleWithdrawAction: () => void;
    handleClaim: (id: string, callback: () => void) => void;
    handleManualScan: () => void;
    loadVaultState: () => void;
    copyToClipboard: (text: string) => void;
}

export default function VaultActions({
    isOwner,
    isBeneficiary,
    isExpired,
    canRelease,
    vaultState,
    uiStatus,
    selectedVaultId,
    vaultAddress,
    handleHeartbeat,
    handleWithdrawAction,
    handleClaim,
    handleManualScan,
    loadVaultState,
    copyToClipboard
}: VaultActionsProps) {
    const { t } = useTranslation()

    return (
        <>
            <div className="quick-actions">
                {isOwner && !vaultState.released && (
                    <>
                        <button className="quick-action-btn" onClick={() => handleHeartbeat(selectedVaultId, loadVaultState)} disabled={uiStatus.loading || isExpired}>
                            <div className={`quick-action-circle ${isExpired ? 'disabled' : 'heartbeat'}`}>
                                <Heart className="quick-action-icon" />
                            </div>
                            <span className="quick-action-label">{t('heartbeat')}</span>
                        </button>
                        <button className="quick-action-btn" onClick={handleWithdrawAction} disabled={uiStatus.loading}>
                            <div className="quick-action-circle withdraw">
                                <ArrowUpFromLine className="quick-action-icon" />
                            </div>
                            <span className="quick-action-label">{t('withdraw')}</span>
                        </button>
                    </>
                )}
                {isBeneficiary && !vaultState.released && (
                    <button className="quick-action-btn" onClick={() => handleClaim(selectedVaultId, loadVaultState)} disabled={uiStatus.loading || !canRelease}>
                        <div className={`quick-action-circle ${canRelease ? 'claim' : 'disabled'}`}>
                            <Unlock className="quick-action-icon" />
                        </div>
                        <span className="quick-action-label">{canRelease ? t('claim') : 'Locked'}</span>
                    </button>
                )}
                <button className="quick-action-btn" onClick={() => copyToClipboard(vaultAddress)}>
                    <div className="quick-action-circle copy">
                        <Copy className="quick-action-icon" />
                    </div>
                    <span className="quick-action-label">{t('copy_addr')}</span>
                </button>
                <button className="quick-action-btn" onClick={handleManualScan} disabled={uiStatus.loading}>
                    <div className="quick-action-circle scan">
                        <Search className="quick-action-icon" />
                    </div>
                    <span className="quick-action-label">{t('scan')}</span>
                </button>
            </div>

            {isBeneficiary && canRelease && !vaultState.released && (
                <div className="claim-banner">
                    <div className="claim-banner-left">
                        <Bell className="claim-bell-icon" />
                        <div className="claim-banner-text">
                            <span className="claim-banner-title">Inheritance Ready</span>
                            <span className="claim-banner-sub">Timer expired — claim your funds</span>
                        </div>
                    </div>
                    <button className="claim-banner-btn" onClick={() => handleClaim(selectedVaultId, loadVaultState)} disabled={uiStatus.loading}>
                        {uiStatus.loading ? <RefreshCw className="spinning claim-banner-btn-icon" /> : <Unlock className="claim-banner-btn-icon" />}
                        <span>Claim Now</span>
                    </button>
                </div>
            )}
        </>
    )
}
