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
    ArrowRight,
    Code,
    Info
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
import VaultList, { VaultMetadata } from '../components/VaultList'
import PrivacyPolicy from '../components/PrivacyPolicy'
import { getVaultsByOwner, getVaultsByBeneficiary, deleteVaultFromRegistry, RegistryVault } from '../utils/supabase'
import { Toast } from '../components/Toast'

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
        resetStatus,
        handleConnect,
        handleDisconnect,
        handleCreateVault,
        handleHeartbeat,
        handleClaim,
        handleWithdraw
    } = useVaultActions()

    // Toast state
    const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null)

    // Watch for errors and show toast
    useEffect(() => {
        if (uiStatus.error) {
            setToast({ message: uiStatus.error, type: 'error' })
            // Clear the error from uiStatus after showing
            setTimeout(() => resetStatus(), 100)
        }
    }, [uiStatus.error, resetStatus])

    useEffect(() => {
        if (uiStatus.txId && !uiStatus.loading && (uiStatus.txId.includes('successfully') || uiStatus.txId.includes('confirmed') || uiStatus.txId.includes('completed'))) {
            setToast({ message: uiStatus.txId, type: 'success' })
        }
    }, [uiStatus.txId, uiStatus.loading])

    // Explicit Navigation Step: 'landing' | 'connect' | 'actionSelect' | 'dashboard' | 'vaultList' | 'privacy'
    const [step, setStep] = useState<'landing' | 'connect' | 'actionSelect' | 'dashboard' | 'vaultList' | 'privacy'>('landing')

    // Expose step to window for landing page access
    React.useEffect(() => {
        (window as any).setPageStep = setStep;
        return () => { delete (window as any).setPageStep; };
    }, []);

    const [currentTab, setCurrentTab] = useState<'dashboard' | 'security' | 'history' | 'info' | 'api'>('dashboard')

    // Vault Data
    const [userVaults, setUserVaults] = useState<RegistryVault[]>([])
    const [hiddenVaultIds, setHiddenVaultIds] = useState<string[]>(() => {
        const saved = localStorage.getItem('hidden_vaults')
        return saved ? JSON.parse(saved) : []
    })
    const [inheritedVaults, setInheritedVaults] = useState<RegistryVault[]>([])
    const [activeListTab, setActiveListTab] = useState<'owned' | 'inherited'>('owned')
    const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null)
    const [vaultState, setVaultState] = useState<VaultState | null>(null)
    const [vaultBalance, setVaultBalance] = useState(0)
    const [isDiscovering, setIsDiscovering] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [showVaultSelector, setShowVaultSelector] = useState(false)
    const [copied, setCopied] = useState(false)
    const [vaultRoles, setVaultRoles] = useState<Record<string, string>>({})

    // Form inputs
    const [beneficiaryInput, setBeneficiaryInput] = useState('')
    const [lockDurationInput, setLockDurationInput] = useState('60')
    const [depositInput, setDepositInput] = useState('0.1')

    const lastFetchRef = React.useRef<number>(0)

    const discoverVaults = useCallback(async (force = false) => {
        if (!walletAddress || walletAddress === 'undefined') return
        
        const now = Date.now()
        if (!force && now - lastFetchRef.current < 5000) return
        lastFetchRef.current = now

        setIsDiscovering(true)
        try {
            // 1. Fetch from Cloud and On-Chain in parallel
            const [cloudVaults, onChainIds, cloudInherited, onChainClaimable] = await Promise.all([
                getVaultsByOwner(walletAddress).catch(() => []),
                adapter.discoverVaults(walletAddress).catch(() => []),
                getVaultsByBeneficiary(walletAddress).catch(() => []),
                adapter.discoverClaimableVaults(walletAddress).catch(() => [])
            ])

            // 2. Merge Owned Vaults (Unique by ID)
            const ownedMap = new Map<string, RegistryVault>()
            cloudVaults.forEach(v => {
                const idStr = v.vault_id.toString().toLowerCase()
                // Sanitize legacy names from database
                if (v.vault_name === 'Algorand Vault' && currentChain.type !== 'algorand') {
                    v.vault_name = `${currentChain.name} Vault`
                }
                ownedMap.set(idStr, v)
            })
            
            // Add on-chain discovered ones if missing
            for (const id of onChainIds) {
                const idStr = id.toString().toLowerCase()
                if (!ownedMap.has(idStr)) {
                    try {
                        const state = await adapter.fetchVaultState(id)
                        if (state) {
                            ownedMap.set(idStr, {
                                vault_id: id.toString(),
                                vault_name: `${currentChain.name} Vault`,
                                owner_address: state.owner,
                                beneficiary_address: state.beneficiary
                            })
                        }
                    } catch (e) {
                        console.warn(`[Discovery] Failed to fetch state for vault ${id}`, e)
                    }
                }
            }
            setUserVaults(Array.from(ownedMap.values()))

            // 3. Merge Inherited Vaults (Unique by ID)
            const inheritedMap = new Map<string, RegistryVault>()
            cloudInherited.forEach(v => {
                const idStr = v.vault_id.toString().toLowerCase()
                if (v.vault_name === 'Algorand Vault' && currentChain.type !== 'algorand') {
                    v.vault_name = `${currentChain.name} Vault`
                }
                inheritedMap.set(idStr, v)
            })

            for (const c of onChainClaimable) {
                const idStr = c.vaultId.toString().toLowerCase()
                if (!inheritedMap.has(idStr)) {
                    inheritedMap.set(idStr, {
                        vault_id: c.vaultId.toString(),
                        vault_name: `${currentChain.name} Vault`,
                        owner_address: c.state.owner,
                        beneficiary_address: walletAddress
                    })
                }
            }
            setInheritedVaults(Array.from(inheritedMap.values()))

            // Auto-select logic
            if (!selectedVaultId) {
                const allOwned = Array.from(ownedMap.values())
                const allInherited = Array.from(inheritedMap.values())
                if (allOwned.length > 0) setSelectedVaultId(allOwned[0].vault_id)
                else if (allInherited.length > 0) {
                    setSelectedVaultId(allInherited[0].vault_id)
                    setActiveListTab('inherited')
                }
            }
        } catch (e) {
            console.error('[Discovery] Failed:', e)
        } finally {
            setIsDiscovering(false)
        }
    }, [adapter, walletAddress, selectedVaultId])

    useEffect(() => {
        if (isConnected && walletAddress && walletAddress !== 'undefined') {
            discoverVaults()
        }
    }, [isConnected, currentChain.id, walletAddress, discoverVaults])

    const handleDeleteVaultId = async (id: string) => {
        // 1. Remove from Cloud (Supabase)
        try {
            await deleteVaultFromRegistry(id)
        } catch (e) {
            console.error('Failed to delete from cloud registry:', e)
        }

        // 2. Add to local blacklist as backup/instant UI update
        const updated = [...hiddenVaultIds, id]
        setHiddenVaultIds(updated)
        localStorage.setItem('hidden_vaults', JSON.stringify(updated))
        
        if (selectedVaultId === id) setSelectedVaultId(null)
    }

    const handleDeleteAll = async () => {
        const currentList = activeListTab === 'owned' ? visibleOwned : visibleInherited
        const idsToDelete = currentList.map(v => v.vault_id)

        // 1. Remove all from Cloud
        try {
            await Promise.all(idsToDelete.map(id => deleteVaultFromRegistry(id)))
        } catch (e) {
            console.error('Failed to delete some vaults from cloud:', e)
        }

        // 2. Update local blacklist
        const newHidden = [...hiddenVaultIds, ...idsToDelete]
        const unique = Array.from(new Set(newHidden))
        setHiddenVaultIds(unique)
        localStorage.setItem('hidden_vaults', JSON.stringify(unique))
        
        setSelectedVaultId(null)
    }

    const visibleOwned = useMemo(() => {
        const visible = userVaults.filter(v => !hiddenVaultIds.includes(v.vault_id))
        console.log('[VaultPage] Visible Owned:', visible.length, 'Hidden:', hiddenVaultIds.length);
        return visible
    }, [userVaults, hiddenVaultIds])

    const visibleInherited = useMemo(() => inheritedVaults.filter(v => !hiddenVaultIds.includes(v.vault_id)), [inheritedVaults, hiddenVaultIds])

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
            } else {
                // If state is null (e.g. Solana account closed after claim), 
                // we should stop trying to load it to avoid stuck spinner.
                console.log('[VaultPage] Vault state is null, resetting selection.')
                setSelectedVaultId(null)
            }
        } catch (e) {
            setSelectedVaultId(null)
        }
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
    const isExpired = !!(vaultState && !vaultState.released && vaultState.lastHeartbeat > 0 && (now >= (vaultState.lastHeartbeat || 0) + (vaultState.lockDuration || 0)))

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const formatAddr = (addr: string) => {
        if (!addr || typeof addr !== 'string') return '?...?'
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    }

    // Navigation Actions
    const handleLaunchApp = () => setStep('connect')

    const handleCreateVaultSubmit = () => {
        handleCreateVault(
            beneficiaryInput,
            lockDurationInput,
            depositInput,
            (vaultId) => {
                setShowCreateForm(false)
                setSelectedVaultId(vaultId)
                setStep('dashboard')
                discoverVaults()
            },
            `${currentChain.name} Vault`
        )
    }

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

    const handleVaultSelect = (id: string) => {
        setSelectedVaultId(id)
        setStep('dashboard')
    }

    // RENDER LOGIC
    if (step === 'landing') {
        return <LandingPage onLaunch={handleLaunchApp} currentChain={currentChain} />
    }

    if (step === 'connect') {
        return (
            <div className="wallet-shell">
                {/* Fixed Back Button - Improved Mobile Spacing */}
                <div style={{ position: 'absolute', top: 'clamp(16px, 4vh, 24px)', left: 'clamp(16px, 4vw, 24px)', zIndex: 100 }}>
                    <button onClick={handleGoBackToLanding} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, backdropFilter: 'blur(10px)', transition: 'all 0.2s ease' }} className="nav-btn-hover">
                        <ArrowLeft size={16} />
                        Back
                    </button>
                </div>

                <div className="wallet-container" style={{ background: '#0B131E', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <ConnectScreen
                            onConnect={handleConnect}
                            onContinue={handleProceedToActionSelect}
                            onDisconnect={handleGoBackToLanding}
                            connecting={uiStatus.loading}
                        />
                    </div>
                </div>
            </div>
        )
    }

    if (step === 'actionSelect') {
        return (
            <div className="wallet-shell">
                <div style={{ position: 'absolute', top: 'clamp(16px, 4vh, 24px)', left: 'clamp(16px, 4vw, 24px)', zIndex: 100 }}>
                    <button onClick={() => setStep('connect')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, backdropFilter: 'blur(10px)', transition: 'all 0.2s ease' }} className="nav-btn-hover">
                        <ArrowLeft size={16} />
                        Back
                    </button>
                </div>

                <div className="wallet-container" style={{ background: '#0B131E', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', color: '#fff' }}>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', letterSpacing: '-0.5px' }}>
                            You're set to go!
                        </h1>
                        <p style={{ fontSize: '14px', color: '#8E8E93', textAlign: 'center', maxWidth: '280px', marginBottom: '40px', lineHeight: 1.5 }}>
                            You've successfully connected your wallet. Manage existing vaults or create a new one.
                        </p>

                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
                            <div style={{ position: 'absolute', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>
                            <img src="/device_chip.png" alt="Smart Account" style={{ width: '220px', height: 'auto', zIndex: 1, filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))', mixBlendMode: 'screen' }} />
                        </div>

                        <div style={{ width: '100%', padding: '0 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <button
                                onClick={() => { setShowCreateForm(false); setStep('vaultList'); }}
                                style={{ width: '100%', padding: '18px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '16px', fontWeight: 700, borderRadius: '24px', cursor: 'pointer' }}>
                                Check Existing Vaults
                            </button>
                            <button
                                onClick={() => { setShowCreateForm(true); setStep('dashboard'); }}
                                style={{ width: '100%', padding: '18px', background: '#fff', color: '#000', border: 'none', fontSize: '16px', fontWeight: 700, borderRadius: '24px', cursor: 'pointer' }}>
                                Create New Vault
                            </button>
                            <button
                                onClick={() => { setCurrentTab('api'); setShowCreateForm(true); setStep('dashboard'); }}
                                style={{ width: '100%', padding: '18px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', fontSize: '16px', fontWeight: 700, borderRadius: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <Code size={20} /> Developer Mode
                            </button>
                            <button
                                onClick={() => setStep('privacy')}
                                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginTop: '10px' }}>
                                Privacy Policy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (step === 'privacy') {
        return <PrivacyPolicy onBack={() => setStep('actionSelect')} />
    }

    if (step === 'vaultList') {
        return (
            <div style={{ minHeight: '100vh', background: '#0B131E', width: '100%' }}>
                <div style={{ position: 'fixed', top: 'clamp(16px, 4vh, 24px)', left: 'clamp(16px, 4vw, 24px)', zIndex: 100 }}>
                    <button onClick={() => setStep('actionSelect')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, backdropFilter: 'blur(10px)', transition: 'all 0.2s ease' }} className="nav-btn-hover">
                        <ArrowLeft size={16} /> Back
                    </button>
                </div>
                <div style={{ paddingTop: '100px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    <VaultList
                        vaults={visibleOwned as any}
                        inheritedVaults={visibleInherited as any}
                        activeListTab={activeListTab}
                        setActiveListTab={setActiveListTab}
                        selectedVaultId={selectedVaultId}
                        onSelect={handleVaultSelect}
                        onDelete={handleDeleteVaultId}
                        onDeleteAll={handleDeleteAll}
                        onCreateNew={() => { setShowCreateForm(true); setStep('dashboard'); }}
                        formatAddr={formatAddr}
                        currentChain={currentChain}
                        isDiscovering={isDiscovering}
                    />
                </div>
            </div>
        )
    }

    // DASHBOARD STEP
    return (
        <div className="wallet-shell">
            {toast && (
                <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, width: '90%', maxWidth: '420px' }}>
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                </div>
            )}
            <TransactionOverlay loading={uiStatus.loading} txId={uiStatus.txId} onCancel={() => resetStatus()} />

            <div className={`wallet-container ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`} style={{ width: '100%', height: '100vh', overflow: 'hidden', background: '#080e17' }}>
                {/* Mobile Menu Toggle */}
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{ 
                        position: 'fixed', 
                        top: '14px', 
                        right: '12px', 
                        zIndex: 3000, 
                        background: 'rgba(25, 35, 55, 0.9)', 
                        border: '1px solid rgba(255,255,255,0.15)', 
                        color: '#fff', 
                        padding: '12px', 
                        borderRadius: '14px', 
                        display: 'none', 
                        backdropFilter: 'blur(15px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        transition: 'all 0.2s ease'
                    }}
                    className="mobile-menu-toggle"
                >
                    {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>

                {/* Sidebar (Responsive) */}
                <div className={`desktop-sidebar ${isMobileMenuOpen ? 'show' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Asterisk size={24} color="#000" />
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '20px', color: '#fff' }}>TRUSTVAULT 3</span>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        <button onClick={() => { setCurrentTab('dashboard'); setIsMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', background: currentTab === 'dashboard' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: currentTab === 'dashboard' ? '#fff' : '#94a3b8', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                            <Home size={20} /> Dashboard
                        </button>
                        <button onClick={() => { setCurrentTab('security'); setIsMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', background: currentTab === 'security' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: currentTab === 'security' ? '#fff' : '#94a3b8', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                            <Shield size={20} /> Security
                        </button>
                        <button onClick={() => { setCurrentTab('history'); setIsMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', background: currentTab === 'history' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: currentTab === 'history' ? '#fff' : '#94a3b8', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                            <History size={20} /> Activity
                        </button>
                        <button onClick={() => { setCurrentTab('info'); setIsMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', background: currentTab === 'info' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: currentTab === 'info' ? '#fff' : '#94a3b8', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                            <Info size={20} /> Vault Info
                        </button>
                        <button onClick={() => { setCurrentTab('api'); setIsMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', background: currentTab === 'api' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: currentTab === 'api' ? '#fff' : '#94a3b8', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>
                            <Code size={20} /> API & SDK
                        </button>
                    </nav>

                    <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <button onClick={() => setStep('actionSelect')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 700, cursor: 'pointer', marginBottom: '12px' }}>
                            <ArrowLeft size={18} /> Back
                        </button>
                        <button onClick={handleDisconnect} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer' }}>
                            <LogOut size={20} /> Disconnect
                        </button>
                    </div>
                </div>

                {/* Main Content Area - Fixed Desktop Blank Issue */}
                <div className="desktop-content" style={{ flex: 1, minWidth: 0, position: 'relative', background: '#080e17', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {isDiscovering ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                            <div className="spinner" style={{ width: '44px', height: '44px' }}></div>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#8E8E93' }}>FETCHING VAULTS...</span>
                        </div>
                    ) : selectedVaultId && !vaultState ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                            <div className="spinner" style={{ width: '44px', height: '44px' }}></div>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#8E8E93' }}>LOADING VAULT DATA...</span>
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
                            isLatest={selectedVaultId === userVaults[0]?.vault_id}
                            formatAddr={formatAddr}
                            copyToClipboard={copyToClipboard}
                            onHeartbeat={() => handleHeartbeat(selectedVaultId!, loadVaultState)}
                            onWithdraw={(amount: number) => handleWithdraw(selectedVaultId!, amount, loadVaultState)}
                            onClaim={() => handleClaim(selectedVaultId!, loadVaultState)}
                            vaultName={userVaults.find(v => v.vault_id === selectedVaultId)?.vault_name}
                            onRefresh={loadVaultState}
                            onBack={() => setStep('actionSelect')}
                            uiStatus={uiStatus}
                            currentTab={currentTab}
                            setCurrentTab={setCurrentTab}
                        />
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', textAlign: 'center' }}>
                            <div style={{ width: '96px', height: '96px', margin: '0 auto 32px', background: '#111e2f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Shield size={48} color="#fff" />
                            </div>
                            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>No Vault Found</h2>
                            <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '40px' }}>Your address is <b>{formatAddr(walletAddress || '')}</b>. Start your legacy on {currentChain.name}.</p>
                            <button className="nb-btn-primary" style={{ padding: '18px 48px', background: '#fff', color: '#000', border: 'none' }} onClick={() => setShowCreateForm(true)}>
                                <Plus size={20} /> Create New Vault
                            </button>
                        </div>
                    )}

                    {/* Create Form Overlay */}
                    {showCreateForm && (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: '#0B131E', display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <button onClick={() => setShowCreateForm(false)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', padding: '12px', borderRadius: '12px' }}><ArrowLeft size={24} /></button>
                                <span style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>NEW PROTOCOL</span>
                                <div style={{ width: 48 }} />
                            </div>

                            <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%', background: '#111e2f', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '40px' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>Beneficiary Address</label>
                                    <input value={beneficiaryInput} onChange={(e) => setBeneficiaryInput(e.target.value)} placeholder={currentChain.type === 'evm' ? '0x... ETH Address' : currentChain.type === 'solana' ? 'Solana Address' : 'Algorand Address'} style={{ width: '100%', background: '#080e17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '18px', fontSize: '16px', outline: 'none', color: '#fff' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                                    <div style={{ background: '#080e17', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>TIMER (SEC)</label>
                                        <input type="number" value={lockDurationInput} onChange={(e) => setLockDurationInput(e.target.value)} style={{ width: '100%', background: 'none', border: 'none', color: '#fff', fontSize: '16px', outline: 'none' }} />
                                    </div>
                                    <div style={{ background: '#080e17', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#94a3b8', marginBottom: '8px' }}>DEPOSIT ({currentChain.nativeCurrency.symbol})</label>
                                        <input type="number" value={depositInput} onChange={(e) => setDepositInput(e.target.value)} style={{ width: '100%', background: 'none', border: 'none', color: '#fff', fontSize: '16px', outline: 'none' }} />
                                    </div>
                                </div>
                                <button className="nb-btn-primary" style={{ width: '100%', padding: '20px', background: '#fff', color: '#000', border: 'none' }} onClick={handleCreateVaultSubmit}>Initiate Protection</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

                {/* Mobile Dropdown (Dashboard mode only) */}
                {!showCreateForm && (
                    <div className="mobile-only-selector">
                        <VaultDropdown
                            vaults={userVaults as any}
                            inheritedVaults={inheritedVaults as any}
                            activeListTab={activeListTab}
                            setActiveListTab={setActiveListTab}
                            onSelect={setSelectedVaultId}
                            onDelete={handleDeleteVaultId} 
                            onDeleteAll={handleDeleteAll}
                            onCreateNew={() => { setShowCreateForm(true); setStep('dashboard'); }}
                            formatAddr={formatAddr}
                            showVaultSelector={showVaultSelector}
                            setShowVaultSelector={setShowVaultSelector}
                            selectedVaultId={selectedVaultId}
                        />
                    </div>
                )}

                <style dangerouslySetInnerHTML={{ __html: `
                    .wallet-shell {
                        padding: 0 !important;
                        display: block !important;
                        width: 100% !important;
                        height: 100vh !important;
                        max-width: none !important;
                        background: #080e17 !important;
                    }
                    .wallet-container {
                        display: grid;
                        grid-template-columns: 280px 1fr;
                        width: 100% !important;
                        max-width: none !important;
                        min-height: 100vh;
                        background: #080e17;
                    }
                    .desktop-sidebar {
                        background: #0f172a;
                        border-right: 1px solid rgba(255,255,255,0.05);
                        padding: 32px 24px;
                        display: flex;
                        flex-direction: column;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        z-index: 1001;
                    }
                    .desktop-content {
                        min-width: 0;
                        min-height: 100vh;
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        background: #080e17;
                    }

                    .nav-btn-hover:hover {
                        background: rgba(255,255,255,0.15) !important;
                        transform: translateY(-1px);
                    }

                    @media (max-width: 1023px) {
                        .mobile-menu-toggle {
                            display: none !important;
                        }
                        .desktop-sidebar {
                            position: fixed;
                            top: 0;
                            left: -280px;
                            height: 100vh;
                            box-shadow: 20px 0 50px rgba(0,0,0,0.5);
                        }
                        .desktop-sidebar.show {
                            left: 0;
                        }
                        .desktop-content {
                            width: 100%;
                        }
                        .wallet-container {
                            display: flex !important;
                            flex-direction: column;
                        }
                    }
                    @media (min-width: 1024px) {
                        .mobile-only-selector { display: none; }
                    }
                ` }} />
            </div>
    )
}

export default VaultPage
