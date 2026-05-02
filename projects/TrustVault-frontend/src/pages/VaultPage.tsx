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
    ChevronRight
} from 'lucide-react'
import { useChain } from '../contexts/ChainContext'
import { useVaultActions } from '../hooks/useVaultActions'
import { VaultState } from '../adapters/types'
import ConnectScreen from '../components/ConnectScreen'
import VaultDashboard from '../components/VaultDashboard'
import ChainSwitcher from '../components/ChainSwitcher'
import VaultDropdown from '../components/VaultDropdown'
import TransactionOverlay from '../components/TransactionOverlay'

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

    // State
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
            
            // Auto-select first vault if none selected
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
        } catch (e) {
            console.error('Failed to load vault state:', e)
        }
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

    if (!isConnected) {
        return (
            <div className="wallet-shell">
                <div className="wallet-container">
                    <ConnectScreen onConnect={handleConnect} connecting={uiStatus.loading} />
                </div>
            </div>
        )
    }

    return (
        <div className="wallet-shell">
            <div className="wallet-container">
                
                {/* Global Overlays */}
                <TransactionOverlay 
                    loading={uiStatus.loading} 
                    txId={uiStatus.txId} 
                    onCancel={() => {}} 
                />

                {/* Header Section (Floating on top of Dashboard's gradient) */}
                {!showCreateForm && (
                    <div style={{ 
                        padding: '32px 24px 0', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        zIndex: 100,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        color: '#fff'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Asterisk size={18} color="#fff" />
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '15px' }}>TRUSTVAULT</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <ChainSwitcher />
                            <button onClick={handleDisconnect} style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.6, cursor: 'pointer' }}>
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                    {isDiscovering ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                            <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8' }}>SYNCING VAULTS</span>
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
                        />
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', margin: '0 auto 32px', background: '#f8fafc', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                                <Shield size={40} color="#94a3b8" />
                            </div>
                            <h2 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px', color: '#000' }}>YOUR LEGACY<br />STARTS HERE</h2>
                            <p style={{ color: '#64748b', marginBottom: '40px' }}>Secure your assets for the next generation on {currentChain.name}.</p>
                            <button className="nb-btn-primary" style={{ width: '100%' }} onClick={() => setShowCreateForm(true)}>
                                <Plus size={20} />
                                Create New Vault
                            </button>
                        </div>
                    )}
                </div>

                {/* Account Selector (VaultDropdown) */}
                {!showCreateForm && (
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
                )}

                {/* Create Form Overlay (Light Theme) */}
                {showCreateForm && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 200, background: '#fff', display: 'flex', flexDirection: 'column', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                            <button onClick={() => setShowCreateForm(false)} style={{ background: 'none', border: 'none', color: '#000', cursor: 'pointer' }}><ArrowLeft size={24} /></button>
                            <span style={{ fontWeight: 800, fontSize: '13px', color: '#000' }}>ESTABLISH VAULT</span>
                            <div style={{ width: 24 }} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>Beneficiary Address</label>
                                <input 
                                    value={beneficiaryInput}
                                    onChange={(e) => setBeneficiaryInput(e.target.value)}
                                    placeholder="Enter address..."
                                    style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', color: '#000', fontSize: '16px', outline: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>Timer (Sec)</label>
                                    <input 
                                        type="number"
                                        value={lockDurationInput}
                                        onChange={(e) => setLockDurationInput(e.target.value)}
                                        style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', color: '#000', fontSize: '16px', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>Deposit ({currentChain.nativeCurrency.symbol})</label>
                                    <input 
                                        type="number"
                                        value={depositInput}
                                        onChange={(e) => setDepositInput(e.target.value)}
                                        style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', color: '#000', fontSize: '16px', outline: 'none' }}
                                    />
                                </div>
                            </div>
                            <button className="nb-btn-primary" style={{ width: '100%', padding: '20px' }} onClick={handleCreateVaultSubmit}>
                                Initiate Protection
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VaultPage
