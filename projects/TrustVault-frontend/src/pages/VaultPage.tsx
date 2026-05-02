import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { 
    Asterisk, 
    LogOut, 
    Shield, 
    Plus, 
    ChevronLeft, 
    Clock, 
    Wallet, 
    CheckCircle,
    Timer,
    AlertCircle,
    ArrowLeft,
    ChevronRight,
    Search,
    Home,
    Settings,
    History,
    Menu,
    X
} from 'lucide-react'
import { useChain } from '../contexts/ChainContext'
import { useVaultActions } from '../hooks/useVaultActions'
import { VaultState } from '../adapters/types'
import ConnectScreen from '../components/ConnectScreen'
import VaultDashboard from '../components/VaultDashboard'
import ChainSwitcher from '../components/ChainSwitcher'
import VaultDropdown from '../components/VaultDropdown'
import TransactionOverlay from '../components/TransactionOverlay'
import LandingPage from '../components/LandingPage'

export const VaultPage: React.FC = () => {
    const { 
        currentChain, 
        adapter, 
        walletAddress, 
        isConnected, 
        disconnectWallet 
    } = useChain()

    const {
        uiStatus,
        handleConnect,
        handleDisconnect,
        handleCreateVault,
        handleHeartbeat,
        handleClaim,
        handleWithdraw
    } = useVaultActions()

    // Navigation State
    const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing')
    const [currentTab, setCurrentTab] = useState<'dashboard' | 'security' | 'history' | 'settings'>('dashboard')

    // Data State
    const [userVaults, setUserVaults] = useState<string[]>([])
    const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null)
    const [vaultState, setVaultState] = useState<VaultState | null>(null)
    const [vaultBalance, setVaultBalance] = useState(0)
    const [isDiscovering, setIsDiscovering] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [showVaultSelector, setShowVaultSelector] = useState(false)
    const [copied, setCopied] = useState(false)
    const [vaultRoles, setVaultRoles] = useState<Record<string, string>>({})

    // Form inputs
    const [beneficiaryInput, setBeneficiaryInput] = useState('')
    const [lockDurationInput, setLockDurationInput] = useState('60')
    const [depositInput, setDepositInput] = useState('0.1')

    // Discover vaults
    const discoverVaults = useCallback(async () => {
        if (!walletAddress) return
        setIsDiscovering(true)
        try {
            const vaults = await adapter.discoverVaults(walletAddress)
            setUserVaults(vaults)
            
            if (vaults.length > 0 && !selectedVaultId) {
                setSelectedVaultId(vaults[vaults.length - 1])
            } else if (vaults.length === 0) {
                setSelectedVaultId(null)
                setVaultState(null)
            }
        } catch (e) {
            console.error('Failed to discover vaults:', e)
        } finally {
            setIsDiscovering(false)
        }
    }, [adapter, walletAddress, selectedVaultId])

    useEffect(() => {
        if (isConnected) discoverVaults()
    }, [isConnected, currentChain.id, walletAddress, discoverVaults])

    // Load vault data
    const loadVaultState = useCallback(async () => {
        if (!selectedVaultId) return
        try {
            const state = await adapter.fetchVaultState(selectedVaultId)
            const balance = await adapter.getVaultBalance(selectedVaultId)
            setVaultState(state)
            setVaultBalance(balance)
            
            if (state && walletAddress) {
                const isOwner = currentChain.type === 'solana' ? 
                    state.owner === walletAddress : 
                    state.owner.toLowerCase() === walletAddress.toLowerCase()
                
                const isBen = currentChain.type === 'solana' ? 
                    state.beneficiary === walletAddress : 
                    state.beneficiary.toLowerCase() === walletAddress.toLowerCase()

                setVaultRoles(prev => ({
                    ...prev,
                    [selectedVaultId]: isOwner ? 'owner' : (isBen ? 'beneficiary' : '')
                }))
            }
        } catch (e) {}
    }, [adapter, selectedVaultId, walletAddress, currentChain.type])

    useEffect(() => {
        if (selectedVaultId) loadVaultState()
    }, [selectedVaultId, loadVaultState])

    // Role checks
    const isOwner = useMemo(() => {
        if (!vaultState || !walletAddress) return false
        const own = String(vaultState.owner)
        const wallet = String(walletAddress)
        return currentChain.type === 'solana' ? own === wallet : own.toLowerCase() === wallet.toLowerCase()
    }, [walletAddress, vaultState, currentChain])

    const isBeneficiary = useMemo(() => {
        if (!vaultState || !walletAddress) return false
        const ben = String(vaultState.beneficiary)
        const wallet = String(walletAddress)
        return currentChain.type === 'solana' ? ben === wallet : ben.toLowerCase() === wallet.toLowerCase()
    }, [walletAddress, vaultState, currentChain])

    const now = Math.floor(Date.now() / 1000)
    const isExpired = !!(vaultState && !vaultState.released && (now >= (vaultState.lastHeartbeat || 0) + (vaultState.lockDuration || 0)))

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
            discoverVaults()
        })
    }

    const handleHeartbeatAction = async () => {
        if (selectedVaultId) {
            await handleHeartbeat(selectedVaultId, loadVaultState)
        }
    }

    const handleWithdrawAction = async () => {
        const amountStr = window.prompt(`Enter amount to withdraw (${currentChain.nativeCurrency.symbol}):`)
        if (amountStr) {
            const amount = parseFloat(amountStr)
            if (!isNaN(amount) && amount > 0) {
                await handleWithdraw(selectedVaultId!, amount, loadVaultState)
            }
        }
    }

    // Navigation logic: If user clicks "Launch App" or is already connected
    if (viewMode === 'landing' && !isConnected) {
        return <LandingPage onLaunch={() => setViewMode('app')} />
    }

    if (!isConnected) {
        return (
            <div className="wallet-shell">
                <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 100 }}>
                    <button onClick={() => setViewMode('landing')} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                        <ArrowLeft size={18} />
                        Back to Home
                    </button>
                </div>
                <div className="wallet-container">
                    <ConnectScreen onConnect={handleConnect} connecting={uiStatus.loading} />
                </div>
            </div>
        )
    }

    return (
        <div className="wallet-shell">
            <TransactionOverlay loading={uiStatus.loading} txId={uiStatus.txId} onCancel={() => {}} />

            {/* Layout Wrapper: desktop-mode adds sidebar on large screens */}
            <div className="wallet-container desktop-mode">
                
                {/* Desktop Sidebar */}
                <div className="desktop-sidebar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#3B82F6', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Asterisk size={24} color="#fff" />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '20px' }}>TRUSTVAULT</span>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        <button onClick={() => setCurrentTab('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', background: currentTab === 'dashboard' ? '#F2F2F7' : 'transparent', border: 'none', color: currentTab === 'dashboard' ? '#3B82F6' : '#8E8E93', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                            <Home size={20} />
                            Dashboard
                        </button>
                        <button onClick={() => setCurrentTab('security')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', background: currentTab === 'security' ? '#F2F2F7' : 'transparent', border: 'none', color: currentTab === 'security' ? '#3B82F6' : '#8E8E93', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                            <Shield size={20} />
                            Security
                        </button>
                        <button onClick={() => setCurrentTab('history')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', background: currentTab === 'history' ? '#F2F2F7' : 'transparent', border: 'none', color: currentTab === 'history' ? '#3B82F6' : '#8E8E93', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                            <History size={20} />
                            Activity
                        </button>
                        <button onClick={() => setCurrentTab('settings')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', background: currentTab === 'settings' ? '#F2F2F7' : 'transparent', border: 'none', color: currentTab === 'settings' ? '#3B82F6' : '#8E8E93', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                            <Settings size={20} />
                            Settings
                        </button>
                    </nav>

                    <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #E5E5EA' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Wallet size={20} color="#3B82F6" />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: 700 }}>{formatAddr(walletAddress!)}</div>
                                <div style={{ fontSize: '11px', color: '#8E8E93' }}>Connected Wallet</div>
                            </div>
                        </div>
                        <button onClick={handleDisconnect} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', background: '#FFF0F0', border: 'none', color: '#FF3B30', fontWeight: 700, cursor: 'pointer' }}>
                            <LogOut size={20} />
                            Disconnect
                        </button>
                    </div>
                </div>

                {/* Main Content (Dashboard/Mobile View) */}
                <div className="desktop-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
                    {isDiscovering ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                            <div className="spinner" style={{ width: '44px', height: '44px' }}></div>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#8E8E93' }}>SYNCING ASSETS...</span>
                        </div>
                    ) : selectedVaultId && vaultState ? (
                        <VaultDashboard
                            vaultState={vaultState}
                            vaultBalance={vaultBalance}
                            currentChain={currentChain}
                            vaultAddress={selectedVaultId}
                            walletAddress={walletAddress}
                            isOwner={isOwner}
                            isBeneficiary={isBeneficiary}
                            isExpired={isExpired}
                            formatAddr={formatAddr}
                            copyToClipboard={copyToClipboard}
                            onHeartbeat={handleHeartbeatAction}
                            onWithdraw={handleWithdrawAction}
                            onClaim={() => handleClaim(selectedVaultId!, loadVaultState)}
                            currentTab={currentTab}
                            setCurrentTab={setCurrentTab}
                        />
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', textAlign: 'center' }}>
                            <div style={{ width: '96px', height: '96px', margin: '0 auto 32px', background: '#fff', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                <Shield size={48} color="#3B82F6" />
                            </div>
                            <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px', color: '#1C1C1E' }}>No Vault Found</h2>
                            <p style={{ color: '#8E8E93', fontSize: '18px', marginBottom: '48px', maxWidth: '400px' }}>Start your protection journey by creating a secure vault on {currentChain.name}.</p>
                            <button className="nb-btn-primary" style={{ padding: '20px 60px' }} onClick={() => setShowCreateForm(true)}>
                                <Plus size={22} />
                                Create New Vault
                            </button>
                        </div>
                    )}

                    {/* Mobile Create Form Overlay */}
                    {showCreateForm && (
                        <div style={{ position: 'absolute', inset: 0, zIndex: 1000, background: '#F2F2F7', display: 'flex', flexDirection: 'column', padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                                <button onClick={() => setShowCreateForm(false)} style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer' }}><ArrowLeft size={24} /></button>
                                <span style={{ fontWeight: 800, fontSize: '15px' }}>NEW PROTOCOL</span>
                                <div style={{ width: 24 }} />
                            </div>

                            <div style={{ maxWidth: '500px', margin: '0 auto', width: '100%', background: '#fff', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#8E8E93', marginBottom: '12px', textTransform: 'uppercase' }}>Beneficiary Address</label>
                                    <input value={beneficiaryInput} onChange={(e) => setBeneficiaryInput(e.target.value)} placeholder="0x... or Solana Address" style={{ width: '100%', background: '#F2F2F7', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '20px', color: '#000', fontSize: '16px', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#8E8E93', marginBottom: '12px', textTransform: 'uppercase' }}>Timer (Sec)</label>
                                        <input type="number" value={lockDurationInput} onChange={(e) => setLockDurationInput(e.target.value)} style={{ width: '100%', background: '#F2F2F7', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '20px', color: '#000', fontSize: '16px', outline: 'none' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#8E8E93', marginBottom: '12px', textTransform: 'uppercase' }}>Deposit ({currentChain.nativeCurrency.symbol})</label>
                                        <input type="number" value={depositInput} onChange={(e) => setDepositInput(e.target.value)} style={{ width: '100%', background: '#F2F2F7', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '20px', color: '#000', fontSize: '16px', outline: 'none' }} />
                                    </div>
                                </div>
                                <button className="nb-btn-primary" style={{ width: '100%', padding: '20px' }} onClick={handleCreateVaultSubmit}>Initiate Protection</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Selector (Mobile Only in Bottom Nav, Desktop has Sidebar) */}
                {!showCreateForm && (
                    <div className="mobile-only-selector">
                        <VaultDropdown
                            currentChain={currentChain}
                            userVaults={userVaults}
                            vaultRoles={vaultRoles}
                            selectedVaultId={selectedVaultId}
                            setSelectedVaultId={setSelectedVaultId}
                            adapter={adapter}
                            handleDeleteVaultId={() => {}}
                            isDiscovering={isDiscovering}
                            handleManualScan={discoverVaults}
                            uiStatus={uiStatus}
                            setShowCreateForm={setShowCreateForm}
                            showVaultSelector={showVaultSelector}
                            setShowVaultSelector={setShowVaultSelector}
                            vaultAddress={selectedVaultId || ''}
                            walletAddress={walletAddress}
                            copied={copied}
                            copyToClipboard={copyToClipboard}
                            formatAddr={formatAddr}
                        />
                    </div>
                )}
            </div>

            <style>{`
                @media (min-width: 1024px) {
                    .mobile-only-selector { display: none; }
                    .desktop-content { padding-bottom: 0 !important; }
                }
            `}</style>
        </div>
    )
}

export default VaultPage
