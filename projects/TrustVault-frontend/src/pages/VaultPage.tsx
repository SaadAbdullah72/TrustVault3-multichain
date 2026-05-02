import { useEffect, useState, useCallback, useMemo } from 'react'
import { useChain } from '../contexts/ChainContext'
import Countdown from '../components/Countdown'
import ConnectScreen from '../components/ConnectScreen'
import TransactionOverlay from '../components/TransactionOverlay'
import StatusToast from '../components/StatusToast'
import ChainSwitcher from '../components/ChainSwitcher'
import { useVaultActions } from '../hooks/useVaultActions'
import { useVaultDiscovery } from '../hooks/useVaultDiscovery'
import { useVaultState } from '../hooks/useVaultState'
import { useTranslation } from 'react-i18next'
import SettingsSwitcher from '../components/SettingsSwitcher'
import VaultDropdown from '../components/VaultDropdown'
import VaultDashboard from '../components/VaultDashboard'
import VaultActions from '../components/VaultActions'
import {
    Shield,
    Lock,
    Unlock,
    Activity,
    Search,
    Plus,
    X,
    Wallet,
    Clock,
    CheckCircle,
    LogOut,
    ChevronDown,
    ArrowRight,
    Zap,
    Copy,
    RefreshCw,
    Heart,
    ChevronLeft,
    ArrowUpFromLine,
    CircleDot,
    Bell,
    Timer,
    Eye,
    EyeOff,
    FileText,
    Asterisk,
    MoreHorizontal
} from 'lucide-react'

export default function VaultPage() {
    const { t } = useTranslation()
    const { walletAddress, currentChain, adapter, isConnected, connecting } = useChain()

    const {
        uiStatus,
        updateStatus,
        resetStatus,
        handleConnect,
        handleDisconnect,
        handleCreateVault,
        handleHeartbeat,
        handleClaim,
        handleWithdraw
    } = useVaultActions()

    const {
        userVaults,
        setUserVaults,
        selectedVaultId,
        setSelectedVaultId,
        claimableVaults,
        vaultRoles,
        isDiscovering,
        isScanningClaims,
        handleManualScan
    } = useVaultDiscovery()

    const {
        vaultState,
        vaultBalance,
        loadVaultState
    } = useVaultState(selectedVaultId)

    const [showCreateForm, setShowCreateForm] = useState(false)
    const [beneficiaryInput, setBeneficiaryInput] = useState('')
    const [lockDurationInput, setLockDurationInput] = useState('60')
    const [depositInput, setDepositInput] = useState('1')

    const [showVaultSelector, setShowVaultSelector] = useState(false)
    const [copied, setCopied] = useState(false)

    const vaultAddress = useMemo(() => selectedVaultId ? adapter.getVaultAddress(selectedVaultId) : '', [selectedVaultId, adapter])
    
    const isOwner = useMemo(() => {
        if (!walletAddress || !vaultState?.owner) return false;
        const owner = String(vaultState.owner)
        const wallet = String(walletAddress)
        return currentChain.type === 'solana' ? owner === wallet : owner.toUpperCase() === wallet.toUpperCase()
    }, [walletAddress, vaultState, currentChain])

    const isBeneficiary = useMemo(() => {
        if (!walletAddress || !vaultState?.beneficiary) return false;
        const ben = String(vaultState.beneficiary)
        const wallet = String(walletAddress)
        return currentChain.type === 'solana' ? ben === wallet : ben.toUpperCase() === wallet.toUpperCase()
    }, [walletAddress, vaultState, currentChain])

    const now = Math.floor(Date.now() / 1000)
    const isExpired = !!(vaultState && !vaultState.released && (now >= (vaultState.lastHeartbeat || 0) + (vaultState.lockDuration || 0)))
    const canRelease = isExpired

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const formatAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

    const handleCreateVaultSubmit = async () => {
        await handleCreateVault(beneficiaryInput, lockDurationInput, depositInput, (vaultId) => {
            setSelectedVaultId(vaultId)
            setShowCreateForm(false)
        })
    }

    const handleWithdrawAction = async () => {
        const amountStr = window.prompt(`Enter amount to withdraw (${currentChain.nativeCurrency.symbol}):`)
        if (amountStr) {
            await handleWithdraw(selectedVaultId!, parseFloat(amountStr), loadVaultState)
        }
    }

    if (!isConnected) {
        return (
            <div className="wallet-shell">
                <div className="wallet-container glass-effect">
                    <ConnectScreen onConnect={handleConnect} connecting={uiStatus.loading} />
                </div>
            </div>
        )
    }

    return (
        <div className="wallet-shell">
            <div className="wallet-container glass-effect" style={{ display: 'flex', flexDirection: 'column' }}>
                
                {/* Header Section */}
                {!showCreateForm && (
                    <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--nb-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Asterisk size={18} />
                            </div>
                            <span style={{ fontWeight: 800, letterSpacing: '-0.5px', fontSize: '15px' }}>TRUSTVAULT</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <ChainSwitcher />
                            <button onClick={handleDisconnect} style={{ background: 'none', border: 'none', color: 'var(--nb-text-dim)', cursor: 'pointer' }}>
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                    {isDiscovering ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                            <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--nb-glass)', borderTopColor: 'var(--nb-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--nb-text-dim)' }}>Accessing the Decentralized Layer...</span>
                        </div>
                    ) : selectedVaultId && vaultState ? (
                        <div style={{ height: '100%' }}>
                            {isBeneficiary && !isExpired && !isOwner ? (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
                                    <div style={{ marginBottom: '32px' }}>
                                        <div style={{ width: '80px', height: '80px', margin: '0 auto', background: 'var(--nb-glass)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--nb-glass-border)' }}>
                                            <Shield size={40} color="var(--nb-accent)" />
                                        </div>
                                    </div>
                                    <h2 className="nb-title" style={{ fontSize: '28px', marginBottom: '16px' }}>PROTECTED BY<br />TRUSTVAULT</h2>
                                    <p className="nb-desc" style={{ marginBottom: '32px' }}>
                                        You are a verified beneficiary. This vault is currently under protection and will be released automatically upon the security timer's expiration.
                                    </p>
                                    <div className="glass-card" style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                            <div className="pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                                            <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Monitoring System Active</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <VaultDashboard
                                        vaultState={vaultState}
                                        vaultBalance={vaultBalance}
                                        currentChain={currentChain}
                                        vaultAddress={vaultAddress}
                                        walletAddress={walletAddress}
                                        isOwner={isOwner}
                                        isBeneficiary={isBeneficiary}
                                        isExpired={isExpired}
                                        formatAddr={formatAddr}
                                        copyToClipboard={copyToClipboard}
                                    />
                                    
                                    {isOwner && (
                                        <div style={{ padding: '0 24px 24px' }}>
                                            <button className="nb-btn-primary" style={{ width: '100%', marginBottom: '12px' }} onClick={handleHeartbeat}>
                                                <Heart size={20} />
                                                Send Heartbeat
                                            </button>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button className="nb-btn-secondary" style={{ flex: 1, background: 'var(--nb-glass)', padding: '12px', borderRadius: '12px' }} onClick={handleWithdrawAction}>Withdraw</button>
                                                <button className="nb-btn-secondary" style={{ flex: 1, background: 'var(--nb-glass)', padding: '12px', borderRadius: '12px' }} onClick={() => setShowVaultSelector(true)}>Switch Vault</button>
                                            </div>
                                        </div>
                                    )}

                                    {isBeneficiary && isExpired && !vaultState.released && (
                                        <div style={{ padding: '0 24px 24px' }}>
                                            <button className="nb-btn-primary" style={{ width: '100%', background: 'var(--nb-accent)', color: '#000' }} onClick={() => handleClaim(selectedVaultId!, loadVaultState)}>
                                                <Unlock size={20} />
                                                Claim Inheritance
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', margin: '0 auto 24px', background: 'var(--nb-glass)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Shield size={32} color="var(--nb-text-dim)" />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>No Vault Found</h2>
                            <p className="nb-desc" style={{ marginBottom: '32px' }}>Start your journey by creating a secure vault on {currentChain.name}.</p>
                            <button className="nb-btn-primary" onClick={() => setShowCreateForm(true)}>
                                <Plus size={20} />
                                Create First Vault
                            </button>
                        </div>
                    )}
                </div>

                {/* Form Overlay */}
                {showCreateForm && (
                    <div className="glass-effect" style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <button onClick={() => setShowCreateForm(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><ChevronLeft size={24} /></button>
                            <span style={{ fontWeight: 800 }}>NEW VAULT</span>
                            <div style={{ width: 24 }} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--nb-text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Beneficiary Address</label>
                                <input 
                                    value={beneficiaryInput}
                                    onChange={(e) => setBeneficiaryInput(e.target.value)}
                                    placeholder="0x... or Solana Address"
                                    style={{ width: '100%', background: 'var(--nb-glass)', border: '1px solid var(--nb-glass-border)', borderRadius: '16px', padding: '16px', color: '#fff', fontSize: '15px', outline: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--nb-text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Timer (Sec)</label>
                                    <input 
                                        type="number"
                                        value={lockDurationInput}
                                        onChange={(e) => setLockDurationInput(e.target.value)}
                                        style={{ width: '100%', background: 'var(--nb-glass)', border: '1px solid var(--nb-glass-border)', borderRadius: '16px', padding: '16px', color: '#fff', fontSize: '15px', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--nb-text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Deposit ({currentChain.nativeCurrency.symbol})</label>
                                    <input 
                                        type="number"
                                        value={depositInput}
                                        onChange={(e) => setDepositInput(e.target.value)}
                                        style={{ width: '100%', background: 'var(--nb-glass)', border: '1px solid var(--nb-glass-border)', borderRadius: '16px', padding: '16px', color: '#fff', fontSize: '15px', outline: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <button className="nb-btn-primary" style={{ width: '100%' }} onClick={handleCreateVaultSubmit} disabled={uiStatus.loading}>
                            {uiStatus.loading ? 'DEPLOYING...' : 'INITIATE VAULT'}
                        </button>
                    </div>
                )}

                <TransactionOverlay
                    loading={uiStatus.loading}
                    txId={uiStatus.txId}
                    onCancel={resetStatus}
                />

                <StatusToast
                    error={uiStatus.error}
                    txId={uiStatus.txId}
                    onClose={resetStatus}
                />
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .pulse { animation: pulse-animation 2s infinite; }
                @keyframes pulse-animation { 
                    0% { transform: scale(0.95); opacity: 0.5; }
                    50% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.5; }
                }
            `}</style>
        </div>
    )
}
