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
    Search
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
            // Error is handled in adapter
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

                {/* Main Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    {isDiscovering ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px', background: 'linear-gradient(180deg, #1E3C72 0%, #2A5298 100%)' }}>
                            <div className="spinner" style={{ width: '44px', height: '44px', borderTopColor: '#fff' }}></div>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>INITIALIZING PROTOCOL</span>
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
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F2F2F7' }}>
                             <div style={{ 
                                background: 'linear-gradient(180deg, #1E3C72 0%, #2A5298 100%)', 
                                padding: '32px 24px 64px',
                                color: '#fff'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Asterisk size={20} />
                                        </div>
                                        <span style={{ fontWeight: 800, fontSize: '15px' }}>TRUSTVAULT</span>
                                    </div>
                                    <ChainSwitcher />
                                </div>
                            </div>
                            
                            <div style={{ flex: 1, marginTop: '-32px', background: '#F2F2F7', borderRadius: '32px 32px 0 0', padding: '48px 32px', textAlign: 'center' }}>
                                <div style={{ width: '96px', height: '96px', margin: '0 auto 32px', background: '#FFFFFF', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                    <Shield size={48} color="#3B82F6" />
                                </div>
                                <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '16px', color: '#1C1C1E', letterSpacing: '-1px' }}>YOUR LEGACY<br />STARTS HERE</h2>
                                <p style={{ color: '#8E8E93', fontSize: '15px', lineHeight: 1.6, marginBottom: '48px' }}>Create a secure, decentralized vault for your assets on {currentChain.name}.</p>
                                <button className="nb-btn-primary" style={{ width: '100%', padding: '20px', background: '#3B82F6', fontSize: '17px', fontWeight: 700 }} onClick={() => setShowCreateForm(true)}>
                                    <Plus size={22} />
                                    Create First Vault
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Selector */}
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

                {/* Create Form (Strictly Following Theme) */}
                {showCreateForm && (
                    <div style={{ position: 'absolute', inset: 0, zIndex: 200, background: '#F2F2F7', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ 
                            background: 'linear-gradient(180deg, #1E3C72 0%, #2A5298 100%)', 
                            padding: '32px 24px 64px',
                            color: '#fff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <button onClick={() => setShowCreateForm(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><ArrowLeft size={24} /></button>
                            <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '1px' }}>NEW PROTOCOL</span>
                            <div style={{ width: 24 }} />
                        </div>

                        <div style={{ flex: 1, marginTop: '-32px', background: '#F2F2F7', borderRadius: '32px 32px 0 0', padding: '40px 24px' }}>
                            <div style={{ background: '#FFFFFF', padding: '32px 24px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#8E8E93', marginBottom: '12px', textTransform: 'uppercase' }}>Beneficiary Address</label>
                                    <input 
                                        value={beneficiaryInput}
                                        onChange={(e) => setBeneficiaryInput(e.target.value)}
                                        placeholder="Enter address..."
                                        style={{ width: '100%', background: '#F2F2F7', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '18px', color: '#1C1C1E', fontSize: '16px', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#8E8E93', marginBottom: '12px', textTransform: 'uppercase' }}>Timer (Sec)</label>
                                        <input 
                                            type="number"
                                            value={lockDurationInput}
                                            onChange={(e) => setLockDurationInput(e.target.value)}
                                            style={{ width: '100%', background: '#F2F2F7', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '18px', color: '#1C1C1E', fontSize: '16px', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#8E8E93', marginBottom: '12px', textTransform: 'uppercase' }}>Deposit ({currentChain.nativeCurrency.symbol})</label>
                                        <input 
                                            type="number"
                                            value={depositInput}
                                            onChange={(e) => setDepositInput(e.target.value)}
                                            style={{ width: '100%', background: '#F2F2F7', border: '1px solid #E5E5EA', borderRadius: '16px', padding: '18px', color: '#1C1C1E', fontSize: '16px', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                                <button className="nb-btn-primary" style={{ width: '100%', padding: '20px', background: '#3B82F6', fontSize: '17px', fontWeight: 700 }} onClick={handleCreateVaultSubmit}>
                                    Initiate Protection
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VaultPage
