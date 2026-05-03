import { useEffect, useState } from 'react'
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react'

interface CountdownProps {
    lastHeartbeat: number
    lockDuration: number
    released: boolean
    compact?: boolean
}

export default function Countdown({ lastHeartbeat, lockDuration, released, compact }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState(0)

    useEffect(() => {
        if (released) {
            setTimeLeft(0)
            return
        }

        const updateTimer = () => {
            if (lastHeartbeat === 0) {
                setTimeLeft(lockDuration)
                return
            }
            const now = Math.floor(Date.now() / 1000)
            const unlockTime = lastHeartbeat + lockDuration
            const remaining = unlockTime - now
            setTimeLeft(remaining > 0 ? remaining : 0)
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
    }, [lastHeartbeat, lockDuration, released])

    const total = lockDuration
    const elapsed = total - timeLeft
    const progress = total > 0 ? Math.min((elapsed / total) * 100, 100) : 100

    const formatTime = (seconds: number) => {
        if (compact) {
            const h = Math.floor(seconds / 3600)
            const m = Math.floor((seconds % 3600) / 60)
            const s = seconds % 60
            return `${h}h ${m}m ${s}s`
        }
        
        const months = Math.floor(seconds / (86400 * 30))
        const remainingAfterMonths = seconds % (86400 * 30)
        const days = Math.floor(remainingAfterMonths / 86400)
        const remainingAfterDays = remainingAfterMonths % 86400
        const hours = Math.floor(remainingAfterDays / 3600)
        const mins = Math.floor((remainingAfterDays % 3600) / 60)
        const secs = remainingAfterDays % 60

        let result = ''
        if (months > 0) result += `${months}mo `
        if (days > 0 || months > 0) result += `${days}d `
        result += `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        return result.trim()
    }

    if (compact) {
        return (
            <span style={{ fontSize: '15px', fontWeight: 700, color: timeLeft === 0 ? '#ef4444' : '#fff' }}>
                {released ? '0s' : formatTime(timeLeft)}
            </span>
        )
    }

    const size = 160
    const strokeWidth = 8
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference

    if (released) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                <div style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} />
                        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#22c55e" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={0} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                    </svg>
                    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={32} color="#22c55e" />
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#22c55e', letterSpacing: '1px' }}>RELEASED</span>
                    </div>
                </div>
            </div>
        )
    }

    const isExpired = timeLeft === 0
    const accentColor = isExpired ? '#ef4444' : '#38bdf8'

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '10px 0' }}>
            <div style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} />
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={accentColor} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {lastHeartbeat === 0 ? 'Protocol Ready' : isExpired ? 'Expired' : 'Time Left'}
                    </span>
                    <span style={{ fontSize: '24px', fontWeight: 800, color: isExpired && lastHeartbeat > 0 ? '#ef4444' : '#fff', letterSpacing: '-0.5px' }}>
                        {lastHeartbeat === 0 ? formatTime(lockDuration) : formatTime(timeLeft)}
                    </span>
                </div>
            </div>
        </div>
    )
}
