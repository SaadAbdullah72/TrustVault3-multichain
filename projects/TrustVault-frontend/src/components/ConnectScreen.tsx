import React from 'react'
import { Asterisk, ChevronRight, Shield, Globe } from 'lucide-react'
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
            {/* Background Accent from Reference */}
            <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '40%', 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                zIndex: 0
            }} />

            {/* Top Network Selector */}
            <div style={{ position: 'absolute', top: '32px', right: '32px', zIndex: 20 }}>
                <ChainSwitcher />
            </div>

            {/* Premium Card Visual like Reference */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                zIndex: 10,
                padding: '40px'
            }}>
                <div style={{ 
                    width: '240px', 
                    height: '340px', 
                    background: 'linear-gradient(145deg, #1e293b, #000)', 
                    borderRadius: '32px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.3)',
                    position: 'relative',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <Asterisk size={120} color="#fff" strokeWidth={1} />
                    <div style={{ position: 'absolute', bottom: '32px', right: '32px', opacity: 0.8 }}>
                        <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700, fontStyle: 'italic' }}>Debit</span>
                    </div>
                    <div style={{ position: 'absolute', bottom: '32px', left: '32px', opacity: 0.4 }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff' }}></div>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', marginLeft: '-10px' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Content Area */}
            <div style={{ 
                padding: '0 32px 48px', 
                background: '#fff', 
                zIndex: 10,
                borderRadius: '40px 40px 0 0',
                marginTop: '-40px',
                textAlign: 'center'
            }}>
                <div style={{ width: '40px', height: '6px', background: '#f1f5f9', borderRadius: '3px', margin: '16px auto 32px' }} />
                
                <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#000', marginBottom: '16px', letterSpacing: '-1.5px', lineHeight: 1.1 }}>
                    SECURE YOUR<br />DIGITAL LEGACY
                </h1>
                
                <p style={{ fontSize: '15px', color: '#64748b', fontWeight: 500, lineHeight: 1.6, marginBottom: '40px', maxWidth: '300px', margin: '0 auto 40px' }}>
                    The world's first decentralized inheritance protocol for <b>{currentChain.name}</b>.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button 
                        className="nb-btn-primary" 
                        onClick={onConnect}
                        disabled={connecting}
                        style={{ width: '100%', padding: '20px' }}
                    >
                        {connecting ? (
                            <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                        ) : (
                            <>
                                <span>Get Started</span>
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>
                    
                    <button className="nb-btn-secondary" style={{ width: '100%', padding: '18px', border: 'none', background: '#f8fafc' }} onClick={onConnect}>
                        Log In to Existing Vault
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
