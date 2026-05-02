import React from 'react'
import { Asterisk } from 'lucide-react'
import { useChain } from '../contexts/ChainContext'

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
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <Asterisk size={48} strokeWidth={1.5} />
                </div>
            </div>

            <div style={{ marginBottom: '48px' }}>
                <h1 className="nb-title" style={{ marginBottom: '16px' }}>
                    TOMORROW'S<br />TRUST IS HERE
                </h1>
                <p className="nb-desc" style={{ maxWidth: '300px' }}>
                    Experience decentralized security reimagined for the digital age — secure, intuitive, and built for your future on {currentChain.name}.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button className="nb-btn-primary" onClick={onConnect}>
                    {connecting ? (
                        <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                    ) : (
                        <span>Become a Vault Owner</span>
                    )}
                </button>
                
                <button className="nb-btn-secondary" onClick={onConnect}>
                    I Am Already a Customer
                </button>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}

export default ConnectScreen
