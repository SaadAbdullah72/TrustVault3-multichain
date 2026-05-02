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
    CreditCard,
    Timer,
    Eye,
    EyeOff,
    FileText
} from 'lucide-react'

export default function VaultPage() {
    const { t } = useTranslation()
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
                        <SettingsSwitcher />
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
                <VaultDropdown
                    currentChain={currentChain}
                    userVaults={userVaults}
                    vaultRoles={vaultRoles}
                    selectedVaultId={selectedVaultId}
                    setSelectedVaultId={setSelectedVaultId}
                    adapter={adapter}
                    handleDeleteVaultId={handleDeleteVaultId}
                    isDiscovering={isDiscovering}
                    handleManualScan={handleManualScan}
                    uiStatus={uiStatus}
                    setShowCreateForm={setShowCreateForm}
                    showVaultSelector={showVaultSelector}
                    setShowVaultSelector={setShowVaultSelector}
                    vaultAddress={vaultAddress}
                    walletAddress={walletAddress}
                    copied={copied}
                    copyToClipboard={copyToClipboard}
                    formatAddr={formatAddr}
                />

                {/* ======= NOTIFICATIONS ======= */}
                {claimableVaults.length > 0 && (
                    <div className="claim-notification">
                        <div className="claim-notification-header">
                            <Bell className="claim-bell" />
                            <span className="claim-notification-title">Incoming Inheritance</span>
                            <span className="claim-notification-badge">{claimableVaults.length}</span>
                        </div>
                        {claimableVaults.map((vault) => {
                            const isExpired = !vault.state.released && Date.now() / 1000 >= (vault.state.lastHeartbeat + vault.state.lockDuration)
                            return (
                                <div key={vault.vaultId} className="claim-card">
                                    <div className="claim-card-info">
                                        <div className="claim-card-id-row">
                                            <span className="claim-card-id">Vault #{vault.vaultId.length > 12 ? vault.vaultId.slice(0, 8) + '...' : vault.vaultId}</span>
                                            <span className={`claim-card-status-pill ${isExpired ? 'expired' : 'active'}`}>
                                                {isExpired ? 'Ready to Claim' : 'Incoming'}
                                            </span>
                                        </div>
                                        <span className="claim-card-status">{isExpired ? 'Inactivity timer has expired.' : 'Timer still active.'}</span>
                                    </div>
                                    <div className="claim-card-actions">
                                        <button
                                            onClick={() => { setSelectedVaultId(vault.vaultId); setShowVaultSelector(false) }}
                                            className="claim-card-view-btn"
                                            title="View Vault"
                                        >
                                            <Eye className="claim-card-btn-icon" />
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleClaim(vault.vaultId, loadVaultState)}
                                            disabled={uiStatus.loading || !isExpired}
                                            className={`claim-card-btn ${isExpired ? 'pulse-gold' : 'disabled'}`}
                                            title={isExpired ? 'Claim this vault now' : 'Wait for timer to expire'}
                                        >
                                            <Unlock className="claim-card-btn-icon" />
                                            {uiStatus.loading && selectedVaultId === vault.vaultId ? 'Claiming...' : 'Claim'}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
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
                                        {t('beneficiary_address')}
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
                                            {t('timer_seconds')}
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
                                            {t('deposit')} ({currentChain.nativeCurrency.symbol})
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
                                    <span>{uiStatus.loading ? 'Deploying...' : t('deploy_on', { chain: currentChain.name })}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ======= MAIN CONTENT ======= */}
                {isDiscovering ? (
                    <div className="wallet-loading">
                        <div className="wallet-loading-spinner" />
                        <span className="wallet-loading-text">{t('syncing', { chain: currentChain.name })}</span>
                    </div>
                ) : selectedVaultId && vaultState ? (
                    <div className="wallet-main-content">
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

                        <VaultActions
                            isOwner={isOwner}
                            isBeneficiary={isBeneficiary}
                            isExpired={isExpired}
                            canRelease={canRelease}
                            vaultState={vaultState}
                            uiStatus={uiStatus}
                            selectedVaultId={selectedVaultId}
                            vaultAddress={vaultAddress}
                            handleHeartbeat={handleHeartbeat}
                            handleWithdrawAction={handleWithdrawAction}
                            handleClaim={handleClaim}
                            handleManualScan={handleManualScan}
                            loadVaultState={loadVaultState}
                            copyToClipboard={copyToClipboard}
                        />
                    </div>
                ) : (
                    <div className="wallet-empty">
                        <div className="wallet-empty-icon-wrap">
                            <Shield className="wallet-empty-icon" />
                        </div>
                        <h3 className="wallet-empty-title">{t('no_vault', { chain: currentChain.name })}</h3>
                        <p className="wallet-empty-desc">{t('create_new_vault', { chain: currentChain.name })}</p>
                        <div className="wallet-empty-actions">
                            <button className="wallet-empty-btn primary" onClick={() => setShowCreateForm(true)}>
                                <Plus className="wallet-empty-btn-icon" />
                                {t('create_vault')}
                            </button>
                            <button className="wallet-empty-btn secondary" onClick={handleManualScan} disabled={uiStatus.loading}>
                                <Search className="wallet-empty-btn-icon" />
                                {t('scan')}
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
