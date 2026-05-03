import { useState } from 'react'
import { Eye, EyeOff, Shield, Wallet, Timer, FileText, Copy, Heart, Unlock, ArrowUpRight, Asterisk, MoreHorizontal, Search, Bell, MessageCircle, Plus, Home, History, Settings, QrCode, Share2, Activity, User, Clock, Zap } from 'lucide-react'
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
    currentTab: 'dashboard' | 'security' | 'history' | 'settings';
    setCurrentTab: (tab: 'dashboard' | 'security' | 'history' | 'settings') => void;
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
    onClaim,
    currentTab,
    setCurrentTab
}: VaultDashboardProps) {
    const { t } = useTranslation()
    const [showBalanceHidden, setShowBalanceHidden] = useState(false)

    const symbol = currentChain.nativeCurrency.symbol
    const statusText = vaultState.released ? 'RELEASED' : isExpired ? 'EXPIRED' : 'ACTIVE'
    const statusColor = vaultState.released ? '#10b981' : isExpired ? '#ef4444' : '#10b981'

    const renderContent = () => {
        switch (currentTab) {
            case 'security':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ background: '#111e2f', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Security Settings</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '15px' }}>Auto-Release Timer</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Reset on every heartbeat</div>
                                    </div>
                                    <div style={{ fontWeight: 800, color: '#fff' }}>{vaultState.lockDuration}s</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '15px' }}>Vault Status</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Current protocol state</div>
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: statusColor, background: `${statusColor}20`, padding: '4px 10px', borderRadius: '8px' }}>{statusText}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 'history':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Recent Activity</h3>
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                            <Activity size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                            <p style={{ fontSize: '14px' }}>Transaction history will appear here after vault interactions.</p>
                        </div>
                    </div>
                )
            case 'settings':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ background: '#111e2f', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Protocol Settings</h3>
                            <button className="nb-btn-secondary" onClick={() => copyToClipboard(vaultAddress)} style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '14px', borderRadius: '12px', cursor: 'pointer' }}>
                                <Copy size={18} /> Copy Vault Address
                            </button>
                            <button className="nb-btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(255,255,255,0.1)', border: 'none', marginTop: '12px', color: '#fff', padding: '14px', borderRadius: '12px', cursor: 'pointer' }}>
                                <QrCode size={18} /> Show QR Code
                            </button>
                        </div>
                    </div>
                )
            default:
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Balance Card */}
                        <div style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '24px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Vault Balance</div>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: statusColor, background: `${statusColor}20`, padding: '2px 8px', borderRadius: '6px' }}>{statusText}</div>
                            </div>
                            <div style={{ fontSize: '36px', fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', marginBottom: '4px' }}>
                                {showBalanceHidden ? '••••••' : `${vaultBalance.toFixed(4)}`}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '15px', fontWeight: 700, color: '#94a3b8' }}>{symbol}</span>
                                <button onClick={() => setShowBalanceHidden(!showBalanceHidden)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                    {showBalanceHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <button onClick={onHeartbeat} style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', padding: '20px 8px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Heart size={22} color="#fff" fill="#fff" />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Heartbeat</span>
                            </button>
                            <button onClick={onWithdraw} style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', padding: '20px 8px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ArrowUpRight size={22} color="#000" />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Withdraw</span>
                            </button>
                            <button onClick={() => copyToClipboard(vaultAddress)} style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', padding: '20px 8px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Copy size={22} color="#fff" />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Deposit</span>
                            </button>
                        </div>

                        {/* Countdown Timer */}
                        <div style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Auto-Release Countdown</div>
                            <Countdown lastHeartbeat={vaultState.lastHeartbeat} lockDuration={vaultState.lockDuration} released={vaultState.released} />
                        </div>

                        {/* Vault Info Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '16px' }}>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Owner</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', wordBreak: 'break-all' }}>{formatAddr(vaultState.owner || '')}</div>
                                {isOwner && <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, marginTop: '4px' }}>YOU</div>}
                            </div>
                            <div style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '16px' }}>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Beneficiary</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', wordBreak: 'break-all' }}>{formatAddr(vaultState.beneficiary || '')}</div>
                                {isBeneficiary && <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, marginTop: '4px' }}>YOU</div>}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '16px' }}>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lock Duration</div>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{vaultState.lockDuration}s</div>
                            </div>
                            <div style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '16px' }}>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Network</div>
                                <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{currentChain.name}</div>
                            </div>
                        </div>

                        {/* Claim Button */}
                        {isBeneficiary && isExpired && !vaultState.released && (
                            <button onClick={onClaim} style={{ width: '100%', padding: '18px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '18px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <Unlock size={20} /> Claim Inheritance
                            </button>
                        )}
                    </div>
                )
        }
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0B131E' }}>
            {/* Header */}
            <div style={{ background: '#0B131E', padding: '24px 20px 32px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={18} />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '16px' }}>TRUSTVAULT</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', background: '#111e2f', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {walletAddress ? formatAddr(walletAddress) : ''}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                {renderContent()}
            </div>

            {/* Bottom Nav (Mobile Only) */}
            <div className="mobile-nav" style={{ 
                padding: '12px 24px 28px', 
                background: '#0d1724', 
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', 
                justifyContent: 'space-around',
                alignItems: 'center'
            }}>
                <button onClick={() => setCurrentTab('dashboard')} style={{ background: 'none', border: 'none', color: currentTab === 'dashboard' ? '#fff' : '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <Home size={22} />
                    <span style={{ fontSize: '10px', fontWeight: 700 }}>Vault</span>
                </button>
                <button onClick={() => setCurrentTab('security')} style={{ background: 'none', border: 'none', color: currentTab === 'security' ? '#fff' : '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <Shield size={22} />
                    <span style={{ fontSize: '10px', fontWeight: 700 }}>Safe</span>
                </button>
                <button onClick={() => setCurrentTab('history')} style={{ background: 'none', border: 'none', color: currentTab === 'history' ? '#fff' : '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <History size={22} />
                    <span style={{ fontSize: '10px', fontWeight: 700 }}>Activity</span>
                </button>
                <button onClick={() => setCurrentTab('settings')} style={{ background: 'none', border: 'none', color: currentTab === 'settings' ? '#fff' : '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <MoreHorizontal size={22} />
                    <span style={{ fontSize: '10px', fontWeight: 700 }}>More</span>
                </button>
            </div>

            <style>{`
                @media (min-width: 1024px) {
                    .mobile-nav { display: none !important; }
                }
            `}</style>
        </div>
    )
}
