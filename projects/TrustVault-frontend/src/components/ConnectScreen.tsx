import React from 'react'
import { Asterisk, ChevronRight } from 'lucide-react'
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
            justifyContent: 'flex-end', 
            padding: '40px 32px',
            background: 'radial-gradient(circle at 50% 30%, rgba(56, 189, 248, 0.1) 0%, transparent 60%)'
        }}>
            {/* Top Network Selector */}
            <div style={{ position: 'absolute', top: '32px', right: '32px', zIndex: 10 }}>
                <ChainSwitcher />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '40px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}>
                    <Asterisk size={48} strokeWidth={1.5} />
                </div>
            </div>

            <div style={{ marginBottom: '48px' }}>
                <h1 className="nb-title" style={{ marginBottom: '16px', fontSize: '32px' }}>
                    TOMORROW'S<br />BANKING IS HERE
                </h1>
                <p className="nb-desc" style={{ maxWidth: '300px' }}>
                    Experience decentralized security reimagined for the digital age on <b>{currentChain.name}</b>.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button 
                    className="nb-btn-primary" 
                    onClick={onConnect}
                    disabled={connecting}
                    style={{ position: 'relative', overflow: 'hidden' }}
                >
                    {connecting ? (
                        <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                    ) : (
                        <>
                            <span>Become a Customer</span>
                            <ChevronRight size={18} />
                        </>
                    )}
                </button>
                
                <button className="nb-btn-secondary" onClick={onConnect}>
                    I Am Already a Customer
                </button>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', opacity: 0.3 }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }}></div>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', opacity: 0.5 }}></div>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', opacity: 0.5 }}></div>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}

export default ConnectScreen
