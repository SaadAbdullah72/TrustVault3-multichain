import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import {
    fetchVaultState,
    getAppAddress,
    VaultState,
    algodClient,
    discoverVaults,
    deployVault,
    callHeartbeat,
    callAutoRelease,
    callWithdraw,
    VAULT_NOTE_PREFIX
} from '../utils/algorand'
import Countdown from '../components/Countdown'
import VaultStatus from '../components/VaultStatus'
import algosdk from 'algosdk'
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
    AlertTriangle,
    CheckCircle,
    LogOut,
    ChevronDown,
    ArrowRight,
    Zap
} from 'lucide-react'

export default function VaultPage() {
    const { activeAddress, wallets, transactionSigner } = useWallet()

    // Selection state
    const [selectedAppId, setSelectedAppId] = useState<bigint | null>(null)
    const [userVaults, setUserVaults] = useState<bigint[]>([])

    // Load from cache on connection
    useEffect(() => {
        if (activeAddress && typeof window !== 'undefined') {
            const cached = localStorage.getItem(`trustvault_ids_${activeAddress}`)
            if (cached) {
                try {
                    const ids = JSON.parse(cached).map((id: string) => BigInt(id))
                    setUserVaults(ids)
                    if (ids.length > 0) setSelectedAppId(ids[0])
                } catch (e) {
                    console.error('Failed to parse cached vaults:', e)
                }
            } else {
                setUserVaults([])
            }
        }
    }, [activeAddress])

    // UI state
    const [vaultState, setVaultState] = useState<VaultState | null>(null)
    const [loading, setLoading] = useState(false)
    const [discovering, setDiscovering] = useState(false)
    const [error, setError] = useState('')
    const [txId, setTxId] = useState('')

    // Form state
    const [beneficiaryInput, setBeneficiaryInput] = useState('')
    const [lockDurationInput, setLockDurationInput] = useState('60')
    const [depositInput, setDepositInput] = useState('1')
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [importIdInput, setImportIdInput] = useState('')
    const [showImportForm, setShowImportForm] = useState(false)

    // Load available vaults
    const loadUserVaults = useCallback(async () => {
        if (!activeAddress) return
        setDiscovering(true)
        try {
            const ids = await discoverVaults(activeAddress)
            setUserVaults(ids)
            // Cache results
            localStorage.setItem(`trustvault_ids_${activeAddress}`, JSON.stringify(ids.map(id => id.toString())))

            if (ids.length > 0 && selectedAppId === null) {
                setSelectedAppId(ids[0])
            }
        } catch (e) {
            console.error('Discovery error', e)
        } finally {
            setDiscovering(false)
        }
    }, [activeAddress, selectedAppId])

    // Load state for selected vault
    const loadVaultState = useCallback(async () => {
        if (selectedAppId === null) return
        try {
            const state = await fetchVaultState(selectedAppId)
            setVaultState(state)
        } catch (e) {
            console.error('State load error', e)
        }
    }, [selectedAppId])

    // Disconnect helper
    const startDisconnect = async (wallet: any) => {
        if (wallet) await wallet.disconnect()
        setSelectedAppId(null)
        setUserVaults([])
    }

    const handleCreateVault = async () => {
        if (!activeAddress) return
        if (!beneficiaryInput || !lockDurationInput || !depositInput) {
            setError('Please fill all fields')
            return
        }

        setLoading(true)
        setError('')
        try {
            const appId = await deployVault(activeAddress, transactionSigner)
            if (!appId) throw new Error('Deployment failed')

            setTxId('Vault Created! Finalizing setup (4s)...')
            await new Promise(resolve => setTimeout(resolve, 4000))

            const appAddress = getAppAddress(appId)
            const suggestedParams = await algodClient.getTransactionParams().do()
            const method = new algosdk.ABIMethod({
                name: 'bootstrap',
                args: [{ name: 'beneficiary', type: 'address' }, { name: 'lock_duration', type: 'uint64' }],
                returns: { type: 'void' }
            })

            const encodedNote = new TextEncoder().encode(VAULT_NOTE_PREFIX + beneficiaryInput.trim())
            const atc = new algosdk.AtomicTransactionComposer()

            Object.defineProperty(atc, 'addMethodCall', { value: (atc as any).addMethodCall, writable: true })
                ; (atc as any).addMethodCall({
                    appID: appId,
                    method: method,
                    sender: activeAddress,
                    suggestedParams: { ...suggestedParams, flatFee: true, fee: 1000 },
                    signer: transactionSigner,
                    methodArgs: [beneficiaryInput.trim(), BigInt(lockDurationInput)],
                    accounts: [beneficiaryInput.trim()],
                    note: encodedNote
                })

            const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                sender: activeAddress,
                receiver: appAddress,
                amount: Math.round(parseFloat(depositInput) * 1_000_000),
                suggestedParams: suggestedParams,
            })
            atc.addTransaction({ txn: payTxn, signer: transactionSigner })

            await atc.execute(algodClient, 4)
            setSelectedAppId(appId)
            await loadUserVaults()
            setShowCreateForm(false)
            setTxId('Vault successfully established and funded!')
        } catch (e: any) {
            setError(e.message || 'Creation failed')
        } finally {
            setLoading(false)
        }
    }

    const handleImportVault = async () => {
        if (!importIdInput) return
        try {
            const id = BigInt(importIdInput)
            if (!userVaults.includes(id)) {
                setUserVaults(prev => [...prev, id])
                localStorage.setItem(`trustvault_ids_${activeAddress}`, JSON.stringify([...userVaults, id].map(i => i.toString())))
            }
            setSelectedAppId(id)
            setShowImportForm(false)
            setImportIdInput('')
            setTxId('Vault Imported!')
        } catch (e) {
            setError('Invalid App ID')
        }
    }

    const handleHeartbeat = async () => {
        if (!activeAddress || !selectedAppId) return
        setLoading(true)
        setError('')
        try {
            const id = await callHeartbeat(selectedAppId, activeAddress, transactionSigner)
            setTxId(`Heartbeat confirmed! TX: ${id}`)
            await loadVaultState()
        } catch (e: any) {
            setError(e.message || 'Heartbeat failed')
        } finally {
            setLoading(false)
        }
    }

    const handleClaim = async () => {
        if (!activeAddress || !selectedAppId) return
        setLoading(true)
        setError('')
        try {
            const id = await callAutoRelease(selectedAppId, activeAddress, transactionSigner)
            setTxId(`Inheritance claimed! TX: ${id}`)
            await loadVaultState()
        } catch (e: any) {
            setError(e.message || 'Claim failed')
        } finally {
            setLoading(false)
        }
    }

    const handleWithdraw = async () => {
        if (!activeAddress || !selectedAppId) return
        const amountStr = window.prompt('Enter amount to withdraw (ALGO):')
        if (!amountStr) return

        const amount = parseFloat(amountStr)
        if (isNaN(amount) || amount <= 0) {
            setError('Invalid amount')
            return
        }

        setLoading(true)
        setError('')
        try {
            const id = await callWithdraw(selectedAppId, amount, activeAddress, transactionSigner)
            setTxId(`Funds Withdrawn! TX: ${id}`)
            await loadVaultState()
        } catch (e: any) {
            setError(e.message || 'Withdrawal failed')
        } finally {
            setLoading(false)
        }
    }

    const handleScanForClaims = async () => {
        if (!activeAddress) return
        setLoading(true)
        setTxId('Searching for vaults...')
        setError('')
        try {
            const ids = await discoverVaults(activeAddress)
            if (ids.length > 0) {
                const unique = Array.from(new Set([...userVaults, ...ids]))
                setUserVaults(unique)
                localStorage.setItem(`trustvault_ids_${activeAddress}`, JSON.stringify(unique.map(i => i.toString())))
                setSelectedAppId(ids[0])
                setTxId(`Scan complete! Found ${ids.length} vault(s).`)
            } else {
                setTxId('No vaults found.')
            }
        } catch (e: any) {
            setError(e.message || 'Scan failed')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (activeAddress) loadUserVaults()
    }, [activeAddress, loadUserVaults])

    useEffect(() => {
        if (selectedAppId) {
            loadVaultState()
            const interval = setInterval(loadVaultState, 5000)
            return () => clearInterval(interval)
        } else {
            setVaultState(null)
            return undefined
        }
    }, [selectedAppId, loadVaultState])

    const isOwner = activeAddress && String(vaultState?.owner || '').toUpperCase() === activeAddress.toUpperCase()
    const isBeneficiary = activeAddress && String(vaultState?.beneficiary || '').toUpperCase() === activeAddress.toUpperCase()
    const now = Math.floor(Date.now() / 1000)
    const canRelease = !!(vaultState && !vaultState.released && (now >= (vaultState.lastHeartbeat || 0) + (vaultState.lockDuration || 0)))
    const isExpired = !!(vaultState && !vaultState.released && (now >= (vaultState.lastHeartbeat || 0) + (vaultState.lockDuration || 0)))

    return (
        <div className="premium-bg min-h-screen text-slate-100 font-['Outfit',sans-serif] selection:bg-violet-500/30 overflow-x-hidden">
            {/* Header */}
            <div className="glass-premium sticky top-0 z-50 px-6 py-4 mb-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="relative w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                            <div className="absolute inset-0 bg-violet-500/20 rounded-xl blur-lg group-hover:bg-violet-500/40 transition-all"></div>
                            <Shield className="w-10 h-10 text-violet-400 fill-violet-500/10 stroke-[1.5] drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                            <div className="absolute bottom-0 right-0">
                                <CheckCircle className="w-4 h-4 text-emerald-400 fill-emerald-950 stroke-2" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 glow-text flex items-center gap-2">
                                TRUSTVAULT
                                <span className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-300 font-bold tracking-widest shadow-[0_0_10px_rgba(139,92,246,0.2)]">PRO</span>
                            </h1>
                        </div>
                    </div>

                    {activeAddress ? (
                        <div className="flex items-center gap-4 bg-slate-950/40 p-1.5 pr-5 rounded-full border border-white/5 backdrop-blur-md shadow-xl hover:border-violet-500/30 transition-colors group">
                            <div className="relative w-10 h-10">
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping opacity-20"></div>
                                <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                    <Wallet className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                            </div>
                            <div className="text-right">
                                <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold group-hover:text-emerald-400 transition-colors">Connected</div>
                                <div className="text-sm text-white font-mono font-bold leading-none tracking-wide text-shadow-sm">{activeAddress.slice(0, 4)}...{activeAddress.slice(-4)}</div>
                            </div>
                            <button onClick={() => startDisconnect(wallets.find(w => w.isActive))} className="ml-2 p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-300">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => wallets[0]?.connect()} className="px-8 py-3 bg-white text-slate-950 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2">
                            <Wallet className="w-5 h-5" />
                            <span>Connect Wallet</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6">
                {!activeAddress ? (
                    <div className="relative z-10">
                        {/* Landing Page Snake Border */}
                        <div className="snake-border p-[2px] rounded-[3rem] shadow-[0_0_100px_rgba(139,92,246,0.3)] bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-md">
                            <div className="snake-border-left"></div>
                            <div className="snake-border-bottom"></div>
                            <div className="bg-[#020617]/80 rounded-[2.9rem] p-12 md:p-24 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-[url('/src/assets/bg-premium.jpg')] opacity-40 bg-cover bg-center pointer-events-none mix-blend-overlay"></div>
                                <div className="w-24 h-24 mb-8 mx-auto relative group">
                                    <div className="absolute inset-0 bg-violet-500/30 blur-[40px] rounded-full group-hover:bg-violet-500/50 transition-all duration-500"></div>
                                    <Shield className="w-full h-full text-white drop-shadow-[0_0_30px_rgba(139,92,246,0.6)] animate-pulse" strokeWidth={1} />
                                </div>
                                <h2 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 drop-shadow-sm">
                                    Secure Legacy
                                </h2>
                                <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-12 leading-relaxed font-light">
                                    Autonomous inheritance protocol secured by the Algorand blockchain.
                                    <br /><span className="text-emerald-400 font-medium flex items-center justify-center gap-2 mt-2"><CheckCircle className="w-4 h-4" /> Zero-Trust Architecture</span>
                                </p>
                                <button onClick={() => wallets[0]?.connect()} className="group relative px-12 py-6 bg-violet-600 text-white rounded-2xl font-black text-xl overflow-hidden transition-all hover:scale-105 shadow-[0_0_50px_rgba(139,92,246,0.4)] border border-violet-400/50">
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-100 group-hover:opacity-90 transition-opacity"></div>
                                    <div className="relative z-10 flex items-center gap-3">
                                        <span>INITIALIZE PROTOCOL</span>
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Control Bar */}
                        <div className="glass-premium p-4 rounded-3xl mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex flex-wrap items-end gap-3 w-full md:w-auto">
                                {userVaults.length > 0 && (
                                    <div className="flex flex-col gap-2 min-w-[260px]">
                                        <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest px-1 flex items-center gap-1"><Lock className="w-3 h-3" /> Selected Vault</label>
                                        <div className="relative">
                                            <select value={selectedAppId?.toString() || ''} onChange={(e) => setSelectedAppId(BigInt(e.target.value))} className="appearance-none bg-slate-950/60 text-white pl-5 pr-10 py-3.5 rounded-xl border border-white/10 outline-none focus:border-violet-500/50 w-full hover:bg-slate-900 transition-colors cursor-pointer font-mono shadow-inner">
                                                {userVaults.map(id => <option key={id.toString()} value={id.toString()}>VAULT ID #{id.toString()}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none w-4 h-4" />
                                        </div>
                                    </div>
                                )}
                                <button onClick={handleScanForClaims} disabled={loading || discovering} className="px-6 py-3.5 bg-violet-500/10 text-violet-300 hover:bg-violet-500 hover:text-white border border-violet-500/20 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-3 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                                    {loading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
                                    <span>SCAN NETWORK</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button onClick={() => { setShowImportForm(!showImportForm); setShowCreateForm(false) }} className={`flex-1 md:flex-none px-6 py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${showImportForm ? 'bg-slate-700 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500'}`}>
                                    {showImportForm ? <X className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                    <span>{showImportForm ? 'CLOSE' : 'IMPORT'}</span>
                                </button>
                                <button onClick={() => { setShowCreateForm(!showCreateForm); setShowImportForm(false) }} className={`flex-1 md:flex-none px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${showCreateForm ? 'bg-slate-700 text-white' : 'bg-white text-slate-950 hover:bg-slate-200'}`}>
                                    {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    <span>{showCreateForm ? 'CLOSE' : 'NEW VAULT'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Forms */}
                        {(showImportForm || showCreateForm) && (
                            <div className="mb-12 glass-premium p-8 rounded-[2rem] border border-white/5 relative overflow-hidden backdrop-blur-2xl">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>
                                {showImportForm && (
                                    <div className="animate-in fade-in zoom-in-95">
                                        <h3 className="text-xl font-black mb-6 text-white flex items-center gap-2"><Search className="w-6 h-6 text-violet-400" /> IMPORT EXISTING VAULT</h3>
                                        <div className="flex gap-4">
                                            <input value={importIdInput} onChange={(e) => setImportIdInput(e.target.value)} placeholder="Enter Application ID" className="flex-1 bg-slate-950/50 px-6 py-4 rounded-2xl border border-white/10 outline-none text-white font-mono text-lg focus:border-violet-500/50 transition-colors" />
                                            <button onClick={handleImportVault} className="px-10 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl shadow-xl transition-all hover:shadow-violet-600/20">IMPORT</button>
                                        </div>
                                    </div>
                                )}
                                {showCreateForm && (
                                    <div className="animate-in fade-in zoom-in-95">
                                        <h3 className="text-2xl font-black mb-8 text-white flex items-center gap-3"><Shield className="w-8 h-8 text-emerald-400" /> CONFIGURE NEW VAULT</h3>
                                        <div className="space-y-8">
                                            <div><label className="block text-xs font-black text-slate-400 uppercase mb-3 ml-1 flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Designated Beneficiary Wallet</label><input value={beneficiaryInput} onChange={(e) => setBeneficiaryInput(e.target.value)} className="w-full bg-slate-950/50 px-6 py-4 rounded-2xl border border-white/10 outline-none font-mono text-emerald-400 focus:border-emerald-500/50 transition-colors shadow-inner" placeholder="ADDR..." /></div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div><label className="block text-xs font-black text-slate-400 uppercase mb-3 ml-1 flex items-center gap-2"><Clock className="w-3 h-3" /> Inactivity Timer (Seconds)</label><input type="number" value={lockDurationInput} onChange={(e) => setLockDurationInput(e.target.value)} className="w-full bg-slate-950/50 px-6 py-4 rounded-2xl border border-white/10 outline-none focus:border-emerald-500/50 text-white font-bold" /></div>
                                                <div><label className="block text-xs font-black text-slate-400 uppercase mb-3 ml-1 flex items-center gap-2"><Wallet className="w-3 h-3" /> Initial Deposit (ALGO)</label><input type="number" value={depositInput} onChange={(e) => setDepositInput(e.target.value)} className="w-full bg-slate-950/50 px-6 py-4 rounded-2xl border border-white/10 outline-none focus:border-emerald-500/50 text-white font-bold" /></div>
                                            </div>
                                            <button onClick={handleCreateVault} disabled={loading} className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-all relative overflow-hidden group flex items-center justify-center gap-3">
                                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                                <Shield className="w-5 h-5" />
                                                <span>{loading ? 'DEPLOYING CONTRACT...' : 'DEPLOY & FUND VAULT'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {discovering ? (
                            <div className="flex flex-col items-center py-32 animate-pulse">
                                <div className="relative w-24 h-24 mb-8">
                                    <div className="absolute inset-0 border-4 border-violet-500/30 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-t-violet-500 rounded-full animate-spin"></div>
                                    <Search className="absolute inset-0 m-auto w-8 h-8 text-violet-400" />
                                </div>
                                <div className="text-lg font-bold text-violet-300 tracking-widest uppercase">Synchronizing with Blockchain</div>
                            </div>
                        ) : selectedAppId && vaultState ? (
                            <div className="relative animate-in fade-in slide-in-from-bottom-8 duration-700">
                                {/* Snake Border Wrapper */}
                                <div className="snake-border p-[2px] rounded-[2.5rem] shadow-[0_0_60px_rgba(139,92,246,0.1)] bg-slate-900/50">
                                    <div className="snake-border-left"></div>
                                    <div className="snake-border-bottom"></div>
                                    <div className="bg-[#0b101e]/90 backdrop-blur-3xl rounded-[2.4rem] p-8 md:p-12 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 blur-[100px] rounded-full pointer-events-none"></div>
                                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none"></div>

                                        {/* Vault Content */}
                                        <div className="relative z-10 space-y-12">
                                            <div className="flex justify-between items-start border-b border-white/5 pb-8">
                                                <div className="space-y-4">
                                                    <VaultStatus released={vaultState.released || false} />
                                                    <div className="flex gap-3">
                                                        {isOwner && <span className="px-3 py-1 bg-blue-500/10 text-blue-300 text-[10px] font-black border border-blue-500/20 rounded-full tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.1)] flex items-center gap-1"><Shield className="w-3 h-3" /> OWNER ACCESS</span>}
                                                        {isBeneficiary && <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 text-[10px] font-black border border-emerald-500/20 rounded-full tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.1)] flex items-center gap-1"><Wallet className="w-3 h-3" /> BENEFICIARY</span>}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 flex items-center justify-end gap-1"><Activity className="w-3 h-3" /> Protocol ID</div>
                                                    <div className="text-3xl font-mono text-white font-bold drop-shadow-md tracking-tight">#{selectedAppId?.toString()}</div>
                                                </div>
                                            </div>

                                            <div className="py-8 relative">
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 opacity-50 pointer-events-none"></div>
                                                <Countdown lastHeartbeat={vaultState.lastHeartbeat} lockDuration={vaultState.lockDuration} released={vaultState.released} />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {isOwner && !vaultState.released && (
                                                    <>
                                                        <button onClick={handleHeartbeat} disabled={loading || isExpired} className={`group relative py-6 rounded-2xl font-black text-lg transition-all shadow-xl hover-glow overflow-hidden ${isExpired ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
                                                            <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500"></div>
                                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                                <Activity className="w-5 h-5 animate-pulse" />
                                                                {loading ? 'SIGNALING...' : isExpired ? 'CONNECTION LOST' : 'TRANSMIT HEARTBEAT'}
                                                            </span>
                                                        </button>
                                                        <button onClick={handleWithdraw} disabled={loading} className="group py-6 bg-slate-800/50 hover:bg-slate-800 text-white rounded-2xl font-black text-lg transition-all shadow-lg border border-white/10 hover:border-violet-500/50 hover-glow flex items-center justify-center gap-2">
                                                            <Wallet className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                                                            WITHDRAW FUNDS
                                                        </button>
                                                    </>
                                                )}
                                                {isBeneficiary && !vaultState.released && (
                                                    <button onClick={handleClaim} disabled={loading || !canRelease} className={`col-span-2 py-6 rounded-2xl font-black text-xl transition-all shadow-xl hover-glow flex items-center justify-center gap-3 ${canRelease ? 'bg-gradient-to-r from-red-500 to-rose-600 animate-pulse' : 'bg-slate-800 text-slate-500 opacity-50'}`}>
                                                        {loading ? 'EXECUTING CONTRACT...' : canRelease ? <><Unlock className="w-6 h-6" /> UNLOCK VAULT FUNDS</> : <><Lock className="w-6 h-6" /> LOCKED (TIMER ACTIVE)</>}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
                                                <div className="p-6 bg-slate-950/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                                    <div className="text-[10px] text-slate-500 font-black mb-2 uppercase tracking-widest flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Target Wallet</div>
                                                    <div className="text-sm font-mono text-slate-300 truncate opacity-80">{vaultState.beneficiary}</div>
                                                </div>
                                                <div className="p-6 bg-slate-950/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                                    <div className="text-[10px] text-slate-500 font-black mb-2 uppercase tracking-widest flex items-center gap-2"><Clock className="w-3 h-3" /> Release Timer</div>
                                                    <div className="text-xl font-black text-slate-300 flex items-center gap-2">
                                                        <span className="text-violet-500"><Clock className="w-5 h-5" /></span> {Math.floor(vaultState.lockDuration / 60)} Mins
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-32 border border-dashed border-white/10 rounded-[3rem] bg-slate-900/40 backdrop-blur-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-violet-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                                        <Shield className="w-10 h-10 text-slate-500 group-hover:text-violet-400 transition-colors" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Ready to Secure Assets</h3>
                                    <p className="text-slate-500 text-sm max-w-md mx-auto">Select a vault from the menu or scan the network to find assets linked to your identity.</p>
                                </div>
                            </div>
                        )}

                        {/* Status Display */}
                        {(txId || error) && (
                            <div className={`mt-8 p-6 rounded-2xl text-center font-bold border backdrop-blur-md shadow-2xl animate-in slide-in-from-bottom-4 flex items-center justify-center gap-3 ${error ? 'bg-red-950/60 border-red-500/30 text-red-200' : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-200'}`}>
                                {error ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                                <span>{error || txId}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
