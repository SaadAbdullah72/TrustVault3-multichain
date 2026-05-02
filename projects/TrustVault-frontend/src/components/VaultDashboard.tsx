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
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff' }}>
            {/* Top Gradient Header Area */}
            <div style={{ 
                background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)', 
                padding: '24px 24px 60px',
                color: '#fff'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                        <Search size={20} />
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>Search</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', opacity: 0.8 }}>
                        <MessageCircle size={20} />
                        <Bell size={20} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '12px' }}>
                        <div style={{ width: '20px', height: '14px', background: '#E31D23', borderRadius: '2px' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>USD 24,092.67</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
                        <div style={{ width: '20px', height: '14px', background: '#003399', borderRadius: '2px' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>EUR 7,805.91</span>
                    </div>
                </div>
            </div>

            {/* Main Content (White Body) */}
            <div style={{ 
                marginTop: '-40px', 
                background: '#fff', 
                borderRadius: '32px 32px 0 0', 
                flex: 1, 
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Balance Section */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '8px' }}>TOTAL BALANCE</div>
                    <div className="nb-balance-large">
                        {showBalanceHidden ? '••••••' : `$${(vaultBalance * 2000).toLocaleString()}`}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#38bdf8' }}>
                            {vaultBalance.toFixed(4)} {currentChain.nativeCurrency.symbol}
                        </span>
                        <button onClick={() => setShowBalanceHidden(!showBalanceHidden)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                            {showBalanceHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* Account Cards - Like the reference */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px' }}>
                    <div style={{ 
                        minWidth: '60px', 
                        height: '40px', 
                        background: '#000', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <Asterisk size={20} />
                    </div>
                    <div style={{ 
                        minWidth: '60px', 
                        height: '40px', 
                        background: '#f1f5f9', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#000',
                        border: '1px solid #e2e8f0'
                    }}>
                        <Asterisk size={20} />
                    </div>
                    <div style={{ 
                        minWidth: '60px', 
                        height: '40px', 
                        background: '#f1f5f9', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#94a3b8',
                        border: '1px dashed #cbd5e1'
                    }}>
                        <Plus size={20} />
                    </div>
                </div>

                {/* Primary Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
                    {isOwner && (
                        <>
                            <button className="nb-btn-primary" onClick={onHeartbeat}>
                                <Heart size={20} fill="#fff" />
                                Send Heartbeat
                            </button>
                            <button className="nb-btn-secondary" onClick={onWithdraw}>
                                <ArrowUpRight size={18} />
                                Withdraw Funds
                            </button>
                        </>
                    )}

                    {isBeneficiary && isExpired && !vaultState.released && (
                        <button className="nb-btn-primary" style={{ background: '#38bdf8' }} onClick={onClaim}>
                            <Unlock size={20} fill="#fff" />
                            Claim Inheritance
                        </button>
                    )}
                </div>

                {/* List Items - Like the "Transactions" list in reference */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800 }}>Vault Activity</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>View all</span>
                    </div>

                    <div className="nb-list-item">
                        <div className="nb-list-icon"><Timer size={22} /></div>
                        <div className="nb-list-info">
                            <div className="nb-list-title">Security Timer</div>
                            <div className="nb-list-subtitle">Heartbeat remaining</div>
                        </div>
                        <div className="nb-list-value">
                            <Countdown lastHeartbeat={vaultState.lastHeartbeat} lockDuration={vaultState.lockDuration} released={vaultState.released} compact />
                        </div>
                    </div>

                    <div className="nb-list-item">
                        <div className="nb-list-icon"><Shield size={22} /></div>
                        <div className="nb-list-info">
                            <div className="nb-list-title">Protection Status</div>
                            <div className="nb-list-subtitle">{vaultState.released ? 'Funds Released' : 'Monitoring System Active'}</div>
                        </div>
                        <div className="nb-list-value" style={{ color: vaultState.released ? '#ef4444' : '#22c55e' }}>
                            {vaultState.released ? 'RELEASED' : 'SECURED'}
                        </div>
                    </div>

                    <div className="nb-list-item" onClick={() => copyToClipboard(vaultState.beneficiary)}>
                        <div className="nb-list-icon"><Wallet size={22} /></div>
                        <div className="nb-list-info">
                            <div className="nb-list-title">Primary Beneficiary</div>
                            <div className="nb-list-subtitle">Verified heir address</div>
                        </div>
                        <div className="nb-list-value">
                            {formatAddr(vaultState.beneficiary)}
                        </div>
                    </div>
                </div>

                {/* Bottom Nav Simulation like Reference */}
                <div style={{ 
                    marginTop: '24px',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '16px 24px', 
                    background: '#fff', 
                    borderTop: '1px solid #f1f5f9',
                    margin: '0 -24px -32px'
                }}>
                    <Wallet size={24} color="#000" />
                    <Search size={24} color="#94a3b8" />
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-40px', border: '6px solid #fff' }}>
                        <Asterisk size={24} color="#fff" />
                    </div>
                    <Timer size={24} color="#94a3b8" />
                    <MoreHorizontal size={24} color="#94a3b8" />
                </div>
            </div>
        </div>
    )
}
