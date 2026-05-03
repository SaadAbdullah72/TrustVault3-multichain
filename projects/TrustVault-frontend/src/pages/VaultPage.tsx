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
    X,
    ArrowRight
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
        disconnectWallet,
        connectWallet
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

    // Explicit Navigation Step: 'landing' | 'connect' | 'actionSelect' | 'dashboard'
    const [step, setStep] = useState<'landing' | 'connect' | 'actionSelect' | 'dashboard'>('landing')
    const [currentTab, setCurrentTab] = useState<'dashboard' | 'security' | 'history' | 'settings'>('dashboard')

    // Vault Data
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
        if (!walletAddress || walletAddress === 'undefined') return
        setIsDiscovering(true)
        try {
            const vaults = await adapter.discoverVaults(walletAddress)
            setUserVaults(vaults)
            
            if (vaults.length > 0 && !selectedVaultId) {
                setSelectedVaultId(vaults[vaults.length - 1])
            }
        } catch (e) {
            console.error('Discovery failed:', e)
        } finally {
            setIsDiscovering(false)
        }
    }, [adapter, walletAddress, selectedVaultId])

    useEffect(() => {
        if (isConnected && walletAddress && walletAddress !== 'undefined') {
            discoverVaults()
        }
    }, [isConnected, currentChain.id, walletAddress, discoverVaults])

    // Load vault data
    const loadVaultState = useCallback(async () => {
        if (!selectedVaultId || !walletAddress || walletAddress === 'undefined') return
        try {
            const state = await adapter.fetchVaultState(selectedVaultId)
            const balance = await adapter.getVaultBalance(selectedVaultId)
            setVaultState(state)
            setVaultBalance(balance)
            
            if (state) {
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

    // Derive roles
    const isOwner = useMemo(() => {
        if (!vaultState || !walletAddress || walletAddress === 'undefined') return false
        return currentChain.type === 'solana' ? vaultState.owner === walletAddress : vaultState.owner.toLowerCase() === walletAddress.toLowerCase()
    }, [walletAddress, vaultState, currentChain])

    const isBeneficiary = useMemo(() => {
        if (!vaultState || !walletAddress || walletAddress === 'undefined') return false
        return currentChain.type === 'solana' ? vaultState.beneficiary === walletAddress : vaultState.beneficiary.toLowerCase() === walletAddress.toLowerCase()
    }, [walletAddress, vaultState, currentChain])

    const now = Math.floor(Date.now() / 1000)
    const isExpired = !!(vaultState && !vaultState.released && (now >= (vaultState.lastHeartbeat || 0) + (vaultState.lockDuration || 0)))

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const formatAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

    // Navigation Actions
    const handleLaunchApp = () => setStep('connect')
    
    const handleGoBackToLanding = () => {
        setStep('landing')
        disconnectWallet()
    }

    const handleProceedToActionSelect = () => {
        if (isConnected && walletAddress && walletAddress !== 'undefined') {
            setStep('actionSelect')
        } else {
            alert('Please connect your wallet correctly first.')
        }
    }

    // RENDER LOGIC
    if (step === 'landing') {
        return <LandingPage onLaunch={handleLaunchApp} currentChain={currentChain} />
    }

    if (step === 'connect') {
        return (
            <div className="wallet-shell">
                {/* Fixed Back Button */}
                <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 100 }}>
                    <button onClick={handleGoBackToLanding} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px 20px', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, backdropFilter: 'blur(10px)' }}>
                        <ArrowLeft size={18} />
                        Back
                    </button>
                </div>

                <div className="wallet-container" style={{ background: '#0B131E', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <ConnectScreen onConnect={handleConnect} connecting={uiStatus.loading} />
                        
                        {/* Manual Proceed Button - ONLY show if connected and address is valid */}
                        {isConnected && walletAddress && walletAddress !== 'undefined' && (
                            <div style={{ position: 'absolute', bottom: '40px', left: '32px', right: '32px', zIndex: 50 }}>
                                <button onClick={handleProceedToActionSelect} style={{ width: '100%', background: '#fff', color: '#000', padding: '20px', borderRadius: '24px', border: 'none', fontSize: '16px', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <span>Continue</span>
                                    <ArrowRight size={20} />
                                </button>
                                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#8E8E93' }}>
                                    Connected: {formatAddr(walletAddress)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    if (step === 'actionSelect') {
        return (
            <div className="wallet-shell">
                <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 100 }}>
                    <button onClick={() => setStep('connect')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px 20px', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, backdropFilter: 'blur(10px)' }}>
                        <ArrowLeft size={18} />
                        Back
                    </button>
                </div>

                <div className="wallet-container" style={{ background: '#0B131E', border: '1px solid rgba(255,255,255,0.1)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', color: '#fff' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', letterSpacing: '-0.5px' }}>
                            You're set to go!
                        </h1>
                        <p style={{ fontSize: '14px', color: '#8E8E93', textAlign: 'center', maxWidth: '280px', marginBottom: '40px', lineHeight: 1.5 }}>
                            You've successfully connected your wallet. Manage existing vaults or create a new one.
                        </p>

                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
                            <div style={{ position: 'absolute', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>
                            <img src="/device_chip.png" alt="Smart Account" style={{ width: '220px', height: 'auto', zIndex: 1, filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))' }} />
                        </div>

                        <div style={{ width: '100%', padding: '0 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <button 
                                onClick={() => { setShowCreateForm(false); setStep('dashboard'); }}
                                style={{ width: '100%', padding: '18px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '16px', fontWeight: 700, borderRadius: '24px', cursor: 'pointer' }}>
                                Check Existing Vaults
                            </button>
                            <button 
                                onClick={() => { setShowCreateForm(true); setStep('dashboard'); }}
                                style={{ width: '100%', padding: '18px', background: '#fff', color: '#000', border: 'none', fontSize: '16px', fontWeight: 700, borderRadius: '24px', cursor: 'pointer' }}>
                                Create New Vault
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // DASHBOARD STEP
    return (
        <div className="wallet-shell">
            <TransactionOverlay loading={uiStatus.loading} txId={uiStatus.txId} onCancel={() => {}} />

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
                            <Home size={20} /> Dashboard
                        </button>
                        <button onClick={() => setCurrentTab('security')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', background: currentTab === 'security' ? '#F2F2F7' : 'transparent', border: 'none', color: currentTab === 'security' ? '#3B82F6' : '#8E8E93', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                            <Shield size={20} /> Security
                        </button>
                    </nav>

                    <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #E5E5EA' }}>
                        <button onClick={() => setStep('connect')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', background: '#F2F2F7', border: 'none', color: '#1C1C1E', fontWeight: 700, cursor: 'pointer', marginBottom: '12px' }}>
                            <ArrowLeft size={18} /> Exit Dashboard
                        </button>
                        <button onClick={handleDisconnect} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', background: '#FFF0F0', border: 'none', color: '#FF3B30', fontWeight: 700, cursor: 'pointer' }}>
                            <LogOut size={20} /> Disconnect
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="desktop-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
                    {isDiscovering ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                            <div className="spinner" style={{ width: '44px', height: '44px' }}></div>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#8E8E93' }}>FETCHING VAULTS...</span>
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
                            onHeartbeat={() => handleHeartbeat(selectedVaultId!, loadVaultState)}
                            onWithdraw={() => handleWithdraw(selectedVaultId!, 0, loadVaultState)} // Simplified for now
                            onClaim={() => handleClaim(selectedVaultId!, loadVaultState)}
                            currentTab={currentTab}
                            setCurrentTab={setCurrentTab}
                        />
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', textAlign: 'center' }}>
                            <div style={{ width: '96px', height: '96px', margin: '0 auto 32px', background: '#fff', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                <Shield size={48} color="#3B82F6" />
                            </div>
                            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#1C1C1E', marginBottom: '16px' }}>No Vault Found</h2>
                            <p style={{ color: '#8E8E93', fontSize: '16px', marginBottom: '40px' }}>Your address is <b>{formatAddr(walletAddress || '')}</b>. Start your legacy on {currentChain.name}.</p>
                            <button className="nb-btn-primary" style={{ padding: '18px 48px' }} onClick={() => setShowCreateForm(true)}>
                                <Plus size={20} /> Create New Vault
                            </button>
                        </div>
                    )}

                    {/* Create Form Overlay */}
                    {showCreateForm && (
                        <div style={{ position: 'absolute', inset: 0, zIndex: 1000, background: '#F2F2F7', display: 'flex', flexDirection: 'column', padding: '32px' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                                <button onClick={() => setShowCreateForm(false)} style={{ background: '#fff', border: 'none', color: '#000', cursor: 'pointer', padding: '12px', borderRadius: '12px' }}><ArrowLeft size={24} /></button>
                                <span style={{ fontWeight: 800, fontSize: '15px' }}>NEW PROTOCOL</span>
                                <div style={{ width: 48 }} />
                            </div>

                            <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%', background: '#fff', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#8E8E93', marginBottom: '12px', textTransform: 'uppercase' }}>Beneficiary Address</label>
                                    <input value={beneficiaryInput} onChange={(e) => setBeneficiaryInput(e.target.value)} placeholder="0x... or Solana Address" style={{ width: '100%', background: '#F2F2F7', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '18px', fontSize: '16px', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                                    <div style={{ background: '#F2F2F7', padding: '16px', borderRadius: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#8E8E93', marginBottom: '8px' }}>TIMER (SEC)</label>
                                        <input type="number" value={lockDurationInput} onChange={(e) => setLockDurationInput(e.target.value)} style={{ width: '100%', background: 'none', border: 'none', color: '#000', fontSize: '16px', outline: 'none' }} />
                                    </div>
                                    <div style={{ background: '#F2F2F7', padding: '16px', borderRadius: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#8E8E93', marginBottom: '8px' }}>DEPOSIT ({currentChain.nativeCurrency.symbol})</label>
                                        <input type="number" value={depositInput} onChange={(e) => setDepositInput(e.target.value)} style={{ width: '100%', background: 'none', border: 'none', color: '#000', fontSize: '16px', outline: 'none' }} />
                                    </div>
                                </div>
                                <button className="nb-btn-primary" style={{ width: '100%', padding: '20px' }} onClick={handleCreateVaultSubmit}>Initiate Protection</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Dropdown (Dashboard mode only) */}
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
                }
            `}</style>
        </div>
    )
}

export default VaultPage
