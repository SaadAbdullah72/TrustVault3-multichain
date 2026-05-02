import React, { useState, useEffect } from 'react'
import { useChain } from '../contexts/ChainContext'
import ChainSwitcher from './ChainSwitcher'
import {
    Lock,
    Shield,
    Heart,
    Zap,
    Wallet,
    ChevronLeft,
    ChevronRight,
    CircleDot
} from 'lucide-react'

interface ConnectScreenProps {
    onConnect: () => void
    wallets?: any[]
    loading: boolean
    error?: string
}


export const ConnectScreen: React.FC<ConnectScreenProps> = ({ onConnect, loading, error }) => {


    const { currentChain } = useChain()

    return (
        <div className="wallet-shell">
            <div className="wallet-container wallet-connect-screen">
                {/* ======= TOP NAV BAR FOR CONNECT SCREEN ======= */}
                <div className="wallet-topbar" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, background: 'transparent', borderBottom: 'none' }}>
                    <div className="topbar-left">
                    </div>
                    <div className="topbar-right">
                        <ChainSwitcher />
                        <div className="network-badge" style={{ borderColor: currentChain.color + '44' }}>
                            <CircleDot className="network-dot" style={{ color: currentChain.color }} />
                            <span>Testnet</span>
                        </div>
                    </div>
                </div>

                {/* Gradient orb background */}
                <div className="connect-orb connect-orb-1" />
                <div className="connect-orb connect-orb-2" />
                <div className="connect-orb connect-orb-3" />

                <div className="connect-content" style={{ marginTop: '40px' }}>
                    <div className="connect-logo-wrap">
                        <div className="connect-logo-glow" />
                        <img src="/logo.svg" alt="TrustVault³" className="connect-logo-img" />
                    </div>

                    <h1 className="connect-title">TrustVault<sup className="connect-title-sup">3</sup></h1>
                    <p className="connect-subtitle">Multichain Inheritance Protocol</p>

                    {/* ====== SECURITY VISUALIZATION ====== */}
                    <div className="security-visualization" style={{ 
                        margin: '32px 0', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        position: 'relative',
                        width: '100%'
                    }}>
                        <div className="security-shield-wrap" style={{
                            width: '180px',
                            height: '180px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--stitch-surface-border)',
                            position: 'relative',
                            boxShadow: '0 0 40px rgba(0, 0, 0, 0.2)'
                        }}>
                            <div className="security-shield-glow" style={{
                                position: 'absolute',
                                inset: '10px',
                                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent 70%)',
                                borderRadius: '50%'
                            }} />
                            <Shield size={80} color="var(--stitch-text)" strokeWidth={1.5} />
                            
                            {/* Scanning effect */}
                            <div className="security-scan-line" style={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                right: '0',
                                height: '2px',
                                background: 'linear-gradient(90deg, transparent, var(--stitch-accent), transparent)',
                                animation: 'scanMove 3s ease-in-out infinite'
                            }} />
                        </div>
                        
                        <div className="security-badge" style={{
                            marginTop: '24px',
                            background: 'var(--stitch-surface)',
                            border: '1px solid var(--stitch-surface-border)',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--stitch-text-dim)'
                        }}>
                            <Lock size={14} color="var(--accent-emerald)" />
                            <span>Encrypted Multichain Vaults</span>
                        </div>
                    </div>

                    <div className="connect-features">
                        <div className="connect-feature">
                            <Lock className="connect-feature-icon" />
                            <span>Secure Vaults</span>
                        </div>
                        <div className="connect-feature">
                            <Heart className="connect-feature-icon" />
                            <span>Heartbeat Timer</span>
                        </div>
                        <div className="connect-feature">
                            <Zap className="connect-feature-icon" />
                            <span>Auto Release</span>
                        </div>
                    </div>

                    <button
                        onClick={onConnect}
                        className="connect-btn"
                        disabled={loading}
                    >
                        <Wallet className="connect-btn-icon" />
                        <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
                    </button>

                    {error && <p className="connect-error">{error}</p>}

                    <p className="connect-footer">
                        Secured on 20+ Blockchains
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ConnectScreen
