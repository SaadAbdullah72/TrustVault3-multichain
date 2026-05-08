import React from 'react'
import { useChain } from '../contexts/ChainContext'
import ChainSwitcher from './ChainSwitcher'

interface ConnectScreenProps {
    onConnect: () => void;
    onContinue?: () => void;
    onDisconnect?: () => void;
    connecting?: boolean;
}

export const ConnectScreen: React.FC<ConnectScreenProps> = ({ onConnect, onContinue, onDisconnect, connecting }) => {
    const { currentChain, isConnected, walletAddress } = useChain()

    const formatAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

    return (
        <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            background: '#0B131E',
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
            {/* Responsive Top Bar */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '16px clamp(16px, 4vw, 24px)', 
                background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                position: 'sticky',
                top: 0,
                zIndex: 150
            }}>
                <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '1px', color: '#94a3b8' }}>NETWORK</span>
                <ChainSwitcher />
            </div>

            {/* Content */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                padding: '20px',
                marginTop: '10px'
            }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', letterSpacing: '-0.5px' }}>
                    My Vault Key
                </h1>
                <p style={{ fontSize: '14px', color: '#8E8E93', textAlign: 'center', maxWidth: '280px', marginBottom: '40px', lineHeight: 1.5 }}>
                    Choose the chain of your choice where you have your assets to continue.
                </p>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ 
                        position: 'absolute', 
                        width: '320px', 
                        height: '320px', 
                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
                        filter: 'blur(50px)'
                    }}></div>
                    <img 
                        src="/device_keys.png" 
                        alt="Vault Keys" 
                        loading="eager"
                        decoding="async"
                        className="fade-in-image"
                        style={{ 
                            width: '240px', 
                            height: 'auto', 
                            zIndex: 1,
                            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))',
                            mixBlendMode: 'screen'
                        }} 
                    />
                </div>

                {/* Show connected wallet address */}
                {isConnected && walletAddress && (
                    <div style={{ 
                        marginTop: '24px', 
                        background: 'rgba(16, 185, 129, 0.05)', 
                        border: '1px solid rgba(16, 185, 129, 0.15)', 
                        borderRadius: '24px', 
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '280px',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.03)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 12px rgba(16, 185, 129, 0.5)' }}></div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', letterSpacing: '0.3px' }}>{formatAddr(walletAddress)}</span>
                                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{currentChain.name}</span>
                            </div>
                        </div>
                        <button 
                            onClick={onDisconnect}
                            style={{ 
                                background: 'rgba(255,255,255,0.06)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
                                borderRadius: '12px', 
                                padding: '8px', 
                                color: '#fff', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}
                            title="Disconnect"
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom */}
            <div style={{ padding: '32px' }}>
                {isConnected ? (
                    <button 
                        onClick={onContinue}
                        style={{ 
                            width: '100%', 
                            padding: '18px', 
                            background: '#FFFFFF', 
                            color: '#000000',
                            fontSize: '16px', 
                            fontWeight: 700, 
                            borderRadius: '24px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(255,255,255,0.1)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span>Continue</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                ) : (
                    <button 
                        onClick={onConnect}
                        disabled={connecting}
                        style={{ 
                            width: '100%', 
                            padding: '18px', 
                            background: '#FFFFFF', 
                            color: '#000000',
                            fontSize: '16px', 
                            fontWeight: 700, 
                            borderRadius: '24px',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(255,255,255,0.1)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {connecting ? (
                            <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: '#000' }}></div>
                        ) : (
                            <span>Connect Wallet</span>
                        )}
                    </button>
                )}
            </div>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .fade-in-image {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}

export default ConnectScreen
