import React, { useState, useEffect, useCallback } from 'react'
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
    ArrowLeft
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
            <div className="wallet-container" style={{ display: 'flex', flexDirection: 'column' }}>
                
                {/* Global Overlays */}
                <TransactionOverlay 
                    loading={uiStatus.loading} 
                    txId={uiStatus.txId} 
                    onCancel={() => {}} 
                />

                {/* Header with Switcher & Logout */}
                {!showCreateForm && (
                    <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--nb-glass-border)' }}>
                                <Asterisk size={18} />
                            </div>
                            <span style={{ fontWeight: 800, letterSpacing: '-0.5px', fontSize: '15px' }}>TRUSTVAULT</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <ChainSwitcher />
                            <button onClick={handleDisconnect} style={{ background: 'none', border: 'none', color: 'var(--nb-text-dim)', cursor: 'pointer', padding: '4px' }}>
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                    {isDiscovering ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                            <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.05)', borderTopColor: 'var(--nb-accent)', borderRadius: '50%' }}></div>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--nb-text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Syncing Ledger...</span>
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
                            <div style={{ width: '80px', height: '80px', margin: '0 auto 32px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--nb-glass-border)' }}>
                                <Shield size={40} color="var(--nb-text-dim)" />
                            </div>
                            <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '16px', lineHeight: 1.1 }}>SECURE YOUR<br />LEGACY</h2>
                            <p className="nb-desc" style={{ marginBottom: '40px' }}>Create your first decentralized inheritance vault on {currentChain.name}.</p>
                            <button className="nb-btn-primary" style={{ width: '100%' }} onClick={() => setShowCreateForm(true)}>
                                <Plus size={20} />
                                Establish New Vault
                            </button>
                        </div>
                    )}
                </div>

                {/* Account / Vault Switcher */}
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

                {/* Create Form Overlay */}
                {showCreateForm && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 200, background: 'var(--nb-bg)', display: 'flex', flexDirection: 'column', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                            <button onClick={() => setShowCreateForm(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><ArrowLeft size={24} /></button>
                            <span style={{ fontWeight: 800, fontSize: '13px', letterSpacing: '1px' }}>ESTABLISH VAULT</span>
                            <div style={{ width: 24 }} />
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--nb-text-dim)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Beneficiary Address</label>
                                <input 
                                    value={beneficiaryInput}
                                    onChange={(e) => setBeneficiaryInput(e.target.value)}
                                    placeholder="Enter address..."
                                    className="nb-input"
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--nb-glass-border)', borderRadius: '16px', padding: '18px', color: '#fff', fontSize: '15px', outline: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--nb-text-dim)', marginBottom: '12px', textTransform: 'uppercase' }}>Security (Sec)</label>
                                    <input 
                                        type="number"
                                        value={lockDurationInput}
                                        onChange={(e) => setLockDurationInput(e.target.value)}
                                        className="nb-input"
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--nb-glass-border)', borderRadius: '16px', padding: '18px', color: '#fff', fontSize: '15px', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--nb-text-dim)', marginBottom: '12px', textTransform: 'uppercase' }}>Initial (SOL)</label>
                                    <input 
                                        type="number"
                                        value={depositInput}
                                        onChange={(e) => setDepositInput(e.target.value)}
                                        className="nb-input"
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--nb-glass-border)', borderRadius: '16px', padding: '18px', color: '#fff', fontSize: '15px', outline: 'none' }}
                                    />
                                </div>
                            </div>
                            <button className="nb-btn-primary" style={{ width: '100%', padding: '20px' }} onClick={handleCreateVaultSubmit}>
                                Initiate Protection System
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

import { useMemo } from 'react'

export default VaultPage
