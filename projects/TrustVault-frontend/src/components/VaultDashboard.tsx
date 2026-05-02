import { useState } from 'react'
import { Eye, EyeOff, Shield, Wallet, Timer, FileText, Copy, Plus, Send, RefreshCw, MoreHorizontal, Asterisk } from 'lucide-react'
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
        <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Account Selector-like display */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '12px', 
                        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--nb-glass-border)'
                    }}>
                        <Asterisk size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--nb-text-dim)' }}>Vault Account</div>
                        <div style={{ fontSize: '15px', fontWeight: 700 }}>{formatAddr(vaultAddress)}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="nb-btn-secondary" style={{ padding: '8px' }}><MoreHorizontal size={20} /></button>
                </div>
            </div>

            {/* Large Balance Display */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--nb-text-dim)', marginBottom: '4px' }}>Total Balance</div>
                <div className="nb-balance-large">
                    {showBalanceHidden ? '••••••' : `$${(vaultBalance * 2000).toLocaleString()}`} {/* Mock USD conversion for premium look */}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--nb-accent)' }}>
                        {vaultBalance.toFixed(4)} {currentChain.nativeCurrency.symbol}
                    </span>
                    <button onClick={() => setShowBalanceHidden(!showBalanceHidden)} style={{ background: 'none', border: 'none', color: 'var(--nb-text-dim)', cursor: 'pointer' }}>
                        {showBalanceHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>
            </div>

            {/* Action Grid */}
            <div className="nb-action-grid">
                <div className="nb-action-item">
                    <div className="nb-list-icon" style={{ marginBottom: '0' }}><Plus size={20} /></div>
                    <span className="nb-action-label">Add</span>
                </div>
                <div className="nb-action-item">
                    <div className="nb-list-icon" style={{ marginBottom: '0' }}><Send size={20} /></div>
                    <span className="nb-action-label">Send</span>
                </div>
                <div className="nb-action-item">
                    <div className="nb-list-icon" style={{ marginBottom: '0' }}><RefreshCw size={20} /></div>
                    <span className="nb-action-label">Sync</span>
                </div>
                <div className="nb-action-item">
                    <div className="nb-list-icon" style={{ marginBottom: '0' }}><MoreHorizontal size={20} /></div>
                    <span className="nb-action-label">More</span>
                </div>
            </div>

            {/* Vault Details / Transaction-style list */}
            <div style={{ marginTop: '20px', flex: 1, overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 700 }}>Vault Configuration</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--nb-accent)' }}>View all</span>
                </div>

                <div className="nb-list-item">
                    <div className="nb-list-icon"><Timer size={20} /></div>
                    <div className="nb-list-info">
                        <div className="nb-list-title">Security Timer</div>
                        <div className="nb-list-subtitle">Heartbeat remaining</div>
                    </div>
                    <div className="nb-list-value">
                        <Countdown lastHeartbeat={vaultState.lastHeartbeat} lockDuration={vaultState.lockDuration} released={vaultState.released} compact />
                    </div>
                </div>

                <div className="nb-list-item">
                    <div className="nb-list-icon"><Shield size={20} /></div>
                    <div className="nb-list-info">
                        <div className="nb-list-title">Protection Status</div>
                        <div className="nb-list-subtitle">{vaultState.released ? 'Inactive' : 'Active & Guarded'}</div>
                    </div>
                    <div className="nb-list-value" style={{ color: vaultState.released ? '#ef4444' : '#22c55e' }}>
                        {vaultState.released ? 'RELEASED' : 'SECURED'}
                    </div>
                </div>

                <div className="nb-list-item" onClick={() => copyToClipboard(vaultState.beneficiary)}>
                    <div className="nb-list-icon"><Wallet size={20} /></div>
                    <div className="nb-list-info">
                        <div className="nb-list-title">Beneficiary</div>
                        <div className="nb-list-subtitle">Primary heir</div>
                    </div>
                    <div className="nb-list-value">
                        {formatAddr(vaultState.beneficiary)}
                        <Copy size={12} style={{ marginLeft: '4px', opacity: 0.5 }} />
                    </div>
                </div>
            </div>

            {/* Bottom Nav Mock for Mobile View */}
            <div style={{ 
                height: '80px', 
                borderTop: '1px solid var(--nb-glass-border)', 
                margin: '0 -24px', 
                padding: '0 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(10, 15, 25, 0.8)',
                backdropFilter: 'blur(20px)'
            }}>
                <Asterisk size={24} style={{ color: 'var(--nb-accent)' }} />
                <Wallet size={24} style={{ opacity: 0.5 }} />
                <Shield size={24} style={{ opacity: 0.5 }} />
                <MoreHorizontal size={24} style={{ opacity: 0.5 }} />
            </div>
        </div>
    )
}
