import React from 'react'
import { AlertTriangle, CheckCircle, X } from 'lucide-react'

interface StatusToastProps {
    error?: string
    txId?: string
    onClose: () => void
}

export const StatusToast: React.FC<StatusToastProps> = ({ error, txId, onClose }) => {
    if (!error && !txId) return null

    return (
        <div className={`wallet-toast ${error ? 'error' : 'success'}`}>
            {error ? <AlertTriangle className="toast-icon" /> : <CheckCircle className="toast-icon" />}
            <span className="toast-text">{error || txId}</span>
            <button className="toast-close" onClick={onClose}>
                <X className="toast-close-icon" />
            </button>
        </div>
    )
}

export default StatusToast
