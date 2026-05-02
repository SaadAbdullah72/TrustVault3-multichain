import React from 'react'
import { RefreshCw, Wallet, X, Asterisk } from 'lucide-react'
import { useChain } from '../contexts/ChainContext'

interface TransactionOverlayProps {
    loading: boolean
    txId?: string
    onCancel: () => void
}

export const TransactionOverlay: React.FC<TransactionOverlayProps> = ({ loading, txId, onCancel }) => {
    const { currentChain } = useChain()
    
    if (!loading) return null

    const isEVM = currentChain.type === 'evm'
    const isSolana = currentChain.type === 'solana'
    let walletName = 'Pera Wallet'
    
    if (isEVM) {
        walletName = 'MetaMask'
    } else if (isSolana) {
        walletName = 'Phantom / Solflare'
    }
    
    const walletMessage = `Please check your ${walletName} to sign and proceed.`

    return (
        <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'rgba(0,0,0,0.8)', 
            backdropFilter: 'blur(10px)', 
            zIndex: 2000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '24px' 
        }}>
            <div className="glass-card" style={{ 
                width: '100%', 
                maxWidth: '340px', 
                padding: '32px', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '20px', 
                    background: 'var(--nb-glass)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '24px',
                    border: '1px solid var(--nb-glass-border)'
                }}>
                    <RefreshCw className="spinning" size={24} style={{ color: 'var(--nb-accent)' }} />
                </div>
                
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>
                    {txId?.includes('Step') ? 'Broadcasting...' : 'Sign Transaction'}
                </h3>
                
                <p style={{ fontSize: '13px', color: 'var(--nb-text-dim)', lineHeight: 1.6, marginBottom: '24px' }}>
                    {txId ? txId : walletMessage}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    <button className="nb-btn-primary" style={{ width: '100%', fontSize: '14px' }} onClick={() => onCancel()}>
                        <X size={16} />
                        Cancel Request
                    </button>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5 }}>
                    <Asterisk size={14} />
                    <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px' }}>TRUSTVAULT SECURE</span>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .spinning { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    )
}

export default TransactionOverlay
