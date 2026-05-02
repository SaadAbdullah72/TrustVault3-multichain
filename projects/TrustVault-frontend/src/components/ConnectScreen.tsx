import React from 'react'
import { Asterisk, ChevronRight, Shield, Lock } from 'lucide-react'
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
            background: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Primary Gradient Header (Strictly Following User Config) */}
            <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '42%', 
                background: 'linear-gradient(180deg, #1E3C72 0%, #2A5298 100%)',
                zIndex: 0
            }} />

            {/* Top Network Selector */}
            <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 20 }}>
                <ChainSwitcher />
            </div>

            {/* Premium Asset Visual */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                zIndex: 10,
                padding: '20px',
                marginTop: '20px'
            }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ 
                        position: 'absolute', 
                        width: '300px', 
                        height: '300px', 
                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
                        filter: 'blur(40px)'
                    }}></div>
                    <img 
                        src="/premium_vault_shield_3d_1777732196171.png" 
                        alt="Secure Vault" 
                        style={{ 
                            width: '240px', 
                            height: 'auto', 
                            zIndex: 1,
                            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))'
                        }} 
                    />
                </div>
            </div>

            {/* Bottom Content Area (White Card Feel) */}
            <div style={{ 
                padding: '40px 32px 48px', 
                background: '#FFFFFF', 
                zIndex: 10,
                borderRadius: '32px 32px 0 0',
                marginTop: '-40px',
                textAlign: 'center',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.08)'
            }}>
                <div style={{ width: '44px', height: '5px', background: '#E5E5EA', borderRadius: '3px', margin: '0 auto 32px' }} />
                
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1C1C1E', marginBottom: '16px', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
                    SECURE YOUR<br />DIGITAL LEGACY
                </h1>
                
                <p style={{ fontSize: '15px', color: '#8E8E93', fontWeight: 500, lineHeight: 1.6, marginBottom: '40px', maxWidth: '300px', margin: '0 auto 40px' }}>
                    The world's first decentralized inheritance protocol for <b>{currentChain.name}</b>.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <button 
                        className="nb-btn-primary" 
                        onClick={onConnect}
                        disabled={connecting}
                        style={{ width: '100%', padding: '20px', background: '#3B82F6', fontSize: '17px', fontWeight: 700 }}
                    >
                        {connecting ? (
                            <div className="spinner" style={{ width: '22px', height: '22px', borderTopColor: '#fff' }}></div>
                        ) : (
                            <>
                                <span>Get Started Now</span>
                                <ChevronRight size={20} />
                            </>
                        )}
                    </button>
                    
                    <button 
                        className="nb-btn-secondary" 
                        style={{ width: '100%', padding: '18px', border: 'none', background: '#F2F2F7', color: '#8E8E93', fontWeight: 600 }} 
                        onClick={onConnect}
                    >
                        Access Existing Vault
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}

export default ConnectScreen
