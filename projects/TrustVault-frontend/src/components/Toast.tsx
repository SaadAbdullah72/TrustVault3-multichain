import React, { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, X, Info } from 'lucide-react'

export type ToastType = 'error' | 'success' | 'info'

interface ToastProps {
    message: string
    type: ToastType
    onClose: () => void
    duration?: number
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => setIsVisible(true))
        
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
        }, duration)

        return () => clearTimeout(timer)
    }, [duration, onClose])

    const colors = {
        error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', icon: '#ef4444' },
        success: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', icon: '#10b981' },
        info: { bg: 'rgba(255, 255, 255, 0.1)', border: 'rgba(255, 255, 255, 0.2)', icon: '#fff' }
    }

    const c = colors[type]
    const Icon = type === 'error' ? AlertCircle : type === 'success' ? CheckCircle : Info

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: `translateX(-50%) translateY(${isVisible ? '0' : '-20px'})`,
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.3s ease',
            zIndex: 9999,
            maxWidth: '420px',
            width: '90%',
            background: c.bg,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${c.border}`,
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
            <Icon size={20} color={c.icon} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>
                {message}
            </span>
            <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300) }} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px', flexShrink: 0 }}>
                <X size={16} />
            </button>
        </div>
    )
}

// Toast container for multiple toasts
interface ToastItem {
    id: number
    message: string
    type: ToastType
}

let toastId = 0

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const showToast = (message: string, type: ToastType = 'info') => {
        const id = ++toastId
        setToasts(prev => [...prev, { id, message, type }])
    }

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    const ToastContainer = () => (
        <>
            {toasts.map((toast, index) => (
                <div key={toast.id} style={{ position: 'fixed', top: `${20 + index * 80}px`, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, width: '90%', maxWidth: '420px' }}>
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </>
    )

    return { showToast, ToastContainer }
}

export default Toast
