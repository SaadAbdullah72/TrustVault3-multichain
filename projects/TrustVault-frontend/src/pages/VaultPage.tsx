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
    CreditCard,
    Timer,
    Eye,
    EyeOff,
    FileText
} from 'lucide-react'

export default function VaultPage() {
    const { walletAddress, currentChain, adapter, isConnected } = useChain()

    // --- Modular Hooks ---
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

    const handleDirectClaim = async (vaultId: string) => {
        await handleClaim(vaultId, () => {
            handleManualScan()
        })
    }

    const {
        vaultState,
        vaultBalance,
        loadVaultState
    } = useVaultState(selectedVaultId)

    // --- Page Local State ---
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [beneficiaryInput, setBeneficiaryInput] = useState('')
    const [lockDurationInput, setLockDurationInput] = useState('60')
    const [depositInput, setDepositInput] = useState('1')

    const [showVaultSelector, setShowVaultSelector] = useState(false)
    const [copied, setCopied] = useState(false)
    const [showBalanceHidden, setShowBalanceHidden] = useState(false)
    const [tilt, setTilt] = useState({ x: 0, y: 0 })
    const [isInteracting, setIsInteracting] = useState(false)

    // --- Derived State ---
    const vaultAddress = useMemo(() => selectedVaultId ? adapter.getVaultAddress(selectedVaultId) : '', [selectedVaultId, adapter])
    const isOwner = useMemo(() => {
        if (!walletAddress || !vaultState?.owner) return false;
        
        const owner = String(vaultState.owner)
        const wallet = String(walletAddress)
        
        // Solana is case-sensitive, EVM is not
        if (currentChain.type === 'solana') {
            return owner === wallet
        }
        return owner.toUpperCase() === wallet.toUpperCase()
    }, [walletAddress, vaultState, currentChain, selectedVaultId])

    const isBeneficiary = useMemo(() => {
        if (!walletAddress || !vaultState?.beneficiary) return false;
        
        const ben = String(vaultState.beneficiary)
        const wallet = String(walletAddress)
        
        if (currentChain.type === 'solana') {
            return ben === wallet
        }
        return ben.toUpperCase() === wallet.toUpperCase()
    }, [walletAddress, vaultState, currentChain])

    const now = Math.floor(Date.now() / 1000)
    const canRelease = !!(vaultState && !vaultState.released && (now >= (vaultState.lastHeartbeat || 0) + (vaultState.lockDuration || 0)))
    const isExpired = !!(vaultState && !vaultState.released && (now >= (vaultState.lastHeartbeat || 0) + (vaultState.lockDuration || 0)))

    // --- Handlers ---
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

    const handleDeleteVaultId = (id: string) => {
        const updated = userVaults.filter(v => v !== id)
        setUserVaults(updated)
        if (selectedVaultId === id) {
            setSelectedVaultId(updated.length > 0 ? updated[0] : null)
        }
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const rotateX = (((e.clientY - rect.top) - (rect.height / 2)) / (rect.height / 2)) * -15
        const rotateY = (((e.clientX - rect.left) - (rect.width / 2)) / (rect.width / 2)) * 15
        setTilt({ x: rotateX, y: rotateY })
        setIsInteracting(true)
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const touch = e.touches[0]
        const rotateX = (((touch.clientY - rect.top) - (rect.height / 2)) / (rect.height / 2)) * -20
        const rotateY = (((touch.clientX - rect.left) - (rect.width / 2)) / (rect.width / 2)) * 20
        setTilt({ x: rotateX, y: rotateY })
        setIsInteracting(true)
    }

    const resetTilt = () => {
        setTilt({ x: 0, y: 0 })
        setIsInteracting(false)
    }

    if (!isConnected) {
        return <ConnectScreen onConnect={handleConnect} wallets={[]} loading={uiStatus.loading} error={uiStatus.error} />
    }

    return (
        <div className="wallet-shell">
            <div className="wallet-container">
                {/* ======= TOP NAV BAR ======= */}
                <div className="wallet-topbar">
                    <div className="topbar-left">
                        <div className="topbar-logo">
                            <img src="/logo.svg" alt="TrustVault³" className="topbar-logo-img" />
                        </div>
                        <span className="topbar-brand">TrustVault<sup className="topbar-brand-sup">3</sup></span>
                    </div>

                    <div className="topbar-right">
                        <ChainSwitcher />
                        <div className="network-badge" style={{ borderColor: currentChain.color + '44' }}>
                            <CircleDot className="network-dot" style={{ color: currentChain.color }} />
                            <span>Testnet</span>
                        </div>
                        <button
                            onClick={handleDisconnect}
                            className="topbar-disconnect"
                            title="Disconnect"
                        >
                            <LogOut className="topbar-disconnect-icon" />
                        </button>
                    </div>
                </div>

                {/* ======= ACCOUNT HEADER ======= */}
                <div className="wallet-account-header">
                    <div className="vault-selector-trigger" onClick={() => setShowVaultSelector(!showVaultSelector)}>
                        <div className="vault-avatar">
                            <Shield className="vault-avatar-icon" />
                        </div>
                        <div className="vault-selector-info">
                            <span className="vault-selector-label">
                                {selectedVaultId ? `Vault #${selectedVaultId.slice(0, 8)}...` : 'No Vault Selected'}
                            </span>
                            <span className="vault-selector-addr">
                                {vaultAddress ? formatAddr(vaultAddress) : 'Select or create a vault'}
                            </span>
                        </div>
                        <ChevronDown className={`vault-selector-chevron ${showVaultSelector ? 'rotated' : ''}`} />
                    </div>

                    {showVaultSelector && (
                        <div className="vault-selector-dropdown">
                            <div className="vault-dropdown-header">
                                <span>My Vaults ({currentChain.name})</span>
                                <button onClick={handleManualScan} className="vault-dropdown-scan" disabled={uiStatus.loading || isDiscovering}>
                                    <RefreshCw className={`vault-dropdown-scan-icon ${isDiscovering ? 'spinning' : ''}`} />
                                </button>
                            </div>
                            {userVaults.length === 0 && (
                                <div className="vault-dropdown-empty">
                                    <Shield className="vault-dropdown-empty-icon" />
                                    <span>No vaults found on {currentChain.name}</span>
                                </div>
                            )}
                            {userVaults.map(id => (
                                <div key={id} className={`vault-dropdown-row ${selectedVaultId === id ? 'active' : ''}`}>
                                    <button
                                        className="vault-dropdown-item"
                                        onClick={() => { setSelectedVaultId(id); setShowVaultSelector(false) }}
                                    >
                                        <div className="vault-dropdown-item-avatar">
                                            <Shield className="vault-dropdown-item-icon" />
                                        </div>
                                        <div className="vault-dropdown-item-info">
                                            <div className="vault-dropdown-item-header">
                                                <span className="vault-dropdown-item-name">Vault #{id.length > 12 ? id.slice(0, 8) + '...' : id}</span>
                                                {vaultRoles[id] && (
                                                    <span className={`vault-dropdown-item-badge ${vaultRoles[id]}`}>
                                                        {vaultRoles[id]}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="vault-dropdown-item-addr">{formatAddr(adapter.getVaultAddress(id))}</span>
                                        </div>
                                        {selectedVaultId === id && <CheckCircle className="vault-dropdown-item-check" />}
                                    </button>
                                    <button
                                        className="vault-dropdown-delete"
                                        onClick={(e) => { e.stopPropagation(); handleDeleteVaultId(id) }}
                                        title="Remove from history"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <div className="vault-dropdown-actions">
                                <button className="vault-dropdown-action-btn" onClick={() => { setShowCreateForm(true); setShowVaultSelector(false) }}>
                                    <Plus className="vault-dropdown-action-icon" />
                                    <span>Create Vault</span>
                                </button>
                                <button className="vault-dropdown-action-btn scan" onClick={handleManualScan} disabled={isDiscovering}>
                                    <RefreshCw className={`vault-dropdown-action-icon ${isDiscovering ? 'spinning' : ''}`} />
                                    <span>Full Scan</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="wallet-address-bar">
                        <div className="wallet-address-dot" style={{ background: currentChain.color }} />
                        <span className="wallet-address-text">{formatAddr(walletAddress!)}</span>
                        <button className="wallet-address-copy" onClick={() => copyToClipboard(walletAddress!)} title="Copy Address">
                            {copied ? <CheckCircle className="copy-icon copied" /> : <Copy className="copy-icon" />}
                        </button>
                    </div>
                </div>

                {/* ======= NOTIFICATIONS ======= */}
                {claimableVaults.length > 0 && (
                    <div className="claim-notification">
                        <div className="claim-notification-header">
                            <Bell className="claim-bell" />
                            <span className="claim-notification-title">Incoming Inheritance</span>
                            <span className="claim-notification-badge">{claimableVaults.length}</span>
                        </div>
                        {claimableVaults.map((vault) => (
                            <div key={vault.vaultId} className="claim-card">
                                <div className="claim-card-info">
                                    <span className="claim-card-id">Vault #{vault.vaultId.length > 12 ? vault.vaultId.slice(0, 8) + '...' : vault.vaultId}</span>
                                    <span className="claim-card-status">Timer Expired</span>
                                </div>
                                <div className="claim-card-actions">
                                    <button
                                        onClick={() => setSelectedVaultId(vault.vaultId)}
                                        className="claim-card-view-btn"
                                        title="View Vault"
                                    >
                                        <Eye className="claim-card-btn-icon" />
                                        View
                                    </button>
                                    <button
                                        onClick={() => handleClaim(vault.vaultId, loadVaultState)}
                                        disabled={uiStatus.loading}
                                        className="claim-card-btn"
                                    >
                                        <Unlock className="claim-card-btn-icon" />
                                        {uiStatus.loading && selectedVaultId === vault.vaultId ? 'Claiming...' : 'Claim'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isScanningClaims && claimableVaults.length === 0 && (
                    <div className="scanning-indicator">
                        <RefreshCw className="scanning-icon spinning" />
                        <span>Scanning for claimable vaults...</span>
                    </div>
                )}

                {/* ======= FORMS ======= */}
                {showCreateForm && (
                    <div className="wallet-form-overlay">
                        <div className="wallet-form-card">
                            <div className="wallet-form-header">
                                <button onClick={() => setShowCreateForm(false)} className="wallet-form-back">
                                    <ChevronLeft />
                                </button>
                                <span className="wallet-form-title">Create Vault on {currentChain.name}</span>
                                <div style={{ width: 24 }} />
                            </div>
                            <div className="wallet-form-body">
                                <div className="wallet-input-group">
                                    <label className="wallet-input-label">
                                        <ArrowRight className="wallet-label-icon" />
                                        Beneficiary Address
                                    </label>
                                    <input
                                        value={beneficiaryInput}
                                        onChange={(e) => setBeneficiaryInput(e.target.value)}
                                        className="wallet-input"
                                        placeholder={currentChain.type === 'evm' ? '0x... address' : 'Address...'}
                                    />
                                </div>
                                <div className="wallet-form-row">
                                    <div className="wallet-input-group">
                                        <label className="wallet-input-label">
                                            <Clock className="wallet-label-icon" />
                                            Timer (seconds)
                                        </label>
                                        <input
                                            type="number"
                                            value={lockDurationInput}
                                            onChange={(e) => setLockDurationInput(e.target.value)}
                                            className="wallet-input"
                                        />
                                    </div>
                                    <div className="wallet-input-group">
                                        <label className="wallet-input-label">
                                            <Wallet className="wallet-label-icon" />
                                            Deposit ({currentChain.nativeCurrency.symbol})
                                        </label>
                                        <input
                                            type="number"
                                            value={depositInput}
                                            onChange={(e) => setDepositInput(e.target.value)}
                                            className="wallet-input"
                                        />
                                    </div>
                                </div>
                                <button onClick={handleCreateVaultSubmit} disabled={uiStatus.loading} className="wallet-form-submit">
                                    {uiStatus.loading ? (
                                        <RefreshCw className="spinning submit-icon" />
                                    ) : (
                                        <Shield className="submit-icon" />
                                    )}
                                    <span>{uiStatus.loading ? 'Deploying...' : `Deploy on ${currentChain.name}`}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ======= MAIN CONTENT ======= */}
                {isDiscovering ? (
                    <div className="wallet-loading">
                        <div className="wallet-loading-spinner" />
                        <span className="wallet-loading-text">Syncing with {currentChain.name}...</span>
                    </div>
                ) : selectedVaultId && vaultState ? (
                    <div className="wallet-main-content">
                        <div className="balance-section">
                            <div className="balance-label">
                                <span>Vault Balance</span>
                                <button onClick={() => setShowBalanceHidden(!showBalanceHidden)} className="balance-eye-btn">
                                    {showBalanceHidden ? <EyeOff className="balance-eye-icon" /> : <Eye className="balance-eye-icon" />}
                                </button>
                            </div>
                            <div className="balance-amount">
                                {showBalanceHidden ? '••••••' : vaultBalance.toFixed(4)}
                                <span className="balance-currency">{currentChain.nativeCurrency.symbol}</span>
                            </div>
                            <div className="role-badges" style={{ justifyContent: 'center', marginTop: 8 }}>
                                {isOwner && (
                                    <div className="role-badge owner">
                                        <Shield className="role-badge-icon" />
                                        <span>Owner</span>
                                    </div>
                                )}
                                {isBeneficiary && (
                                    <div className="role-badge beneficiary">
                                        <Wallet className="role-badge-icon" />
                                        <span>Beneficiary</span>
                                    </div>
                                )}
                                <div className={`vault-status-pill ${vaultState.released ? 'released' : isExpired ? 'expired' : 'secured'}`}>
                                    <div className="status-dot" />
                                    <span>{vaultState.released ? 'Released' : isExpired ? 'Timer Expired' : 'Secured'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions">
                            {isOwner && !vaultState.released && (
                                <>
                                    <button className="quick-action-btn" onClick={() => handleHeartbeat(selectedVaultId, loadVaultState)} disabled={uiStatus.loading || isExpired}>
                                        <div className={`quick-action-circle ${isExpired ? 'disabled' : 'heartbeat'}`}>
                                            <Heart className="quick-action-icon" />
                                        </div>
                                        <span className="quick-action-label">Heartbeat</span>
                                    </button>
                                    <button className="quick-action-btn" onClick={handleWithdrawAction} disabled={uiStatus.loading}>
                                        <div className="quick-action-circle withdraw">
                                            <ArrowUpFromLine className="quick-action-icon" />
                                        </div>
                                        <span className="quick-action-label">Withdraw</span>
                                    </button>
                                </>
                            )}
                            {isBeneficiary && !vaultState.released && (
                                <button className="quick-action-btn" onClick={() => handleClaim(selectedVaultId, loadVaultState)} disabled={uiStatus.loading || !canRelease}>
                                    <div className={`quick-action-circle ${canRelease ? 'claim' : 'disabled'}`}>
                                        <Unlock className="quick-action-icon" />
                                    </div>
                                    <span className="quick-action-label">{canRelease ? 'Claim' : 'Locked'}</span>
                                </button>
                            )}
                            <button className="quick-action-btn" onClick={() => copyToClipboard(vaultAddress)}>
                                <div className="quick-action-circle copy">
                                    <Copy className="quick-action-icon" />
                                </div>
                                <span className="quick-action-label">Copy Addr</span>
                            </button>
                            <button className="quick-action-btn" onClick={handleManualScan} disabled={uiStatus.loading}>
                                <div className="quick-action-circle scan">
                                    <Search className="quick-action-icon" />
                                </div>
                                <span className="quick-action-label">Scan</span>
                            </button>
                        </div>

                        {isBeneficiary && canRelease && !vaultState.released && (
                            <div className="claim-banner">
                                <div className="claim-banner-left">
                                    <Bell className="claim-bell-icon" />
                                    <div className="claim-banner-text">
                                        <span className="claim-banner-title">Inheritance Ready</span>
                                        <span className="claim-banner-sub">Timer expired — claim your funds</span>
                                    </div>
                                </div>
                                <button className="claim-banner-btn" onClick={() => handleClaim(selectedVaultId, loadVaultState)} disabled={uiStatus.loading}>
                                    {uiStatus.loading ? <RefreshCw className="spinning claim-banner-btn-icon" /> : <Unlock className="claim-banner-btn-icon" />}
                                    <span>Claim Now</span>
                                </button>
                            </div>
                        )}

                        <div className="dashboard-content">
                            <div className="section-header">
                                <CreditCard className="section-header-icon" />
                                <span>Virtual Trust Card</span>
                            </div>
                            <div className="section-card">
                                <div className="card-tab-showcase">
                                    <div
                                        className="card-tab-image-wrap"
                                        onMouseMove={handleMouseMove}
                                        onMouseLeave={resetTilt}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={resetTilt}
                                    >
                                        <div
                                            className="card-tab-inner"
                                            style={{
                                                '--rotateX': `${tilt.x}deg`,
                                                '--rotateY': `${tilt.y}deg`
                                            } as any}
                                        >
                                            <div className="card-tab-reflection" />
                                            <img src="/trustvault-card.png" alt="TrustVault Virtual Card" className="card-tab-image" />
                                        </div>
                                    </div>
                                    <div className="card-tab-info">
                                        <div className="card-tab-info-row">
                                            <span className="card-tab-info-label">Card Holder</span>
                                            <span className="card-tab-info-value">{walletAddress ? formatAddr(walletAddress) : '-'}</span>
                                        </div>
                                        <div className="card-tab-info-row">
                                            <span className="card-tab-info-label">Network</span>
                                            <span className="card-tab-info-value" style={{ color: currentChain.color }}>{currentChain.name}</span>
                                        </div>
                                        <div className="card-tab-info-row">
                                            <span className="card-tab-info-label">Vault Status</span>
                                            <span className={`card-tab-info-value ${vaultState.released ? 'text-red' : 'text-green'}`}>
                                                {vaultState.released ? 'Inactive' : 'Active'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="section-header">
                                <Timer className="section-header-icon" />
                                <span>Heartbeat Countdown</span>
                            </div>
                            <div className="section-card">
                                <div className="countdown-section">
                                    <Countdown lastHeartbeat={vaultState.lastHeartbeat} lockDuration={vaultState.lockDuration} released={vaultState.released} />
                                </div>
                            </div>

                            <div className="section-header">
                                <FileText className="section-header-icon" />
                                <span>Vault Configuration</span>
                            </div>
                            <div className="section-card" style={{ padding: '0 16px' }}>
                                <div className="detail-list">
                                    <div className="detail-item">
                                        <span className="detail-label">Vault Address</span>
                                        <div className="detail-value-row">
                                            <span className="detail-value mono truncate-text">{formatAddr(vaultAddress)}</span>
                                            <button className="detail-copy" onClick={() => copyToClipboard(vaultAddress)}>
                                                <Copy className="detail-copy-icon" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Beneficiary</span>
                                        <div className="detail-value-row">
                                            <span className="detail-value mono truncate-text">{formatAddr(vaultState.beneficiary)}</span>
                                            <button className="detail-copy" onClick={() => copyToClipboard(vaultState.beneficiary)}>
                                                <Copy className="detail-copy-icon" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Network</span>
                                        <span className="detail-value" style={{ color: currentChain.color }}>{currentChain.name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Last Heartbeat</span>
                                        <span className="detail-value">
                                            {new Date(vaultState.lastHeartbeat * 1000).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Lock Period</span>
                                        <span className="detail-value">
                                            {vaultState.lockDuration >= 86400
                                                ? `${Math.floor(vaultState.lockDuration / 86400)}d ${Math.floor((vaultState.lockDuration % 86400) / 3600)}h`
                                                : vaultState.lockDuration >= 3600
                                                    ? `${Math.floor(vaultState.lockDuration / 3600)}h ${Math.floor((vaultState.lockDuration % 3600) / 60)}m`
                                                    : `${Math.floor(vaultState.lockDuration / 60)}m ${vaultState.lockDuration % 60}s`
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="wallet-empty">
                        <div className="wallet-empty-icon-wrap">
                            <Shield className="wallet-empty-icon" />
                        </div>
                        <h3 className="wallet-empty-title">No Vault on {currentChain.name}</h3>
                        <p className="wallet-empty-desc">Create a new vault or scan {currentChain.name} network to find your vaults.</p>
                        <div className="wallet-empty-actions">
                            <button className="wallet-empty-btn primary" onClick={() => setShowCreateForm(true)}>
                                <Plus className="wallet-empty-btn-icon" />
                                Create Vault
                            </button>
                            <button className="wallet-empty-btn secondary" onClick={handleManualScan} disabled={uiStatus.loading}>
                                <Search className="wallet-empty-btn-icon" />
                                Scan Network
                            </button>
                        </div>
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
        </div>
    )
}
