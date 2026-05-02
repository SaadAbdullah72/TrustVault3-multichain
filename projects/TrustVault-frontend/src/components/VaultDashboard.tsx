import { useState } from 'react'
import { Eye, EyeOff, Shield, Wallet, Timer, FileText, Copy, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Countdown from './Countdown'

export interface VaultDashboardProps {
    vaultState: any;
    vaultBalance: number;
    currentChain: any;
    vaultAddress: string;
    walletAddress: string | null;
    isOwner: boolean;
    isBeneficiary: boolean;
    isExpired: boolean;
    formatAddr: (addr: string) => string;
    copyToClipboard: (text: string) => void;
}

export default function VaultDashboard({
    vaultState,
    vaultBalance,
    currentChain,
    vaultAddress,
    walletAddress,
    isOwner,
    isBeneficiary,
    isExpired,
    formatAddr,
    copyToClipboard
}: VaultDashboardProps) {
    const { t } = useTranslation()
    const [showBalanceHidden, setShowBalanceHidden] = useState(false)

    return (
        <>
            <div className="balance-section" style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--stitch-secondary)', borderRadius: '24px', margin: '0 20px' }}>
                <div className="balance-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--stitch-text-dim)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{t('vault_balance')}</span>
                    <button onClick={() => setShowBalanceHidden(!showBalanceHidden)} className="balance-eye-btn" style={{ background: 'none', border: 'none', color: 'var(--stitch-text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {showBalanceHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                <div className="balance-amount" style={{ fontSize: '48px', fontWeight: 800, color: 'var(--stitch-text)', letterSpacing: '-2px', lineHeight: 1 }}>
                    {showBalanceHidden ? '••••••' : vaultBalance.toFixed(4)}
                    <span style={{ fontSize: '18px', color: 'var(--stitch-text-dim)', marginLeft: '8px', fontWeight: 600 }}>{currentChain.nativeCurrency.symbol}</span>
                </div>
                <div className="role-badges" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                    {isOwner && (
                        <div className="status-pill" style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>
                            <Shield size={12} style={{ marginRight: '4px' }} />
                            <span>{t('owner')}</span>
                        </div>
                    )}
                    {isBeneficiary && (
                        <div className="status-pill" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #dcfce7' }}>
                            <Wallet size={12} style={{ marginRight: '4px' }} />
                            <span>{t('beneficiary')}</span>
                        </div>
                    )}
                    <div className={`status-pill ${vaultState.released ? 'released' : isExpired ? 'expired' : 'secured'}`} style={{ 
                        background: vaultState.released ? '#fef2f2' : isExpired ? '#fffbeb' : '#f0fdf4',
                        color: vaultState.released ? '#dc2626' : isExpired ? '#d97706' : '#16a34a',
                        border: '1px solid',
                        borderColor: vaultState.released ? '#fee2e2' : isExpired ? '#fef3c7' : '#dcfce7'
                    }}>
                        <span>{vaultState.released ? t('released') : isExpired ? t('timer_expired') : t('secured')}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-content" style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '24px', padding: '0 20px 40px' }}>
                
                {/* Vault Overview Card */}
                <div>
                    <div className="section-header" style={{ marginBottom: '12px' }}>
                        <Shield className="section-header-icon" size={16} style={{ color: 'var(--stitch-accent)' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>Security Overview</span>
                    </div>
                    <div className="section-card" style={{ padding: '20px', border: '1px solid var(--stitch-surface-border)', borderRadius: '16px' }}>
                        <div className="detail-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="detail-label" style={{ color: 'var(--stitch-text-dim)', fontSize: '13px' }}>Network Environment</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: currentChain.color }}></div>
                                    <span className="detail-value" style={{ fontSize: '13px', fontWeight: 600 }}>{currentChain.name}</span>
                                </div>
                            </div>
                            <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="detail-label" style={{ color: 'var(--stitch-text-dim)', fontSize: '13px' }}>Secured For</span>
                                <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600 }}>{walletAddress ? formatAddr(walletAddress) : '-'}</span>
                            </div>
                            <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="detail-label" style={{ color: 'var(--stitch-text-dim)', fontSize: '13px' }}>Protection Status</span>
                                <span className="detail-value" style={{ color: vaultState.released ? '#dc2626' : '#16a34a', fontSize: '13px', fontWeight: 700 }}>
                                    {vaultState.released ? 'Inactive' : 'Active & Guarded'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Heartbeat Countdown */}
                <div>
                    <div className="section-header" style={{ marginBottom: '12px' }}>
                        <Timer className="section-header-icon" size={16} style={{ color: 'var(--stitch-accent)' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>Heartbeat Countdown</span>
                    </div>
                    <div className="section-card" style={{ padding: '24px', border: '1px solid var(--stitch-surface-border)', borderRadius: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
                        <Countdown lastHeartbeat={vaultState.lastHeartbeat} lockDuration={vaultState.lockDuration} released={vaultState.released} />
                    </div>
                </div>

                {/* Vault Configuration */}
                <div>
                    <div className="section-header" style={{ marginBottom: '12px' }}>
                        <FileText className="section-header-icon" size={16} style={{ color: 'var(--stitch-accent)' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>Configuration</span>
                    </div>
                    <div className="section-card" style={{ padding: '20px', border: '1px solid var(--stitch-surface-border)', borderRadius: '16px' }}>
                        <div className="detail-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="detail-label" style={{ color: 'var(--stitch-text-dim)', fontSize: '13px' }}>Vault Address</span>
                                <div className="detail-value-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: '13px' }}>{formatAddr(vaultAddress)}</span>
                                    <button onClick={() => copyToClipboard(vaultAddress)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--stitch-text-dim)', display: 'flex', alignItems: 'center' }}>
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="detail-label" style={{ color: 'var(--stitch-text-dim)', fontSize: '13px' }}>Beneficiary</span>
                                <div className="detail-value-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="detail-value" style={{ fontFamily: 'monospace', fontSize: '13px' }}>{formatAddr(vaultState.beneficiary)}</span>
                                    <button onClick={() => copyToClipboard(vaultState.beneficiary)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--stitch-text-dim)', display: 'flex', alignItems: 'center' }}>
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="detail-label" style={{ color: 'var(--stitch-text-dim)', fontSize: '13px' }}>Last Heartbeat</span>
                                <span className="detail-value" style={{ fontSize: '13px', fontWeight: 600 }}>
                                    {new Date(vaultState.lastHeartbeat * 1000).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="detail-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="detail-label" style={{ color: 'var(--stitch-text-dim)', fontSize: '13px' }}>Lock Period</span>
                                <span className="detail-value" style={{ fontSize: '13px', fontWeight: 600 }}>
                                    {vaultState.lockDuration >= 86400
                                        ? `${Math.floor(vaultState.lockDuration / 86400)}d ${Math.floor((vaultState.lockDuration % 86400) / 3600)}h`
                                        : vaultState.lockDuration >= 3600
                                            ? `${Math.floor(vaultState.lockDuration / 3600)}h ${Math.floor((vaultState.lockDuration % 3600) / 60)}m`
                                            : `${Math.floor(vaultState.lockDuration / 60)}m ${vaultState.lockDuration % 60}s`
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
