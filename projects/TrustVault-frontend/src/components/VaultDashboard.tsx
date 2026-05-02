import { useState } from 'react'
import { Eye, EyeOff, Shield, Wallet, Timer, FileText, Copy, Heart, Unlock, ArrowUpRight, Asterisk } from 'lucide-react'
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
    onHeartbeat: () => void;
    onWithdraw: () => void;
    onClaim: () => void;
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
    copyToClipboard,
    onHeartbeat,
    onWithdraw,
    onClaim
}: VaultDashboardProps) {
    const { t } = useTranslation()
    const [showBalanceHidden, setShowBalanceHidden] = useState(false)

    return (
        <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Account Selector */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '12px', 
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--nb-glass-border)'
                    }}>
                        <Asterisk size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--nb-text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vault Account</div>
                        <div style={{ fontSize: '15px', fontWeight: 700 }}>{formatAddr(vaultAddress)}</div>
                    </div>
                </div>
            </div>

            {/* Large Balance Display */}
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--nb-text-dim)', marginBottom: '8px' }}>AVAILABLE FUNDS</div>
                <div className="nb-balance-large" style={{ fontSize: '56px', marginBottom: '8px' }}>
                    {showBalanceHidden ? '••••••' : `$${(vaultBalance * 2000).toLocaleString()}`}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--nb-accent)' }}>
                        {vaultBalance.toFixed(4)} {currentChain.nativeCurrency.symbol}
                    </span>
                    <button onClick={() => setShowBalanceHidden(!showBalanceHidden)} style={{ background: 'none', border: 'none', color: 'var(--nb-text-dim)', cursor: 'pointer', padding: '4px' }}>
                        {showBalanceHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
            </div>

            {/* Primary Action Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                {isOwner && (
                    <>
                        <button className="nb-btn-primary" style={{ width: '100%', padding: '20px' }} onClick={onHeartbeat}>
                            <Heart size={20} fill="#000" />
                            Send Heartbeat
                        </button>
                        <button className="nb-btn-secondary glass-effect" style={{ width: '100%', padding: '16px', borderRadius: '18px', opacity: 1 }} onClick={onWithdraw}>
                            <ArrowUpRight size={18} />
                            Withdraw Funds
                        </button>
                    </>
                )}

                {isBeneficiary && isExpired && !vaultState.released && (
                    <button className="nb-btn-primary" style={{ width: '100%', background: 'var(--nb-accent)', padding: '20px' }} onClick={onClaim}>
                        <Unlock size={20} fill="#000" />
                        Claim Inheritance
                    </button>
                )}
            </div>

            {/* Security Timer - Prominent Section */}
            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Timer size={16} color="var(--nb-accent)" />
                    <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '1px', color: 'var(--nb-text-dim)' }}>SECURITY TIMER</span>
                </div>
                <Countdown lastHeartbeat={vaultState.lastHeartbeat} lockDuration={vaultState.lockDuration} released={vaultState.released} />
            </div>

            {/* Details List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div className="nb-list-item">
                    <div className="nb-list-icon"><Shield size={20} /></div>
                    <div className="nb-list-info">
                        <div className="nb-list-title">Vault Status</div>
                        <div className="nb-list-subtitle">{vaultState.released ? 'Funds Released' : 'Protected & Monitoring'}</div>
                    </div>
                    <div className="nb-list-value" style={{ color: vaultState.released ? '#ef4444' : '#22c55e' }}>
                        {vaultState.released ? 'RELEASED' : 'ACTIVE'}
                    </div>
                </div>

                <div className="nb-list-item" onClick={() => copyToClipboard(vaultState.beneficiary)}>
                    <div className="nb-list-icon"><Wallet size={20} /></div>
                    <div className="nb-list-info">
                        <div className="nb-list-title">Beneficiary</div>
                        <div className="nb-list-subtitle">Verified Heir</div>
                    </div>
                    <div className="nb-list-value">
                        {formatAddr(vaultState.beneficiary)}
                        <Copy size={12} style={{ marginLeft: '4px', opacity: 0.5 }} />
                    </div>
                </div>
            </div>
        </div>
    )
}
