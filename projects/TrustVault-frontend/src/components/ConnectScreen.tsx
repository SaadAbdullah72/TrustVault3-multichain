import React from 'react'
import { useChain } from '../contexts/ChainContext'
import ChainSwitcher from './ChainSwitcher'

interface ConnectScreenProps {
    onConnect: () => void;
    connecting?: boolean;
}

export const ConnectScreen: React.FC<ConnectScreenProps> = ({ onConnect, connecting }) => {
    const { currentChain, isConnected } = useChain()

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
            {/* Top Bar with Chain Switcher */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', position: 'relative' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>NETWORK</span>
                <div style={{ position: 'absolute', right: '16px', top: '12px' }}>
                    <ChainSwitcher />
                </div>
            </div>

            {/* Premium Asset Visual - Keys */}
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
                        style={{ 
                            width: '240px', 
                            height: 'auto', 
                            zIndex: 1,
                            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))'
                        }} 
                    />
                </div>
            </div>

            {/* Bottom Content Area */}
            <div style={{ padding: '32px' }}>
                <button 
                    onClick={onConnect}
                    disabled={connecting}
                    style={{ 
                        width: '100%', 
                        padding: '18px', 
                        background: isConnected ? '#16C784' : '#FFFFFF', 
                        color: isConnected ? '#FFFFFF' : '#000000',
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
                    ) : isConnected ? (
                        <span>Connected</span>
                    ) : (
                        <span>Connect Wallet</span>
                    )}
                </button>
            </div>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}

export default ConnectScreen
