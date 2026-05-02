import { useState } from 'react'
import { Eye, EyeOff, Shield, Wallet, CreditCard, Timer, FileText, Copy } from 'lucide-react'
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
    const [tilt, setTilt] = useState({ x: 0, y: 0 })
    const [isInteracting, setIsInteracting] = useState(false)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const rotateX = (((e.clientY - rect.top) - (rect.height / 2)) / (rect.height / 2)) * -15
        const rotateY = (((e.clientX - rect.left) - (rect.width / 2)) / (rect.width / 2)) * 15
        setTilt({ x: rotateX, y: rotateY })
        setIsInteracting(true)
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const touch = e.touches[0]
        const rotateX = (((touch.clientY - rect.top) - (rect.height / 2)) / (rect.height / 2)) * -20
        const rotateY = (((touch.clientX - rect.left) - (rect.width / 2)) / (rect.width / 2)) * 20
        setTilt({ x: rotateX, y: rotateY })
        setIsInteracting(true)
    }

    const resetTilt = () => {
        setTilt({ x: 0, y: 0 })
        setIsInteracting(false)
    }

    return (
        <>
            <div className="balance-section">
                <div className="balance-label">
                    <span>{t('vault_balance')}</span>
                    <button onClick={() => setShowBalanceHidden(!showBalanceHidden)} className="balance-eye-btn">
                        {showBalanceHidden ? <EyeOff className="balance-eye-icon" /> : <Eye className="balance-eye-icon" />}
                    </button>
                </div>
                <div className="balance-amount">
                    {showBalanceHidden ? '••••••' : vaultBalance.toFixed(4)}
                    <span className="balance-currency">{currentChain.nativeCurrency.symbol}</span>
                </div>
                <div className="role-badges" style={{ justifyContent: 'center', marginTop: 8 }}>
                    {isOwner && (
                        <div className="role-badge owner">
                            <Shield className="role-badge-icon" />
                            <span>{t('owner')}</span>
                        </div>
                    )}
                    {isBeneficiary && (
                        <div className="role-badge beneficiary">
                            <Wallet className="role-badge-icon" />
                            <span>{t('beneficiary')}</span>
                        </div>
                    )}
                    <div className={`vault-status-pill ${vaultState.released ? 'released' : isExpired ? 'expired' : 'secured'}`}>
                        <div className="status-dot" />
                        <span>{vaultState.released ? t('released') : isExpired ? t('timer_expired') : t('secured')}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="section-header">
                    <CreditCard className="section-header-icon" />
                    <span>Virtual Trust Card</span>
                </div>
                <div className="section-card">
                    <div className="card-tab-showcase">
                        <div
                            className="card-tab-image-wrap"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={resetTilt}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={resetTilt}
                        >
                            <div
                                className="card-tab-inner"
                                style={{
                                    '--rotateX': `${tilt.x}deg`,
                                    '--rotateY': `${tilt.y}deg`
                                } as any}
                            >
                                <div className="card-tab-reflection" />
                                <img src="/trustvault-card.png" alt="TrustVault Virtual Card" className="card-tab-image" />
                            </div>
                        </div>
                        <div className="card-tab-info">
                            <div className="card-tab-info-row">
                                <span className="card-tab-info-label">Card Holder</span>
                                <span className="card-tab-info-value">{walletAddress ? formatAddr(walletAddress) : '-'}</span>
                            </div>
                            <div className="card-tab-info-row">
                                <span className="card-tab-info-label">Network</span>
                                <span className="card-tab-info-value" style={{ color: currentChain.color }}>{currentChain.name}</span>
                            </div>
                            <div className="card-tab-info-row">
                                <span className="card-tab-info-label">Vault Status</span>
                                <span className={`card-tab-info-value ${vaultState.released ? 'text-red' : 'text-green'}`}>
                                    {vaultState.released ? 'Inactive' : 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section-header">
                    <Timer className="section-header-icon" />
                    <span>Heartbeat Countdown</span>
                </div>
                <div className="section-card">
                    <div className="countdown-section">
                        <Countdown lastHeartbeat={vaultState.lastHeartbeat} lockDuration={vaultState.lockDuration} released={vaultState.released} />
                    </div>
                </div>

                <div className="section-header">
                    <FileText className="section-header-icon" />
                    <span>Vault Configuration</span>
                </div>
                <div className="section-card" style={{ padding: '0 16px' }}>
                    <div className="detail-list">
                        <div className="detail-item">
                            <span className="detail-label">Vault Address</span>
                            <div className="detail-value-row">
                                <span className="detail-value mono truncate-text">{formatAddr(vaultAddress)}</span>
                                <button className="detail-copy" onClick={() => copyToClipboard(vaultAddress)}>
                                    <Copy className="detail-copy-icon" />
                                </button>
                            </div>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Beneficiary</span>
                            <div className="detail-value-row">
                                <span className="detail-value mono truncate-text">{formatAddr(vaultState.beneficiary)}</span>
                                <button className="detail-copy" onClick={() => copyToClipboard(vaultState.beneficiary)}>
                                    <Copy className="detail-copy-icon" />
                                </button>
                            </div>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Network</span>
                            <span className="detail-value" style={{ color: currentChain.color }}>{currentChain.name}</span>
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
        </>
    )
}
