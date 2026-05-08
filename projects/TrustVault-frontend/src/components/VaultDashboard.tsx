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
                const apiKey = walletAddress ? `${walletAddress.toUpperCase()}_TV_MAIN` : 'Connect wallet first';
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }} className="fade-in">
                        {/* Enterprise Portal Header */}
                        <div style={{ marginBottom: '8px' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', marginBottom: '8px' }}>Developer Portal</h2>
                            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
                                Securely integrate TrustVault 3 into your dApp or enterprise workflow. 
                                Leverage our cross-chain inheritance protocol with a single unified SDK.
                            </p>
                        </div>

                        {/* Integration Credentials Card */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                        <Shield size={24} color="#3b82f6" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>API Credentials</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Production Environment</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 900, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', cursor: 'default' }}>V3.4.0</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 800, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Project API Key</label>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#080e17', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <code style={{ flex: 1, fontSize: '13px', color: '#cbd5e1', fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden', textOverflow: 'ellipsis' }}>{apiKey}</code>
                                        <button 
                                            onClick={() => { copyToClipboard(apiKey); setCopyToast(true); }}
                                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Copy size={16} color="#94a3b8" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SDK Documentation (The "Mature" Guide) */}
                        <div style={{ background: '#111e2f', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                                    <Terminal size={20} color="#a855f7" />
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>Integration Guide</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                {/* Step 1: Install */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>1</div>
                                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Installation</h4>
                                    </div>
                                    <div style={{ background: '#080e17', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.03)', position: 'relative' }}>
                                        <code style={{ fontSize: '13px', color: '#3b82f6', fontFamily: "'JetBrains Mono', monospace" }}>npm install @trustvault/sdk-core</code>
                                        <button 
                                            onClick={() => { copyToClipboard('npm install @trustvault/sdk-core'); setCopyToast(true); }}
                                            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            <Copy size={14} color="#64748b" />
                                        </button>
                                    </div>
                                </div>

                                {/* Step 2: Initialize */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900 }}>2</div>
                                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>Quick Integration</h4>
                                    </div>
                                    <div style={{ background: '#080e17', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <pre style={{ margin: 0, overflowX: 'auto', fontSize: '13px', lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace" }}>
                                            <span style={{ color: '#94a3b8' }}>// Initialize with your API Key</span><br/>
                                            <span style={{ color: '#f472b6' }}>const</span> sdk = <span style={{ color: '#f472b6' }}>new</span> TrustVaultSDK(apiKey);<br/><br/>
                                            <span style={{ color: '#94a3b8' }}>// Create a secure inheritance protocol</span><br/>
                                            <span style={{ color: '#f472b6' }}>await</span> sdk.createVault({'{'}<br/>
                                            &nbsp;&nbsp;beneficiary: <span style={{ color: '#fbbf24' }}>"0x..."</span>,<br/>
                                            &nbsp;&nbsp;lockDuration: <span style={{ color: '#818cf8' }}>86400</span>, <span style={{ color: '#94a3b8' }}>// 24 Hours</span><br/>
                                            &nbsp;&nbsp;deposit: <span style={{ color: '#818cf8' }}>0.5</span><br/>
                                            {'}'});
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '16px', borderRadius: '14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Code size={18} /> API Reference
                                </button>
                                <button style={{ background: '#fff', color: '#000', border: 'none', padding: '16px', borderRadius: '14px', fontSize: '13px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Zap size={18} /> SDK Playground
                                </button>
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
                        <div className="action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            <button 
                                onClick={onHeartbeat} 
                                disabled={uiStatus.loading}
                                className="action-btn"
                                style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 4px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: uiStatus.loading ? 0.5 : 1 }}
                            >
                                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Heart size={20} color="#fff" fill="#fff" className={uiStatus.loading ? 'pulse' : ''} />
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Heartbeat</span>
                            </button>
                            <button 
                                onClick={() => setShowWithdrawInput(true)} 
                                disabled={uiStatus.loading}
                                className="action-btn"
                                style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 4px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: uiStatus.loading ? 0.5 : 1 }}
                            >
                                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ArrowUpRight size={20} color="#000" />
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Withdraw</span>
                            </button>
                            <button 
                                onClick={onRefresh} 
                                disabled={uiStatus.loading}
                                className="action-btn"
                                style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', padding: '16px 4px', borderRadius: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: uiStatus.loading ? 0.5 : 1 }}
                            >
                                <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <RefreshCw size={20} color="#fff" className={uiStatus.loading ? 'spinning' : ''} />
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>Refresh</span>
                            </button>
                        </div>

                        {/* Withdraw Amount Input (shown on demand) */}
                        {showWithdrawInput && (
                            <div style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '24px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Withdraw Amount ({symbol})</div>
                                <div className="responsive-input-row" style={{ display: 'flex', gap: '12px' }}>
                                    <input 
                                        type="number" 
                                        value={withdrawAmount} 
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder={`Max: ${vaultBalance.toFixed(4)}`}
                                        style={{ flex: 1, background: '#080e17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', color: '#fff', fontSize: '16px', outline: 'none' }}
                                    />
                                    <button onClick={handleWithdrawSubmit} style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '16px', padding: '16px 24px', fontWeight: 900, cursor: 'pointer', fontSize: '15px', whiteSpace: 'nowrap' }}>
                                        Withdraw
                                    </button>
                                </div>
                                <button onClick={() => { setShowWithdrawInput(false); setWithdrawAmount('') }} style={{ marginTop: '16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: 800 }}>
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* Countdown Timer */}
                        <div style={{ background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Auto-Release Countdown</div>
                            <Countdown lastHeartbeat={vaultState.lastHeartbeat} lockDuration={vaultState.lockDuration} released={vaultState.released} />
                                          {/* Vault Info Cards */}
                        <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
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

                        <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
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
ap: '8px' }}>
                                <Unlock size={20} /> Claim Inheritance
                            </button>
                        )}
                    </div>
                )
        }
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#080e17' }}>
            {/* Top Bar */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <ArrowLeft size={18} />
                    </button>
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

            {/* Content */}
            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                {renderContent()}
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
                }
                .fade-in {
                    animation: fadeIn 0.4s ease-out forwards;
                }
                @media (max-width: 640px) {
                    .info-grid {
                        grid-template-columns: 1fr !important;
                        gap: 10px !important;
                    }
                    .action-grid {
                        grid-template-columns: repeat(3, 1fr) !important;
                        gap: 8px !important;
                    }
                    .action-btn {
                        padding: 12px 8px !important;
                    }
                    .action-btn span { font-size: 10px !important; }
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
                    .action-btn {
                        flex-direction: row !important;
                        justify-content: center !important;
                        gap: 12px !important;
                    }
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
