import { useState } from 'react'
import { Eye, EyeOff, Shield, Copy, Heart, Unlock, ArrowUpRight, MoreHorizontal, Home, History, Settings, QrCode, Activity, RefreshCw, ArrowLeft, ArrowRight, Code, Info, Key, Package, Layout } from 'lucide-react'
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
    const [showDocs, setShowDocs] = useState(false)

    const vaultData = vaultState || {}
    const symbol = currentChain?.nativeCurrency?.symbol || ''
    const statusText = vaultData.released ? 'RELEASED' : isExpired ? 'EXPIRED' : 'ACTIVE'
    const statusColor = vaultData.released ? '#10b981' : isExpired ? '#ef4444' : '#10b981'
    const statusLabel = isExpired && !vaultData.released ? 'ACTION REQUIRED' : statusText;

    // Correct address type label per chain
    const getAddressLabel = () => {
        if (!currentChain) return 'Wallet Address'
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center' }} className="fade-in">
                        <div style={{ background: 'rgba(17, 30, 47, 0.6)', backdropFilter: 'blur(10px)', padding: '32px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                    <Shield size={20} color="#3b82f6" />
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Security Protocol</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Release Timer</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>Resets on heartbeat</div>
                                    </div>
                                    <div style={{ fontWeight: 900, color: '#fff', fontSize: '18px' }}>{vaultData.lockDuration || 0}s</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Protocol Status</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>Current vault health</div>
                                    </div>
                                    <div style={{ fontSize: '11px', fontWeight: 900, color: statusColor, background: `${statusColor}15`, padding: '6px 12px', borderRadius: '8px', border: `1px solid ${statusColor}30` }}>{statusText}</div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Access Role</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>Permissions level</div>
                                    </div>
                                    <div style={{ fontSize: '11px', fontWeight: 900, color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px' }}>
                                        {isOwner ? 'OWNER' : isBeneficiary ? 'BENEFICIARY' : 'VIEWER'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 'history':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} className="fade-in">
                        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Activity size={32} color="#94a3b8" style={{ opacity: 0.5 }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', marginBottom: '8px' }}>Recent Activity</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '280px', lineHeight: 1.6 }}>Transaction history will appear here once you interact with your vault protocol.</p>
                        </div>
                    </div>
                )
            case 'info':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center' }} className="fade-in">
                        <div style={{ background: 'rgba(17, 30, 47, 0.6)', backdropFilter: 'blur(10px)', padding: '32px', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', marginBottom: '24px', letterSpacing: '-0.5px' }}>Vault Metadata</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ background: 'rgba(8, 14, 23, 0.6)', borderRadius: '18px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Vault Identifier</div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', wordBreak: 'break-all', fontFamily: "'JetBrains Mono', monospace", marginBottom: '12px' }}>{vaultAddress}</div>
                                    <button onClick={handleCopyVault} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', background: '#fff', border: 'none', color: '#000', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '13px' }}>
                                        <Copy size={16} /> Copy Address
                                    </button>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ flex: 1, background: 'rgba(8, 14, 23, 0.6)', borderRadius: '18px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Network</div>
                                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>{currentChain?.name}</div>
                                    </div>
                                    <div style={{ flex: 1, background: 'rgba(8, 14, 23, 0.6)', borderRadius: '18px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Version</div>
                                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>V3.0.1</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 'api':
                const apiKey = walletAddress ? `${walletAddress.toUpperCase()}_TV_MAIN` : 'Connect wallet first';
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }} className="fade-in">
                        {/* Professional Header */}
                        <div>
                            <h2 style={{ fontSize: '28px', fontWeight: 950, color: '#fff', letterSpacing: '-1px', marginBottom: '8px' }}>SDK Integration</h2>
                            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6 }}>Connect TrustVault 3 to your application with our high-performance SDK.</p>
                        </div>

                        {/* Step 1: Credentials */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '32px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}>1</div>
                                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>Get Your API Key</h4>
                            </div>
                            <div style={{ background: '#080e17', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <code style={{ flex: 1, fontSize: '13px', color: '#3b82f6', fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden' }}>{apiKey}</code>
                                <button onClick={() => { copyToClipboard(apiKey); setCopyToast(true); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}>
                                    <Copy size={16} color="#94a3b8" />
                                </button>
                            </div>
                        </div>

                        {/* Step 2: Install */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '32px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}>2</div>
                                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>Install Package</h4>
                            </div>
                            <div style={{ background: '#080e17', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <code style={{ flex: 1, fontSize: '13px', color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>npm i @trustvault/sdk-core</code>
                                <button onClick={() => { copyToClipboard('npm i @trustvault/sdk-core'); setCopyToast(true); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}>
                                    <Copy size={16} color="#94a3b8" />
                                </button>
                            </div>
                        </div>

                        {/* Step 3: Implementation */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '32px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}>3</div>
                                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>Quick Start</h4>
                            </div>
                            <div style={{ background: '#080e17', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }}>
                                <pre style={{ margin: 0, fontSize: '13px', lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace" }}>
                                    <span style={{ color: '#64748b' }}>// Init SDK</span><br/>
                                    <span style={{ color: '#c084fc' }}>const</span> tv = <span style={{ color: '#c084fc' }}>new</span> TrustVault(apiKey);<br/><br/>
                                    <span style={{ color: '#64748b' }}>// Create Protocol</span><br/>
                                    <span style={{ color: '#c084fc' }}>await</span> tv.createVault({'{'}<br/>
                                    &nbsp;&nbsp;beneficiary: <span style={{ color: '#fbbf24' }}>"0x..."</span>,<br/>
                                    &nbsp;&nbsp;timer: <span style={{ color: '#3b82f6' }}>86400</span><br/>
                                    {'}'});
                                </pre>
                            </div>
                        </div>

                        {/* Professional Footer Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '20px', borderRadius: '20px', fontSize: '14px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }} className="btn-scale">
                                <Code size={20} /> Docs
                            </button>
                            <button style={{ background: '#fff', color: '#000', border: 'none', padding: '20px', borderRadius: '20px', fontSize: '14px', fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }} className="btn-scale">
                                <Activity size={20} /> Demo
                            </button>
                        </div>
                    </div>
                )
            default:
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }} className="fade-in">
                        {/* Balance Card */}
                        <div style={{ background: 'rgba(17, 30, 47, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', padding: '32px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>{vaultName || 'Protected Vault'}</div>
                                <div style={{ fontSize: '10px', fontWeight: 800, color: statusColor, background: `${statusColor}15`, padding: '4px 10px', borderRadius: '8px', border: `1px solid ${statusColor}30` }}>{statusLabel}</div>
                            </div>
                            <div style={{ fontSize: '48px', fontWeight: 950, color: '#fff', letterSpacing: '-2px', marginBottom: '8px', lineHeight: 1 }}>
                                {showBalanceHidden ? '••••••' : `${vaultBalance.toFixed(4)}`}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '16px', fontWeight: 800, color: '#94a3b8' }}>{symbol}</span>
                                <button onClick={() => setShowBalanceHidden(!showBalanceHidden)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '8px' }}>
                                    {showBalanceHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <button onClick={onHeartbeat} disabled={uiStatus.loading} className="btn-scale" style={{ background: 'rgba(17, 30, 47, 0.6)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px 12px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', opacity: uiStatus.loading ? 0.5 : 1 }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)' }}>
                                    <Heart size={22} color="#fff" fill="#fff" className={uiStatus.loading ? 'pulse' : ''} />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Heartbeat</span>
                            </button>
                            <button onClick={() => setShowWithdrawInput(true)} disabled={uiStatus.loading} className="btn-scale" style={{ background: 'rgba(17, 30, 47, 0.6)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px 12px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', opacity: uiStatus.loading ? 0.5 : 1 }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(255, 255, 255, 0.1)' }}>
                                    <ArrowUpRight size={22} color="#000" />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Withdraw</span>
                            </button>
                            <button onClick={onRefresh} disabled={uiStatus.loading} className="btn-scale" style={{ background: 'rgba(17, 30, 47, 0.6)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px 12px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', opacity: uiStatus.loading ? 0.5 : 1 }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <RefreshCw size={22} color="#fff" className={uiStatus.loading ? 'spinning' : ''} />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Refresh</span>
                            </button>
                        </div>

                        {/* Timer Card */}
                        <div style={{ background: 'rgba(17, 30, 47, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '28px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>System Status</div>
                            <Countdown lastHeartbeat={vaultData.lastHeartbeat || 0} lockDuration={vaultData.lockDuration || 0} released={vaultData.released || false} />
                        </div>
                    </div>
                )
        }
    }

    return (
        <div className="vault-dashboard-root" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#080e17', minHeight: '100%' }}>
            {/* Minimal Top Bar for Dashboard — Hide redundant back/title on desktop */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={onBack} className="mobile-only-back" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="mobile-only-back" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={16} />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '0.5px' }}>TRUSTVAULT 3</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {walletAddress && (
                        <div className="header-wallet-addr" style={{ 
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
                            boxShadow: '0 0 15px rgba(16, 185, 129, 0.05)',
                            whiteSpace: 'nowrap'
                        }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                            <span className="addr-text">{formatAddr(walletAddress)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area - Ensured Visibility */}
            <div className="dashboard-main-content" style={{ 
                flex: 1, 
                padding: 'clamp(20px, 4vw, 40px)', 
                display: 'flex', 
                flexDirection: 'column', 
                overflowY: 'auto',
                background: '#080e17',
                minHeight: '400px'
            }}>
                {renderContent() || (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No content available for this tab.
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            {copyToast && (
                <Toast 
                    message="Copied to clipboard!" 
                    type="success"
                    onClose={() => setCopyToast(false)} 
                />
            )}

            {/* SDK Documentation Modal */}
            {showDocs && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#0f172a', width: '100%', maxWidth: '650px', maxHeight: '85vh', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} className="fade-in">
                        <div style={{ padding: '28px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>Developer Documentation</h3>
                                <p style={{ fontSize: '13px', color: '#64748b' }}>TrustVault Core SDK Integration Guide</p>
                            </div>
                            <button onClick={() => setShowDocs(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '20px' }}>×</button>
                        </div>
                        
                        <div style={{ padding: '32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <section>
                                <h4 style={{ color: '#3b82f6', fontSize: '12px', fontWeight: 900, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>1. Package Installation</h4>
                                <div style={{ background: '#080e17', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <code style={{ fontSize: '13px', color: '#e2e8f0', fontFamily: 'monospace' }}>npm install @trustvault/sdk-core</code>
                                </div>
                            </section>

                            <section>
                                <h4 style={{ color: '#3b82f6', fontSize: '12px', fontWeight: 900, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>2. SDK Initialization</h4>
                                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '12px' }}>
                                    Initialize the SDK using your unique API Key. This identifies your application for analytics and cross-chain settlement.
                                </p>
                                <div style={{ background: '#080e17', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <pre style={{ fontSize: '12px', color: '#10b981', fontFamily: 'monospace', margin: 0, whiteSpace: 'pre-wrap' }}>
{`import { TrustVaultSDK } from '@trustvault/sdk-core';

const sdk = TrustVaultSDK.forEVM({
  apiKey: "YOUR_API_KEY",
  network: "testnet"
});`}
                                    </pre>
                                </div>
                            </section>

                            <section>
                                <h4 style={{ color: '#3b82f6', fontSize: '12px', fontWeight: 900, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>3. Deploying Vaults</h4>
                                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '12px' }}>
                                    Protect your users' assets by deploying a vault. You can track progress via the optional <code style={{color: '#fff'}}>onStatus</code> callback.
                                </p>
                                <div style={{ background: '#080e17', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <pre style={{ fontSize: '12px', color: '#10b981', fontFamily: 'monospace', margin: 0, whiteSpace: 'pre-wrap' }}>
{`const vaultId = await sdk.createVault({
  beneficiary: "0x...",
  lockDuration: 86400 * 365, // 1 Year
  depositAmount: 1.0,
  onStatus: (msg) => updateUI(msg)
});`}
                                    </pre>
                                </div>
                            </section>

                            <div style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '20px' }}>
                                <h5 style={{ color: '#3b82f6', fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>Security Note</h5>
                                <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                                    All transactions are executed on-chain via non-custodial smart contracts. TrustVault never has access to your users' private keys.
                                </p>
                            </div>
                        </div>

                        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <button 
                                onClick={() => setShowDocs(false)} 
                                style={{ 
                                    width: '100%', 
                                    padding: '18px', 
                                    borderRadius: '16px', 
                                    background: '#fff', 
                                    color: '#000', 
                                    border: 'none', 
                                    fontWeight: 900, 
                                    cursor: 'pointer',
                                    fontSize: '15px'
                                }}
                            >
                                Acknowledged
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                    .mobile-only-back { display: none !important; }
                 .btn-scale:active { transform: scale(0.96); }
                .fade-in {
                    animation: fadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                @media (max-width: 1023px) {
                    .dashboard-action-btn:active { transform: scale(0.95); }
                    .dashboard-main-content {
                        padding-top: 60px !important;
                    }
                    .vault-dashboard-root > div:first-child {
                        padding-right: 70px !important; /* Make room for 3-dots menu */
                    }
                    .addr-text {
                        max-width: 90px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }
                @media (max-width: 640px) {
                    .info-grid, .action-grid {
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                    }
                    .dashboard-main-content {
                        padding: 24px !important;
                        justify-content: center !important;
                    }
                    .action-btn {
                        padding: 20px 12px !important;
                    }
                    .action-btn span { font-size: 11px !important; }
                    .responsive-input-row {
                        flex-direction: column !important;
                        align-items: stretch !important;
                    }
                    .responsive-input-row button {
                        width: 100% !important;
                    }
                }
                @media (max-width: 400px) {
                    .action-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }
                .spinning { animation: spin 1s linear infinite; }
                .pulse { animation: pulse 1.5s ease-in-out infinite; }
            `}</style>
        </div>
    )
}
