import { useState } from 'react'
import { Eye, EyeOff, Shield, Wallet, Timer, FileText, Copy, Heart, Unlock, ArrowUpRight, Asterisk, MoreHorizontal, Search, Bell, MessageCircle, Plus, Home, History, Settings, QrCode, Share2, Activity } from 'lucide-react'
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

    // Render Tab Content
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
                                        <div style={{ fontWeight: 700, fontSize: '15px' }}>2FA Verification</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>Additional security layer</div>
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '4px 10px', borderRadius: '8px' }}>INACTIVE</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 'history':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Recent Activity</h3>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="nb-list-item" style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#111e2f', padding: '14px', color: '#fff' }}>
                                <div className="nb-list-icon" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}><Activity size={18} /></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '14px' }}>Heartbeat Pulse</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{i} hour ago • Success</div>
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: 700 }}>+0.001 SOL</div>
                            </div>
                        ))}
                    </div>
                )
            case 'settings':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ background: '#111e2f', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Protocol Settings</h3>
                            <button className="nb-btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff' }}>
                                <Share2 size={18} /> Export Private Keys
                            </button>
                            <button className="nb-btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', background: 'rgba(255,255,255,0.1)', border: 'none', marginTop: '12px', color: '#fff' }}>
                                <QrCode size={18} /> Show QR Access
                            </button>
                        </div>
                    </div>
                )
            default:
                return (
                    <>
                        {/* Balance Card */}
                        <div style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '24px', textAlign: 'center' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>Total Protected Value</div>
                            <div style={{ fontSize: '40px', fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', marginBottom: '6px' }}>
                                {showBalanceHidden ? '••••••' : `$${(vaultBalance * 2000).toLocaleString()}`}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{vaultBalance.toFixed(4)} {currentChain.nativeCurrency.symbol}</span>
                                <button onClick={() => setShowBalanceHidden(!showBalanceHidden)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                    {showBalanceHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions (Functional Buttons as requested) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                            <button onClick={() => copyToClipboard(vaultAddress)} style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 8px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Copy size={20} /></div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Copy</span>
                            </button>
                            <button onClick={() => {}} style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 8px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><QrCode size={20} /></div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Scan</span>
                            </button>
                            <button onClick={onWithdraw} style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 8px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowUpRight size={20} /></div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>Send</span>
                            </button>
                            <button onClick={onHeartbeat} style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 8px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Heart size={20} fill="#000" /></div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Pulse</span>
                            </button>
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1 }}>
                            <div className="nb-list-item" style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#111e2f', padding: '14px', color: '#fff' }}>
                                <div className="nb-list-icon" style={{ background: 'transparent', color: '#fff' }}><Timer size={22} /></div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700 }}>Auto-Release Countdown</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Protocol safety timer</div>
                                </div>
                                <Countdown lastHeartbeat={vaultState.lastHeartbeat} lockDuration={vaultState.lockDuration} released={vaultState.released} compact />
                            </div>

                            {isBeneficiary && isExpired && !vaultState.released && (
                                <button className="nb-btn-primary" style={{ width: '100%', background: '#fff', color: '#000', marginTop: '12px', border: 'none' }} onClick={onClaim}>
                                    <Unlock size={20} /> Claim Inheritance
                                </button>
                            )}
                        </div>
                    </>
                )
        }
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0B131E' }}>
            {/* Header */}
            <div style={{ background: '#0B131E', padding: '24px 20px 48px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Asterisk size={18} />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '16px' }}>TRUSTVAULT</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Bell size={20} />
                        <Settings size={20} onClick={() => setCurrentTab('settings')} style={{ cursor: 'pointer' }} />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, marginTop: '-24px', background: '#0B131E', borderRadius: '24px 24px 0 0', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
                {renderContent()}
            </div>

            {/* Functional Bottom Nav (Mobile Only) */}
            <div className="mobile-nav" style={{ 
                padding: '12px 24px 28px', 
                background: '#0d1724', 
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <button onClick={() => setCurrentTab('dashboard')} style={{ background: 'none', border: 'none', color: currentTab === 'dashboard' ? '#fff' : '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <Home size={22} />
                    <span style={{ fontSize: '10px', fontWeight: 700 }}>Vault</span>
                </button>
                <button onClick={() => setCurrentTab('security')} style={{ background: 'none', border: 'none', color: currentTab === 'security' ? '#fff' : '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <Shield size={22} />
                    <span style={{ fontSize: '10px', fontWeight: 700 }}>Safe</span>
                </button>
                
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-44px', border: '6px solid #0B131E' }}>
                    <Plus size={24} color="#000" strokeWidth={3} />
                </div>

                <button onClick={() => setCurrentTab('history')} style={{ background: 'none', border: 'none', color: currentTab === 'history' ? '#fff' : '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <History size={22} />
                    <span style={{ fontSize: '10px', fontWeight: 700 }}>Activity</span>
                </button>
                <button onClick={() => setCurrentTab('settings')} style={{ background: 'none', border: 'none', color: currentTab === 'settings' ? '#fff' : '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <MoreHorizontal size={22} />
                    <span style={{ fontSize: '10px', fontWeight: 700 }}>Menu</span>
                </button>
            </div>

            <style>{`
                @media (min-width: 1024px) {
                    .mobile-nav { display: none; }
                }
            `}</style>
        </div>
    )
}
