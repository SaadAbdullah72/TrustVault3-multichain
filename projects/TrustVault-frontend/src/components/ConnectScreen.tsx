import React from 'react'
import { Asterisk, ChevronRight, Shield, Globe, Lock } from 'lucide-react'
import { useChain } from '../contexts/ChainContext'
import ChainSwitcher from './ChainSwitcher'

interface ConnectScreenProps {
    onConnect: () => void;
    connecting?: boolean;
}

export const ConnectScreen: React.FC<ConnectScreenProps> = ({ onConnect, connecting }) => {
    const { currentChain } = useChain()

    return (
        <div className="connect-screen" style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            background: '#fff',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Accent */}
            <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '45%', 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                zIndex: 0
            }} />

            {/* Top Network Selector */}
            <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 20 }}>
                <ChainSwitcher />
            </div>

            {/* Premium Asset Visual (Replaced Debit Card) */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                zIndex: 10,
                padding: '20px'
            }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ 
                        position: 'absolute', 
                        width: '280px', 
                        height: '280px', 
                        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                        animation: 'pulse 4s infinite ease-in-out'
                    }}></div>
                    <img 
                        src="/premium_vault_shield_3d_1777732196171.png" 
                        alt="Secure Vault" 
                        style={{ 
                            width: '260px', 
                            height: 'auto', 
                            zIndex: 1,
                            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))'
                        }} 
                    />
                </div>
            </div>

            {/* Bottom Content Area - Fixed Visibility */}
            <div style={{ 
                padding: '32px 24px 40px', 
                background: '#fff', 
                zIndex: 10,
                borderRadius: '32px 32px 0 0',
                marginTop: '-32px',
                textAlign: 'center',
                boxShadow: '0 -20px 40px rgba(0,0,0,0.05)'
            }}>
                <div style={{ width: '40px', height: '4px', background: '#f1f5f9', borderRadius: '2px', margin: '0 auto 24px' }} />
                
                <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#000', marginBottom: '12px', letterSpacing: '-1px', lineHeight: 1.1 }}>
                    SECURE YOUR<br />DIGITAL LEGACY
                </h1>
                
                <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 500, lineHeight: 1.5, marginBottom: '32px', maxWidth: '280px', margin: '0 auto 32px' }}>
                    The decentralized inheritance protocol for <b>{currentChain.name}</b>.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                        className="nb-btn-primary" 
                        onClick={onConnect}
                        disabled={connecting}
                        style={{ width: '100%', padding: '18px', fontSize: '16px' }}
                    >
                        {connecting ? (
                            <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                        ) : (
                            <>
                                <span>Protect My Assets</span>
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                    
                    <button className="nb-btn-secondary" style={{ width: '100%', padding: '16px', border: 'none', background: '#f8fafc', color: '#64748b' }} onClick={onConnect}>
                        Access Existing Vault
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 0.5; }
                }
            `}</style>
        </div>
    )
}

export default ConnectScreen
