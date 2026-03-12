import React from 'react'
import { RefreshCw, Wallet, X } from 'lucide-react'

interface TransactionOverlayProps {
    loading: boolean
    txId?: string
    onCancel: () => void
}

export const TransactionOverlay: React.FC<TransactionOverlayProps> = ({ loading, txId, onCancel }) => {
    if (!loading) return null

    return (
        <div className="wallet-overlay">
            <div className="overlay-card">
                <div className="overlay-spinner">
                    <RefreshCw className="spinning overlay-icon" />
                </div>
                <h3>{txId?.includes('Step') ? 'Vault Action' : 'Waiting for Wallet'}</h3>
                <p>{txId ? txId : 'Please check your Pera Wallet to sign and proceed.'}</p>

                <div className="overlay-actions">
                    <button className="overlay-btn primary" onClick={() => window.location.href = 'pera://'}>
                        <Wallet size={16} />
                        <span>Open Pera Wallet</span>
                    </button>
                    <button className="overlay-btn secondary" onClick={onCancel}>
                        <X size={16} />
                        <span>Cancel Request</span>
                    </button>
                </div>

                <div className="overlay-hint">
                    If the wallet doesn't open automatically, use the button above.
                </div>
            </div>
        </div>
    )
}

export default TransactionOverlay
