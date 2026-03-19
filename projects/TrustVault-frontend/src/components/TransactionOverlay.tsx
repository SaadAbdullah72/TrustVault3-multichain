import React from 'react'
import { RefreshCw, Wallet, X } from 'lucide-react'
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
    let walletAppUrl = 'pera://'
    
    if (isEVM) {
        walletName = 'MetaMask'
        walletAppUrl = 'metamask://'
    } else if (isSolana) {
        walletName = 'Phantom / Solflare'
        walletAppUrl = 'https://phantom.app/' // Fallback to site if deep link not available
    }
    
    const walletMessage = `Please check your ${walletName} to sign and proceed.`

    return (
        <div className="wallet-overlay">
            <div className="overlay-card">
                <div className="overlay-spinner">
                    <RefreshCw className="spinning overlay-icon" />
                </div>
                <h3>{txId?.includes('Step') ? 'Vault Action' : 'Waiting for Wallet'}</h3>
                <p>{txId ? txId : walletMessage}</p>

                <div className="overlay-actions">
                    <button className="overlay-btn primary" onClick={() => {
                        // For EVM on desktop, MetaMask usually pops up automatically via extension.
                        // On mobile, deep linking helps.
                        if (typeof window !== 'undefined') window.location.href = walletAppUrl
                    }}>
                        <Wallet size={16} />
                        <span>Open {walletName}</span>
                    </button>
                    <button className="overlay-btn secondary" onClick={onCancel}>
                        <X size={16} />
                        <span>Cancel Request</span>
                    </button>
                </div>

                <div className="overlay-hint">
                    If {walletName} doesn't open automatically, use the button above or check your browser extensions.
                </div>
            </div>
        </div>
    )
}

export default TransactionOverlay
