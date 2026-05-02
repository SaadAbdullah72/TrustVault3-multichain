import { useState } from 'react'
import { Eye, EyeOff, Shield, Wallet, Timer, FileText, Copy, Heart, Unlock, ArrowUpRight, Asterisk, MoreHorizontal, Search, Bell, MessageCircle, Plus } from 'lucide-react'
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
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F2F2F7' }}>
            {/* Compact Gradient Header */}
            <div style={{ 
                background: 'linear-gradient(180deg, #1E3C72 0%, #2A5298 100%)', 
                padding: '16px 20px 48px',
                color: '#fff',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Asterisk size={16} color="#fff" />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.5px' }}>TRUSTVAULT</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', opacity: 0.8 }}>
                        <Search size={18} />
                        <Bell size={18} />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '10px', width: 'fit-content' }}>
                    <div style={{ width: '16px', height: '12px', background: '#3B82F6', borderRadius: '2px' }} />
                    <span style={{ fontSize: '11px', fontWeight: 700 }}>ACTIVE VAULT</span>
                </div>
            </div>

            {/* Main Content Area (Compact View) */}
            <div style={{ 
                marginTop: '-24px', 
                background: '#F2F2F7', 
                borderRadius: '24px 24px 0 0', 
                flex: 1, 
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                overflowY: 'auto'
            }}>
                {/* Balance Card (Shrunk) */}
                <div style={{ 
                    background: '#FFFFFF', 
                    borderRadius: '20px', 
                    padding: '20px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#8E8E93', letterSpacing: '0.5px', marginBottom: '4px', textTransform: 'uppercase' }}>Available Funds</div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#1C1C1E', letterSpacing: '-1px', marginBottom: '4px' }}>
                        {showBalanceHidden ? '••••••' : `$${(vaultBalance * 2000).toLocaleString()}`}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#3B82F6' }}>
                            {vaultBalance.toFixed(4)} {currentChain.nativeCurrency.symbol}
                        </span>
                        <button onClick={() => setShowBalanceHidden(!showBalanceHidden)} style={{ background: 'none', border: 'none', color: '#8E8E93', cursor: 'pointer' }}>
                            {showBalanceHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                    </div>
                </div>

                {/* Main Actions (Compact Layout) */}
                <div style={{ display: 'grid', gridTemplateColumns: isOwner ? '1fr' : '1fr', gap: '10px' }}>
                    {isOwner && (
                        <>
                            <button className="nb-btn-primary" onClick={onHeartbeat} style={{ padding: '16px', borderRadius: '14px', fontSize: '15px' }}>
                                <Heart size={18} fill="#fff" />
                                Send Heartbeat
                            </button>
                            <button className="nb-btn-secondary" onClick={onWithdraw} style={{ padding: '14px', borderRadius: '14px', fontSize: '14px', background: '#fff' }}>
                                <ArrowUpRight size={16} color="#3B82F6" />
                                Withdraw
                            </button>
                        </>
                    )}

                    {isBeneficiary && isExpired && !vaultState.released && (
                        <button className="nb-btn-primary" style={{ background: '#16C784', padding: '16px', borderRadius: '14px' }} onClick={onClaim}>
                            <Unlock size={18} fill="#fff" />
                            Claim Inheritance
                        </button>
                    )}
                </div>

                {/* Details Section (Compact List) */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#1C1C1E' }}>Protocol Details</span>
                        <MoreHorizontal size={18} color="#8E8E93" />
                    </div>

                    <div className="nb-list-item" style={{ padding: '12px', marginBottom: '8px', borderRadius: '16px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <div className="nb-list-icon" style={{ width: '36px', height: '36px', borderRadius: '10px' }}><Timer size={20} /></div>
                        <div className="nb-list-info" style={{ gap: '1px' }}>
                            <div className="nb-list-title" style={{ fontSize: '14px' }}>Security Timer</div>
                            <div className="nb-list-subtitle" style={{ fontSize: '11px' }}>Release countdown</div>
                        </div>
                        <div className="nb-list-value">
                            <Countdown lastHeartbeat={vaultState.lastHeartbeat} lockDuration={vaultState.lockDuration} released={vaultState.released} compact />
                        </div>
                    </div>

                    <div className="nb-list-item" style={{ padding: '12px', marginBottom: '8px', borderRadius: '16px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                        <div className="nb-list-icon" style={{ width: '36px', height: '36px', borderRadius: '10px', color: '#16C784' }}><Shield size={20} /></div>
                        <div className="nb-list-info">
                            <div className="nb-list-title" style={{ fontSize: '14px' }}>Status</div>
                            <div className="nb-list-subtitle" style={{ fontSize: '11px' }}>System health</div>
                        </div>
                        <div className="nb-list-value" style={{ color: vaultState.released ? '#FF3B30' : '#16C784', fontSize: '13px', fontWeight: 800 }}>
                            {vaultState.released ? 'RELEASED' : 'SECURED'}
                        </div>
                    </div>

                    <div className="nb-list-item" style={{ padding: '12px', marginBottom: '8px', borderRadius: '16px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }} onClick={() => copyToClipboard(vaultState.beneficiary)}>
                        <div className="nb-list-icon" style={{ width: '36px', height: '36px', borderRadius: '10px' }}><Wallet size={20} /></div>
                        <div className="nb-list-info">
                            <div className="nb-list-title" style={{ fontSize: '14px' }}>Beneficiary</div>
                            <div className="nb-list-subtitle" style={{ fontSize: '11px' }}>Recipient</div>
                        </div>
                        <div className="nb-list-value" style={{ color: '#3B82F6', fontSize: '13px' }}>
                            {formatAddr(vaultState.beneficiary)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Subtle Bottom Nav */}
            <div style={{ 
                padding: '12px 32px 24px', 
                background: '#FFFFFF', 
                borderTop: '1px solid #E5E5EA',
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Wallet size={22} color="#3B82F6" />
                <Search size={22} color="#C7C7CC" />
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-40px', border: '5px solid #F2F2F7', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)' }}>
                    <Asterisk size={24} color="#fff" strokeWidth={3} />
                </div>
                <Timer size={22} color="#C7C7CC" />
                <MoreHorizontal size={22} color="#C7C7CC" />
            </div>
        </div>
    )
}
