import React, { useState, useEffect } from 'react'
import {
    Lock,
    Shield,
    Heart,
    Zap,
    Wallet,
    ChevronLeft,
    ChevronRight,
    CreditCard
} from 'lucide-react'

interface ConnectScreenProps {
    onConnect: () => void
    loading: boolean
}

const cardImages = ['/trustvault-card.png', '/trustvault-card-angle.png', '/trustvault-card-back.png']
const cardLabels = ['Front View', 'Angle View', 'Back View']

export const ConnectScreen: React.FC<ConnectScreenProps> = ({ onConnect, loading }) => {
    const [cardSlide, setCardSlide] = useState<number>(0)
    const [cardAutoPlay, setCardAutoPlay] = useState<boolean>(true)

    // Auto-rotate card slider
    useEffect(() => {
        if (!cardAutoPlay) return
        const interval = setInterval(() => {
            setCardSlide((prev: number) => (prev + 1) % cardImages.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [cardAutoPlay])

    const nextSlide = () => setCardSlide((prev) => (prev + 1) % cardImages.length)
    const prevSlide = () => setCardSlide((prev) => (prev - 1 + cardImages.length) % cardImages.length)

    return (
        <div className="wallet-shell">
            <div className="wallet-container wallet-connect-screen">
                {/* Gradient orb background */}
                <div className="connect-orb connect-orb-1" />
                <div className="connect-orb connect-orb-2" />
                <div className="connect-orb connect-orb-3" />

                <div className="connect-content">
                    <div className="connect-logo-wrap">
                        <div className="connect-logo-glow" />
                        <img src="/logo.svg" alt="TrustVault³" className="connect-logo-img" />
                    </div>

                    <h1 className="connect-title">TrustVault<sup className="connect-title-sup">3</sup></h1>
                    <p className="connect-subtitle">Autonomous Inheritance Protocol</p>

                    {/* ====== 3D CREDIT CARD SLIDER ====== */}
                    <div className="card-slider-section">
                        <div className="card-slider-stage"
                            onMouseEnter={() => setCardAutoPlay(false)}
                            onMouseLeave={() => setCardAutoPlay(true)}
                        >
                            {/* Nav arrows */}
                            <button className="card-slider-arrow left" onClick={prevSlide}>
                                <ChevronLeft />
                            </button>
                            <button className="card-slider-arrow right" onClick={nextSlide}>
                                <ChevronRight />
                            </button>

                            {/* Card images */}
                            <div className="card-slider-viewport">
                                <div className="card-slider-glow" />
                                {cardImages.map((src, idx) => (
                                    <img
                                        key={idx}
                                        src={src}
                                        alt={cardLabels[idx]}
                                        className={`card-slider-img ${idx === cardSlide ? 'active' : idx === (cardSlide - 1 + cardImages.length) % cardImages.length ? 'prev' : idx === (cardSlide + 1) % cardImages.length ? 'next' : 'hidden'}`}
                                    />
                                ))}
                            </div>

                            {/* Dots */}
                            <div className="card-slider-dots">
                                {cardImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        className={`card-slider-dot ${idx === cardSlide ? 'active' : ''}`}
                                        onClick={() => setCardSlide(idx)}
                                    />
                                ))}
                            </div>
                            <span className="card-slider-label">{cardLabels[cardSlide]}</span>
                        </div>
                        <div className="card-promo-badge">
                            <CreditCard className="card-promo-badge-icon" />
                            <span>Virtual Card Included</span>
                        </div>
                    </div>

                    <div className="connect-features">
                        <div className="connect-feature">
                            <Lock className="connect-feature-icon" />
                            <span>Secure Vaults</span>
                        </div>
                        <div className="connect-feature">
                            <Heart className="connect-feature-icon" />
                            <span>Heartbeat Timer</span>
                        </div>
                        <div className="connect-feature">
                            <Zap className="connect-feature-icon" />
                            <span>Auto Release</span>
                        </div>
                    </div>

                    <button
                        onClick={onConnect}
                        className="connect-btn"
                        disabled={loading}
                    >
                        <Wallet className="connect-btn-icon" />
                        <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
                    </button>

                    <p className="connect-footer">
                        Secured by Algorand Blockchain
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ConnectScreen
