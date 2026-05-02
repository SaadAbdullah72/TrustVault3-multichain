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
    
    const walletMessage = `Awaiting signature from your ${walletName}...`

    return (
        <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'rgba(255,255,255,0.8)', 
            backdropFilter: 'blur(20px)', 
            zIndex: 2000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '24px' 
        }}>
            <div style={{ 
                width: '100%', 
                maxWidth: '340px', 
                padding: '40px 32px', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: '#fff',
                borderRadius: '32px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.1)',
                border: '1px solid #f1f5f9'
            }}>
                <div style={{ 
                    width: '72px', 
                    height: '72px', 
                    borderRadius: '24px', 
                    background: '#f8fafc', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '24px',
                    border: '1px solid #e2e8f0'
                }}>
                    <RefreshCw className="spinning" size={28} color="#38bdf8" />
                </div>
                
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#000', marginBottom: '12px', letterSpacing: '-0.5px' }}>
                    {txId?.includes('Step') ? 'Syncing System' : 'Authorize Action'}
                </h3>
                
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, marginBottom: '32px', fontWeight: 500 }}>
                    {txId ? txId : walletMessage}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    <button className="nb-btn-primary" style={{ width: '100%', background: '#000' }} onClick={() => onCancel()}>
                        <X size={18} />
                        Cancel Request
                    </button>
                </div>

                <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.3 }}>
                    <Asterisk size={14} color="#000" />
                    <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: '#000' }}>TRUSTVAULT SECURE</span>
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
