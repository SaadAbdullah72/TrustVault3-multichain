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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="fade-in">
                        <div style={{ background: 'linear-gradient(135deg, #111e2f 0%, #0d1724 100%)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Code size={20} color="#10b981" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800 }}>TrustVault SDK</h3>
                                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>Inheritance-as-a-Service for your Apps</p>
                                </div>
                            </div>
                            
                            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#cbd5e1', marginBottom: '20px' }}>
                                Integrate decentralized inheritance into any wallet, game, or DeFi protocol using our unified cross-chain SDK.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#10b981', marginBottom: '4px' }}>VERSION</div>
                                    <div style={{ fontSize: '14px', fontWeight: 700 }}>v1.0.2-alpha</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#3b82f6', marginBottom: '4px' }}>NETWORKS</div>
                                    <div style={{ fontSize: '14px', fontWeight: 700 }}>3 Supported</div>
                                </div>
                            </div>

                            <div style={{ background: '#080e17', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Quick Start</span>
                                    <button style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>COPY CODE</button>
                                </div>
                                <code style={{ fontSize: '12px', color: '#e2e8f0', fontFamily: '"JetBrains Mono", monospace', whiteSpace: 'pre-wrap', display: 'block', lineHeight: 1.5 }}>
{`// Initialize SDK
const sdk = TrustVaultSDK.for${currentChain.type.toUpperCase()}(rpcUrl);

// Create inheritance vault
const vaultId = await sdk.createVault({
  beneficiary: "0x123...",
  lockDuration: 86400 * 30, // 30 days
  depositAmount: 1.5
});`}
                                </code>
                            </div>

                            <button style={{ width: '100%', marginTop: '20px', padding: '14px', borderRadius: '12px', background: '#fff', color: '#000', border: 'none', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}>
                                View Full Documentation
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
                .fade-in {
                    animation: fadeIn 0.4s ease-out forwards;
                }
                @media (max-width: 480px) {
                    .action-grid { gap: 8px !important; }
                    .action-btn { padding: 12px 4px !important; }
                    .action-btn span { fontSize: 10px !important; }
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
