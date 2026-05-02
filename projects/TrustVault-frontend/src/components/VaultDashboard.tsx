import { useState } from 'react'
import { Eye, EyeOff, Shield, Wallet, CreditCard, Timer, FileText, Copy, Info } from 'lucide-react'
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
            <div className="balance-section">
                <div className="balance-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--stitch-text-dim)', fontSize: '14px', fontWeight: 500 }}>{t('vault_balance')}</span>
                    <button onClick={() => setShowBalanceHidden(!showBalanceHidden)} className="balance-eye-btn" style={{ background: 'none', border: 'none', color: 'var(--stitch-text-dim)', cursor: 'pointer' }}>
                        {showBalanceHidden ? <EyeOff className="balance-eye-icon" size={16} /> : <Eye className="balance-eye-icon" size={16} />}
                    </button>
                </div>
                <div className="balance-amount" style={{ fontSize: '40px', fontWeight: 700, margin: '8px 0', letterSpacing: '-1px' }}>
                    {showBalanceHidden ? '••••••' : vaultBalance.toFixed(4)}
                    <span className="balance-currency" style={{ fontSize: '20px', color: 'var(--stitch-text-dim)', marginLeft: '8px' }}>{currentChain.nativeCurrency.symbol}</span>
                </div>
                <div className="role-badges" style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                    {isOwner && (
                        <div className="role-badge owner" style={{ background: 'var(--stitch-surface)', border: '1px solid var(--stitch-surface-border)', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Shield size={14} color="var(--accent-blue)" />
                            <span>{t('owner')}</span>
                        </div>
                    )}
                    {isBeneficiary && (
                        <div className="role-badge beneficiary" style={{ background: 'var(--stitch-surface)', border: '1px solid var(--stitch-surface-border)', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Wallet size={14} color="var(--accent-emerald)" />
                            <span>{t('beneficiary')}</span>
                        </div>
                    )}
                    <div className={`vault-status-pill ${vaultState.released ? 'released' : isExpired ? 'expired' : 'secured'}`}>
                        <span>{vaultState.released ? t('released') : isExpired ? t('timer_expired') : t('secured')}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-content" style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Vault Overview Card */}
                <div>
                    <div className="section-header">
                        <CreditCard className="section-header-icon" />
                        <span>Vault Overview</span>
                    </div>
                    <div className="section-card" style={{ padding: '16px' }}>
                        <div className="detail-list">
                            <div className="detail-item">
                                <span className="detail-label">Network</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: currentChain.color }}></div>
                                    <span className="detail-value">{currentChain.name}</span>
                                </div>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Card Holder</span>
                                <span className="detail-value" style={{ fontFamily: 'monospace' }}>{walletAddress ? formatAddr(walletAddress) : '-'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Vault Status</span>
                                <span className="detail-value" style={{ color: vaultState.released ? 'var(--accent-red)' : 'var(--accent-emerald)' }}>
                                    {vaultState.released ? 'Inactive' : 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Heartbeat Countdown */}
                <div>
                    <div className="section-header">
                        <Timer className="section-header-icon" />
                        <span>Heartbeat Countdown</span>
                    </div>
                    <div className="section-card" style={{ padding: '24px' }}>
                        <Countdown lastHeartbeat={vaultState.lastHeartbeat} lockDuration={vaultState.lockDuration} released={vaultState.released} />
                    </div>
                </div>

                {/* Vault Configuration */}
                <div>
                    <div className="section-header">
                        <FileText className="section-header-icon" />
                        <span>Configuration</span>
                    </div>
                    <div className="section-card" style={{ padding: '16px' }}>
                        <div className="detail-list">
                            <div className="detail-item">
                                <span className="detail-label">Vault Address</span>
                                <div className="detail-value-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="detail-value" style={{ fontFamily: 'monospace' }}>{formatAddr(vaultAddress)}</span>
                                    <button onClick={() => copyToClipboard(vaultAddress)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--stitch-text-dim)' }}>
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Beneficiary</span>
                                <div className="detail-value-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="detail-value" style={{ fontFamily: 'monospace' }}>{formatAddr(vaultState.beneficiary)}</span>
                                    <button onClick={() => copyToClipboard(vaultState.beneficiary)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--stitch-text-dim)' }}>
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Last Heartbeat</span>
                                <span className="detail-value">
                                    {new Date(vaultState.lastHeartbeat * 1000).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Lock Period</span>
                                <span className="detail-value">
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
