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
    isRefreshing?: boolean;
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
    isRefreshing,
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center' }}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center' }}>
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
                                        <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Protection</div>
                                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#10b981' }}>Active</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            case 'api':
                const apiKey = walletAddress ? `${walletAddress.toUpperCase()}_TV_MAIN` : 'Connect wallet first';
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}>
                        {/* Professional Header */}
                        <div>
                            <h2 style={{ fontSize: '28px', fontWeight: 950, color: '#fff', letterSpacing: '-1px', marginBottom: '8px' }}>Developer Integration Guide</h2>
                            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6 }}>Follow this step-by-step guide to integrate the TrustVault protocol into your own application. This setup allows you to manage decentralized inheritance securely.</p>
                        </div>

                        {/* Step 1: Credentials */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '32px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}>1</div>
                                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>Initialize API Key</h4>
                            </div>
                            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.6 }}>Your unique API key is tied to your currently connected wallet. Keep this key secure as it authorizes SDK actions on your behalf.</p>
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
                                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>Install the Core Package</h4>
                            </div>
                            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.6 }}>Install the official TrustVault SDK into your project via npm or yarn. This package handles all multi-chain routing automatically.</p>
                            <div style={{ background: '#080e17', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <code style={{ flex: 1, fontSize: '13px', color: '#10b981', fontFamily: "'JetBrains Mono', monospace" }}>npm install @trustvault/sdk-core</code>
                                <button onClick={() => { copyToClipboard('npm install @trustvault/sdk-core'); setCopyToast(true); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer' }}>
                                    <Copy size={16} color="#94a3b8" />
                                </button>
                            </div>
                        </div>

                        {/* Step 3: Setup Client */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '32px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}>3</div>
                                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>Initialize the SDK Client</h4>
                            </div>
                            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.6 }}>Import the package in your application and initialize it using your API key. You can then specify which blockchain environment you want to target.</p>
                            <div style={{ background: '#080e17', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto', position: 'relative' }}>
                                <button 
                                    onClick={() => {
                                        const code = `import { TrustVault } from '@trustvault/sdk-core';\n\n// Initialize the client\nconst tv = new TrustVault({\n  apiKey: "${apiKey}",\n  environment: "mainnet"\n});`;
                                        copyToClipboard(code);
                                        setCopyToast(true);
                                    }}
                                    style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}
                                >
                                    <Copy size={14} color="#94a3b8" />
                                </button>
                                <pre style={{ margin: 0, fontSize: '13px', lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace" }}>
                                    <span style={{ color: '#c084fc' }}>import</span> {'{'} TrustVault {'}'} <span style={{ color: '#c084fc' }}>from</span> <span style={{ color: '#fbbf24' }}>'@trustvault/sdk-core'</span>;<br/><br/>
                                    <span style={{ color: '#64748b' }}>// Initialize the client</span><br/>
                                    <span style={{ color: '#c084fc' }}>const</span> tv = <span style={{ color: '#c084fc' }}>new</span> TrustVault({'{'}<br/>
                                    &nbsp;&nbsp;apiKey: <span style={{ color: '#fbbf24' }}>"{apiKey}"</span>,<br/>
                                    &nbsp;&nbsp;environment: <span style={{ color: '#fbbf24' }}>"mainnet"</span><br/>
                                    {'}'});
                                </pre>
                            </div>
                        </div>

                        {/* Step 4: Vault Creation */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '32px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}>4</div>
                                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>Deploy a New Vault</h4>
                            </div>
                            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.6 }}>Use the <code>createVault</code> method to deploy a smart contract vault. You must define a beneficiary address and a lock duration (in seconds).</p>
                            <div style={{ background: '#080e17', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto', position: 'relative' }}>
                                <button 
                                    onClick={() => {
                                        const code = `async function setupProtection() {\n  try {\n    const vaultId = await tv.createVault({\n      beneficiary: "0x71C...976F",\n      lockDuration: 86400, // 24 hours in seconds\n      depositAmount: 1.5 // Native token amount\n    });\n    console.log("Vault deployed at:", vaultId);\n  } catch (error) {\n    console.error("Deployment failed:", error);\n  }\n}`;
                                        copyToClipboard(code);
                                        setCopyToast(true);
                                    }}
                                    style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}
                                >
                                    <Copy size={14} color="#94a3b8" />
                                </button>
                                <pre style={{ margin: 0, fontSize: '13px', lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace" }}>
                                    <span style={{ color: '#c084fc' }}>async function</span> <span style={{ color: '#3b82f6' }}>setupProtection</span>() {'{'}<br/>
                                    &nbsp;&nbsp;<span style={{ color: '#c084fc' }}>try</span> {'{'}<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#c084fc' }}>const</span> vaultId = <span style={{ color: '#c084fc' }}>await</span> tv.createVault({'{'}<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;beneficiary: <span style={{ color: '#fbbf24' }}>"0x71C...976F"</span>,<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;lockDuration: <span style={{ color: '#3b82f6' }}>86400</span>, <span style={{ color: '#64748b' }}>// 24 hours in seconds</span><br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;depositAmount: <span style={{ color: '#3b82f6' }}>1.5</span> <span style={{ color: '#64748b' }}>// Native token amount</span><br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;{'}'});<br/><br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#3b82f6' }}>console</span>.log(<span style={{ color: '#fbbf24' }}>"Vault deployed at:"</span>, vaultId);<br/>
                                    &nbsp;&nbsp;{'}'} <span style={{ color: '#c084fc' }}>catch</span> (error) {'{'}<br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#3b82f6' }}>console</span>.error(<span style={{ color: '#fbbf24' }}>"Deployment failed:"</span>, error);<br/>
                                    &nbsp;&nbsp;{'}'}<br/>
                                    {'}'}
                                </pre>
                            </div>
                        </div>

                        {/* Step 5: Sending Heartbeats */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '32px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}>5</div>
                                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>Maintain Vault Health (Heartbeat)</h4>
                            </div>
                            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.6 }}>To prevent the vault from triggering an inheritance transfer, the owner must periodically call the <code>heartbeat</code> method to reset the countdown timer.</p>
                            <div style={{ background: '#080e17', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto', position: 'relative' }}>
                                <button 
                                    onClick={() => {
                                        const code = `async function pingVault(vaultId) {\n  // Resets the timer back to 100%\n  const txHash = await tv.heartbeat(vaultId);\n  console.log("Heartbeat sent, TX:", txHash);\n}`;
                                        copyToClipboard(code);
                                        setCopyToast(true);
                                    }}
                                    style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer' }}
                                >
                                    <Copy size={14} color="#94a3b8" />
                                </button>
                                <pre style={{ margin: 0, fontSize: '13px', lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace" }}>
                                    <span style={{ color: '#c084fc' }}>async function</span> <span style={{ color: '#3b82f6' }}>pingVault</span>(vaultId) {'{'}<br/>
                                    &nbsp;&nbsp;<span style={{ color: '#64748b' }}>// Resets the timer back to 100%</span><br/>
                                    &nbsp;&nbsp;<span style={{ color: '#c084fc' }}>const</span> txHash = <span style={{ color: '#c084fc' }}>await</span> tv.heartbeat(vaultId);<br/>
                                    &nbsp;&nbsp;<span style={{ color: '#3b82f6' }}>console</span>.log(<span style={{ color: '#fbbf24' }}>"Heartbeat sent, TX:"</span>, txHash);<br/>
                                    {'}'}
                                </pre>
                            </div>
                        </div>
                    </div>
                )
            default:
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, justifyContent: 'center' }}>
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

                        {/* Action Buttons - Dynamic based on role */}
                        <div className="action-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {isOwner ? (
                                <button onClick={onHeartbeat} disabled={uiStatus.loading} className="btn-scale" style={{ background: 'rgba(17, 30, 47, 0.6)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px 12px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', opacity: uiStatus.loading ? 0.5 : 1 }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)' }}>
                                        <Heart size={22} color="#fff" fill="#fff" className={uiStatus.loading ? 'pulse' : ''} />
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Heartbeat</span>
                                </button>
                            ) : (
                                <button onClick={onClaim} disabled={uiStatus.loading || !isExpired || vaultData.released} className="btn-scale" style={{ background: 'rgba(17, 30, 47, 0.6)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px 12px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', opacity: (uiStatus.loading || !isExpired || vaultData.released) ? 0.5 : 1 }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)' }}>
                                        <Unlock size={22} color="#fff" />
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>{vaultData.released ? 'Claimed' : 'Claim Vault'}</span>
                                </button>
                            )}

                            <button onClick={() => setShowWithdrawInput(true)} disabled={uiStatus.loading || (isBeneficiary && !vaultData.released)} className="btn-scale" style={{ background: 'rgba(17, 30, 47, 0.6)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px 12px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', opacity: (uiStatus.loading || (isBeneficiary && !vaultData.released)) ? 0.5 : 1 }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(255, 255, 255, 0.1)' }}>
                                    <ArrowUpRight size={22} color="#000" />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>Withdraw</span>
                            </button>

                            <button onClick={onRefresh} disabled={uiStatus.loading || isRefreshing} className="btn-scale" style={{ background: 'rgba(17, 30, 47, 0.6)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px 12px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', opacity: (uiStatus.loading || isRefreshing) ? 0.5 : 1 }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <RefreshCw size={22} color="#fff" className={isRefreshing ? 'spinning' : ''} />
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
        <div className="vault-dashboard-root" style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', background: '#080e17', overflow: 'hidden' }}>
            {/* Top Bar - Hidden on Mobile to avoid double headers */}
            <div className="desktop-only-header" style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <ArrowLeft size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={16} />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '0.5px' }}>{vaultName || 'TRUSTVAULT 3'}</span>
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
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                {/* Mobile Back Button - Visible on mobile for better navigation */}
                <button onClick={onBack} className="mobile-back-btn" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: '#fff', 
                    padding: '12px 20px', 
                    borderRadius: '16px', 
                    marginBottom: '20px', 
                    fontWeight: 800, 
                    fontSize: '13px',
                    width: 'fit-content'
                }}>
                    <ArrowLeft size={18} /> Exit Protocol
                </button>

                {renderContent() || (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No content available for this tab.
                    </div>
                )}

                {/* Withdraw Modal Overlay */}
                {showWithdrawInput && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div style={{ background: '#0f172a', width: '100%', maxWidth: '400px', padding: '32px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ArrowUpRight size={20} color="#fff" />
                                </div>
                                <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Withdraw Funds</h3>
                            </div>
                            
                            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px', lineHeight: 1.5 }}>
                                Enter the amount you wish to withdraw from your vault back to your primary wallet.
                                <br/><span style={{ fontSize: '12px', color: '#64748b' }}>Available: {vaultBalance.toFixed(4)} {symbol}</span>
                            </p>
                            
                            <div style={{ background: '#080e17', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount ({symbol})</label>
                                <input 
                                    type="number" 
                                    value={withdrawAmount} 
                                    onChange={(e) => setWithdrawAmount(e.target.value)} 
                                    placeholder="0.00"
                                    autoFocus
                                    style={{ width: '100%', background: 'none', border: 'none', color: '#fff', fontSize: '28px', fontWeight: 800, outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <button 
                                    onClick={() => setShowWithdrawInput(false)}
                                    style={{ padding: '18px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '18px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s ease' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleWithdrawSubmit}
                                    style={{ padding: '18px', background: '#fff', color: '#000', border: 'none', borderRadius: '18px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s ease' }}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
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

            {/* Bottom Nav (Mobile) - High Performance Glassmorphism */}
            <div className="mobile-nav">
                <button onClick={() => setCurrentTab('dashboard')} className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}>
                    <div className="nav-icon-wrapper"><Home size={22} /></div>
                    <span>Vault</span>
                </button>
                <button onClick={() => setCurrentTab('security')} className={`nav-item ${currentTab === 'security' ? 'active' : ''}`}>
                    <div className="nav-icon-wrapper"><Shield size={22} /></div>
                    <span>Safe</span>
                </button>
                <button onClick={() => setCurrentTab('history')} className={`nav-item ${currentTab === 'history' ? 'active' : ''}`}>
                    <div className="nav-icon-wrapper"><History size={22} /></div>
                    <span>Activity</span>
                </button>
                <button onClick={() => setCurrentTab('info')} className={`nav-item ${currentTab === 'info' ? 'active' : ''}`}>
                    <div className="nav-icon-wrapper"><Info size={22} /></div>
                    <span>Info</span>
                </button>
                <button onClick={() => setCurrentTab('api')} className={`nav-item ${currentTab === 'api' ? 'active' : ''}`}>
                    <div className="nav-icon-wrapper"><Code size={22} /></div>
                    <span>API</span>
                </button>
            </div>
        </div>
    )
}
