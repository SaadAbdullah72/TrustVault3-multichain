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
            {/* Strictly following User's Primary Gradient Header */}
            <div style={{ 
                background: 'linear-gradient(180deg, #1E3C72 0%, #2A5298 100%)', 
                padding: '32px 24px 64px',
                color: '#fff',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <Asterisk size={20} color="#fff" />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '0.5px' }}>TRUSTVAULT</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', opacity: 0.8 }}>
                        <Search size={22} />
                        <Bell size={22} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ width: '22px', height: '15px', background: '#3B82F6', borderRadius: '2px' }} />
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>ACTIVE VAULT</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area (White Cards Strictly Following User Config) */}
            <div style={{ 
                marginTop: '-32px', 
                background: '#F2F2F7', 
                borderRadius: '32px 32px 0 0', 
                flex: 1, 
                padding: '32px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                overflowY: 'auto'
            }}>
                {/* Balance Card (White Surface) */}
                <div style={{ 
                    background: '#FFFFFF', 
                    borderRadius: '24px', 
                    padding: '28px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#8E8E93', letterSpacing: '1px', marginBottom: '8px', textTransform: 'uppercase' }}>Available Funds</div>
                    <div className="nb-balance-large" style={{ color: '#1C1C1E', marginBottom: '12px' }}>
                        {showBalanceHidden ? '••••••' : `$${(vaultBalance * 2000).toLocaleString()}`}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#3B82F6' }}>
                            {vaultBalance.toFixed(4)} {currentChain.nativeCurrency.symbol}
                        </span>
                        <button onClick={() => setShowBalanceHidden(!showBalanceHidden)} style={{ background: 'none', border: 'none', color: '#8E8E93', cursor: 'pointer', padding: '4px' }}>
                            {showBalanceHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {/* Main Actions (Primary Blue) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {isOwner && (
                        <>
                            <button className="nb-btn-primary" onClick={onHeartbeat} style={{ background: '#3B82F6', borderRadius: '18px', padding: '20px' }}>
                                <Heart size={22} fill="#fff" />
                                Send Protection Heartbeat
                            </button>
                            <button className="nb-btn-secondary" onClick={onWithdraw} style={{ background: '#FFFFFF', border: '1px solid #E5E5EA', borderRadius: '18px', padding: '18px' }}>
                                <ArrowUpRight size={20} color="#3B82F6" />
                                Withdraw Funds
                            </button>
                        </>
                    )}

                    {isBeneficiary && isExpired && !vaultState.released && (
                        <button className="nb-btn-primary" style={{ background: '#16C784', borderRadius: '18px', padding: '20px' }} onClick={onClaim}>
                            <Unlock size={22} fill="#fff" />
                            Claim Inheritance Now
                        </button>
                    )}
                </div>

                {/* Details Section (White List Items) */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#1C1C1E' }}>Vault Protocol</span>
                        <MoreHorizontal size={20} color="#8E8E93" />
                    </div>

                    <div className="nb-list-item" style={{ background: '#FFFFFF', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', borderRadius: '20px' }}>
                        <div className="nb-list-icon" style={{ background: '#F2F2F7', color: '#3B82F6' }}><Timer size={24} /></div>
                        <div className="nb-list-info">
                            <div className="nb-list-title" style={{ color: '#1C1C1E', fontWeight: 700 }}>Security Timer</div>
                            <div className="nb-list-subtitle" style={{ color: '#8E8E93' }}>Time remaining until release</div>
                        </div>
                        <div className="nb-list-value" style={{ color: '#1C1C1E' }}>
                            <Countdown lastHeartbeat={vaultState.lastHeartbeat} lockDuration={vaultState.lockDuration} released={vaultState.released} compact />
                        </div>
                    </div>

                    <div className="nb-list-item" style={{ background: '#FFFFFF', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', borderRadius: '20px' }}>
                        <div className="nb-list-icon" style={{ background: '#F2F2F7', color: '#16C784' }}><Shield size={24} /></div>
                        <div className="nb-list-info">
                            <div className="nb-list-title" style={{ color: '#1C1C1E', fontWeight: 700 }}>Vault Status</div>
                            <div className="nb-list-subtitle" style={{ color: '#8E8E93' }}>{vaultState.released ? 'Funds Released' : 'Monitoring Active'}</div>
                        </div>
                        <div className="nb-list-value" style={{ color: vaultState.released ? '#FF3B30' : '#16C784', fontWeight: 800 }}>
                            {vaultState.released ? 'RELEASED' : 'SECURED'}
                        </div>
                    </div>

                    <div className="nb-list-item" style={{ background: '#FFFFFF', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', borderRadius: '20px' }} onClick={() => copyToClipboard(vaultState.beneficiary)}>
                        <div className="nb-list-icon" style={{ background: '#F2F2F7', color: '#3B82F6' }}><Wallet size={24} /></div>
                        <div className="nb-list-info">
                            <div className="nb-list-title" style={{ color: '#1C1C1E', fontWeight: 700 }}>Beneficiary</div>
                            <div className="nb-list-subtitle" style={{ color: '#8E8E93' }}>Inheritance recipient</div>
                        </div>
                        <div className="nb-list-value" style={{ color: '#3B82F6' }}>
                            {formatAddr(vaultState.beneficiary)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Nav Simulation */}
            <div style={{ 
                padding: '16px 32px 32px', 
                background: '#FFFFFF', 
                borderTop: '1px solid #E5E5EA',
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Wallet size={26} color="#3B82F6" />
                <Search size={26} color="#C7C7CC" />
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-48px', border: '6px solid #F2F2F7', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)' }}>
                    <Asterisk size={28} color="#fff" strokeWidth={3} />
                </div>
                <Timer size={26} color="#C7C7CC" />
                <MoreHorizontal size={26} color="#C7C7CC" />
            </div>
        </div>
    )
}
