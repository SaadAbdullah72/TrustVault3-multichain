import React from 'react'
import { Asterisk, ChevronRight, Shield, Lock, ArrowLeft, Wallet } from 'lucide-react'
import { useChain } from '../contexts/ChainContext'
import ChainSwitcher from './ChainSwitcher'

interface ConnectScreenProps {
    onConnect: () => void;
    connecting?: boolean;
}

export const ConnectScreen: React.FC<ConnectScreenProps> = ({ onConnect, connecting }) => {
    const { currentChain, isConnected, walletAddress } = useChain()

    return (
        <div className="connect-screen" style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            background: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Primary Gradient Header */}
            <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                height: '45%', 
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
                marginTop: '10px'
            }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ 
                        position: 'absolute', 
                        width: '320px', 
                        height: '320px', 
                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
                        filter: 'blur(50px)'
                    }}></div>
                    <img 
                        src="/premium_vault_shield_3d_1777732196171.png" 
                        alt="Secure Vault" 
                        style={{ 
                            width: '260px', 
                            height: 'auto', 
                            zIndex: 1,
                            filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.4))'
                        }} 
                    />
                </div>
            </div>

            {/* Bottom Content Area */}
            <div style={{ 
                padding: '40px 32px 64px', 
                background: '#FFFFFF', 
                zIndex: 10,
                borderRadius: '32px 32px 0 0',
                marginTop: '-40px',
                textAlign: 'center',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.08)'
            }}>
                <div style={{ width: '40px', height: '4px', background: '#E5E5EA', borderRadius: '2px', margin: '0 auto 32px' }} />
                
                <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#3B82F6', marginBottom: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Step 02: Access Protocol
                </h2>
                
                <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#1C1C1E', marginBottom: '16px', letterSpacing: '-1.5px', lineHeight: 1 }}>
                    GATEWAY TO <br />{currentChain.name} VAULT
                </h1>
                
                <p style={{ fontSize: '15px', color: '#8E8E93', fontWeight: 500, lineHeight: 1.6, marginBottom: '40px', maxWidth: '320px', margin: '0 auto 40px' }}>
                    Connect your wallet to establish your identity and manage your decentralized inheritance protocol.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <button 
                        className="nb-btn-primary" 
                        onClick={onConnect}
                        disabled={connecting}
                        style={{ width: '100%', padding: '22px', background: isConnected ? '#16C784' : '#3B82F6', fontSize: '18px', fontWeight: 700, borderRadius: '20px' }}
                    >
                        {connecting ? (
                            <div className="spinner" style={{ width: '24px', height: '24px', borderTopColor: '#fff' }}></div>
                        ) : isConnected ? (
                            <>
                                <CheckCircle size={22} />
                                <span>Wallet Connected</span>
                            </>
                        ) : (
                            <>
                                <Wallet size={22} />
                                <span>Connect Wallet</span>
                                <ChevronRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}

const CheckCircle = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
)

export default ConnectScreen
