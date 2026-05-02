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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
            <div className="section-header" style={{ marginBottom: 0 }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--stitch-text)' }}>Quick Actions</span>
            </div>
            
            <div className="quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '16px' }}>
                {isOwner && !vaultState.released && (
                    <>
                        <button 
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'var(--stitch-surface)', border: '1px solid var(--stitch-surface-border)', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'var(--stitch-transition)', opacity: uiStatus.loading || isExpired ? 0.5 : 1 }}
                            onClick={() => handleHeartbeat(selectedVaultId, loadVaultState)} 
                            disabled={uiStatus.loading || isExpired}
                        >
                            <Heart size={20} color={isExpired ? 'var(--stitch-text-dim)' : 'var(--accent-red)'} />
                            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--stitch-text)' }}>{t('heartbeat')}</span>
                        </button>
                        <button 
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'var(--stitch-surface)', border: '1px solid var(--stitch-surface-border)', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'var(--stitch-transition)', opacity: uiStatus.loading ? 0.5 : 1 }}
                            onClick={handleWithdrawAction} 
                            disabled={uiStatus.loading}
                        >
                            <ArrowUpFromLine size={20} color="var(--accent-blue)" />
                            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--stitch-text)' }}>{t('withdraw')}</span>
                        </button>
                    </>
                )}
                {isBeneficiary && !vaultState.released && (
                    <button 
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'var(--stitch-surface)', border: '1px solid var(--stitch-surface-border)', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'var(--stitch-transition)', opacity: uiStatus.loading || !canRelease ? 0.5 : 1 }}
                        onClick={() => handleClaim(selectedVaultId, loadVaultState)} 
                        disabled={uiStatus.loading || !canRelease}
                    >
                        <Unlock size={20} color={canRelease ? 'var(--accent-emerald)' : 'var(--stitch-text-dim)'} />
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--stitch-text)' }}>{canRelease ? t('claim') : 'Locked'}</span>
                    </button>
                )}
                <button 
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'var(--stitch-surface)', border: '1px solid var(--stitch-surface-border)', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'var(--stitch-transition)' }}
                    onClick={() => copyToClipboard(vaultAddress)}
                >
                    <Copy size={20} color="var(--stitch-text-dim)" />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--stitch-text)' }}>{t('copy_addr')}</span>
                </button>
                <button 
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'var(--stitch-surface)', border: '1px solid var(--stitch-surface-border)', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'var(--stitch-transition)', opacity: uiStatus.loading ? 0.5 : 1 }}
                    onClick={handleManualScan} 
                    disabled={uiStatus.loading}
                >
                    <Search size={20} color="var(--stitch-text-dim)" />
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--stitch-text)' }}>{t('scan')}</span>
                </button>
            </div>

            {isBeneficiary && canRelease && !vaultState.released && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--stitch-accent)', borderRadius: '8px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Bell color="var(--stitch-accent)" size={24} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--stitch-text)' }}>Inheritance Ready</span>
                            <span style={{ fontSize: '12px', color: 'var(--stitch-text-dim)' }}>Timer expired — claim your funds</span>
                        </div>
                    </div>
                    <button 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--stitch-primary)', color: 'var(--stitch-primary-text)', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                        onClick={() => handleClaim(selectedVaultId, loadVaultState)} 
                        disabled={uiStatus.loading}
                    >
                        {uiStatus.loading ? <RefreshCw className="spinning" size={16} /> : <Unlock size={16} />}
                        <span>Claim Now</span>
                    </button>
                </div>
            )}
        </div>
    )
}
