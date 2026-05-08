import React from 'react'
import { RefreshCw, X, Shield } from 'lucide-react'
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
            position: 'fixed', 
            inset: 0, 
            background: 'rgba(11, 19, 30, 0.9)', 
            backdropFilter: 'blur(20px)', 
            zIndex: 9999, 
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
                background: '#111e2f',
                borderRadius: '32px',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ 
                    width: '72px', 
                    height: '72px', 
                    borderRadius: '24px', 
                    background: 'rgba(255,255,255,0.05)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginBottom: '24px',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <RefreshCw className="spinning" size={28} color="#fff" />
                </div>
                
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '12px', letterSpacing: '-0.5px' }}>
                    {txId?.includes('Step') ? 'Syncing System' : 'Authorize Action'}
                </h3>
                
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px', fontWeight: 500 }}>
                    {txId ? txId : walletMessage}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                    <button style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '16px 24px', borderRadius: '18px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }} onClick={() => onCancel()}>
                        <X size={18} />
                        Cancel
                    </button>
                </div>

                <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.3 }}>
                    <Shield size={14} color="#fff" />
                    <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', color: '#fff' }}>TRUSTVAULT SECURE</span>
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
