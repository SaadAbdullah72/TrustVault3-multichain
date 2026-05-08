import { useState } from 'react'
import { Eye, EyeOff, Shield, Copy, Heart, Unlock, ArrowUpRight, MoreHorizontal, Home, History, Settings, QrCode, Activity, RefreshCw, ArrowLeft, ArrowRight, Code, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Countdown from './Countdown'
import { Toast } from './Toast'

export interface VaultDashboardProps {
    vaultState: any;
    vaultBalance: number;
    currentChain: any;
    vaultAddress: string;
    walletAddress: string | null;
    isOwner: boolean;
    isBeneficiary: boolean;
    isExpired: boolean;
    isLatest?: boolean;
    formatAddr: (addr: string) => string;
    copyToClipboard: (text: string) => void;
    onHeartbeat: () => void;
    onWithdraw: (amount: number) => void;
    onClaim: () => void;
    vaultName?: string;
    onRefresh?: () => void;
    onBack?: () => void;
    uiStatus: any;
    currentTab: 'dashboard' | 'security' | 'history' | 'info' | 'api';
    setCurrentTab: (tab: 'dashboard' | 'security' | 'history' | 'info' | 'api') => void;
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
    isLatest,
    formatAddr,
    copyToClipboard,
    onHeartbeat,
    onWithdraw,
    onClaim,
    vaultName,
    onRefresh,
    onBack,
    uiStatus,
    currentTab,
    setCurrentTab
}: VaultDashboardProps) {
    const { t } = useTranslation()
    const [showBalanceHidden, setShowBalanceHidden] = useState(false)
    const [showWithdrawInput, setShowWithdrawInput] = useState(false)
    const [withdrawAmount, setWithdrawAmount] = useState('')
    const [copyToast, setCopyToast] = useState(false)

    const symbol = currentChain.nativeCurrency.symbol
    const statusText = vaultState.released ? 'RELEASED' : isExpired ? 'EXPIRED' : 'ACTIVE'
    const statusColor = vaultState.released ? '#10b981' : isExpired ? '#ef4444' : '#10b981'
    const statusLabel = isExpired && !vaultState.released ? 'ACTION REQUIRED' : statusText;

    // Correct address type label per chain
    const getAddressLabel = () => {
        switch(currentChain.type) {
            case 'evm': return `${currentChain.nativeCurrency.symbol} Address`
            case 'solana': return 'Solana Address'
            case 'algorand': return 'Algorand Address'
            default: return 'Wallet Address'
        }
    }

    const handleCopyVault = () => {
        copyToClipboard(vaultAddress)
        setCopyToast(true)
    }

    const handleWithdrawSubmit = () => {
        const amt = parseFloat(withdrawAmount)
        if (isNaN(amt) || amt <= 0) return
        onWithdraw(amt)
        setShowWithdrawInput(false)
        setWithdrawAmount('')
    }

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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '15px' }}>Your Role</div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>In this vault</div>
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '8px' }}>
                                        {isOwner ? 'OWNER' : isBeneficiary ? 'BENEFICIARY' : 'VIEWER'}
                                    </div>
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
            case 'info':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ background: '#111e2f', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Vault Information</h3>
                            <button onClick={handleCopyVault} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-start', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}>
                                <Copy size={18} /> Copy Vault Address
                            </button>
                            <div style={{ marginTop: '16px', background: '#080e17', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Vault Address</div>
                                <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', wordBreak: 'break-all' }}>{vaultAddress}</div>
                            </div>
                            <div style={{ marginTop: '12px', background: '#080e17', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase' }}>Network</div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{currentChain.name}</div>
                            </div>
                        </div>
                    </div>
                )
            case 'api':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
                        <div style={{ 
                            background: 'linear-gradient(135deg, #111e2f 0%, #0d1724 100%)', 
                            padding: '32px 24px', 
                            borderRadius: '24px', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            color: '#fff',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', filter: 'blur(30px)' }}></div>
                            
                            <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Code size={32} color="#10b981" />
                            </div>
                            
                            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '12px' }}>TrustVault API & SDK</h3>
                            <div style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', fontSize: '11px', fontWeight: 800, color: '#10b981', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Coming Soon
                            </div>
                            
                            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '32px', maxWidth: '340px', margin: '0 auto 32px' }}>
                                We are building a powerful multi-chain SDK to bring decentralized inheritance to every Web3 application.
                            </p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ color: '#10b981', marginTop: '2px' }}><Shield size={18} /></div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '14px' }}>Inheritance-as-a-Service</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>Integrate dead man's switches into any wallet or game.</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ color: '#10b981', marginTop: '2px' }}><Activity size={18} /></div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '14px' }}>Global Heartbeat Monitor</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>Centralized monitoring with decentralized execution.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            default:
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Balance Card */}
                        <div style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '24px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>{vaultName || 'Protected Vault'}</div>
                                <div style={{ fontSize: '10px', fontWeight: 700, color: statusColor, background: `${statusColor}20`, padding: '2px 8px', borderRadius: '6px' }}>{statusLabel}</div>
                                {isLatest && (
                                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', padding: '2px 8px', borderRadius: '6px' }}>LATEST</div>
                                )}
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

                        {/* Action Buttons — Heartbeat, Withdraw, Refresh */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <button 
                                onClick={onHeartbeat} 
                                disabled={uiStatus.loading}
                                style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', padding: '20px 8px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer', opacity: uiStatus.loading ? 0.5 : 1 }}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Heart size={22} color="#fff" fill="#fff" className={uiStatus.loading ? 'pulse' : ''} />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Heartbeat</span>
                            </button>
                            <button 
                                onClick={() => setShowWithdrawInput(true)} 
                                disabled={uiStatus.loading}
                                style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', padding: '20px 8px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer', opacity: uiStatus.loading ? 0.5 : 1 }}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ArrowUpRight size={22} color="#000" />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Withdraw</span>
                            </button>
                            <button 
                                onClick={onRefresh} 
                                disabled={uiStatus.loading}
                                style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', padding: '20px 8px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer', opacity: uiStatus.loading ? 0.5 : 1 }}
                            >
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <RefreshCw size={22} color="#fff" className={uiStatus.loading ? 'spinning' : ''} />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Refresh</span>
                            </button>
                        </div>

                        {/* Withdraw Amount Input (shown on demand) */}
                        {showWithdrawInput && (
                            <div style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '18px', padding: '20px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>Withdraw Amount ({symbol})</div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input 
                                        type="number" 
                                        value={withdrawAmount} 
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder={`Max: ${vaultBalance.toFixed(4)}`}
                                        style={{ flex: 1, background: '#080e17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '16px', outline: 'none' }}
                                    />
                                    <button onClick={handleWithdrawSubmit} style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '12px', padding: '14px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>
                                        Withdraw
                                    </button>
                                </div>
                                <button onClick={() => { setShowWithdrawInput(false); setWithdrawAmount('') }} style={{ marginTop: '8px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                                    Cancel
                                </button>
                            </div>
                        )}

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
            {/* Copy toast */}
            {copyToast && <Toast message="Address copied!" type="success" onClose={() => setCopyToast(false)} duration={2000} />}

            {/* Header */}
            <div style={{ background: '#0B131E', padding: '24px 20px 20px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {onBack && (
                            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Shield size={16} />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '0.5px' }}>TRUSTVAULT 3</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {walletAddress && (
                            <div style={{ 
                                fontSize: '13px', 
                                fontWeight: 800, 
                                color: '#fff', 
                                background: 'rgba(16, 185, 129, 0.1)', 
                                padding: '8px 16px', 
                                borderRadius: '12px', 
                                border: '1px solid rgba(16, 185, 129, 0.2)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                boxShadow: '0 0 15px rgba(16, 185, 129, 0.05)'
                            }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                                {formatAddr(walletAddress)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                {renderContent()}
            </div>

            {/* Bottom Nav (Mobile) */}
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
                <button onClick={() => setCurrentTab('info')} style={{ background: 'none', border: 'none', color: currentTab === 'info' ? '#fff' : '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <Info size={22} />
                    <span style={{ fontSize: '10px', fontWeight: 700 }}>Info</span>
                </button>
                <button onClick={() => setCurrentTab('api')} style={{ background: 'none', border: 'none', color: currentTab === 'api' ? '#fff' : '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <Code size={22} />
                    <span style={{ fontSize: '10px', fontWeight: 700 }}>API</span>
                </button>
            </div>

            <style>{`
                @media (min-width: 1024px) {
                    .mobile-nav { display: none !important; }
                }
                .fade-in-image {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
                .spinning { animation: spin 1s linear infinite; }
                .pulse { animation: pulse 1s ease-in-out infinite; }
            `}</style>
        </div>
    )
}
