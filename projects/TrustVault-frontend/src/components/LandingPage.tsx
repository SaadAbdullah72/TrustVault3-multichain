import React from 'react'
import { Asterisk, Shield, Lock, ChevronRight, Globe, Zap, Heart, Timer } from 'lucide-react'
import { ChainConfig } from '../config/chains'

interface LandingPageProps {
    onLaunch: () => void;
    currentChain: ChainConfig;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch, currentChain }) => {
    return (
        <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
            {/* Nav */}
            <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f2f2f7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#3B82F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Asterisk size={18} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>TRUSTVAULT</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#8E8E93' }}>Protocol: <span style={{ color: '#1C1C1E' }}>{currentChain.name}</span></div>
                    <button className="nb-btn-primary" onClick={onLaunch} style={{ padding: '10px 24px', fontSize: '14px' }}>
                        Launch App
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="hero-gradient" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '100px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Zap size={14} color="#3B82F6" fill="#3B82F6" />
                        <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>V3.0 MULTICHAIN LIVE</span>
                    </div>
                    
                    <h1 style={{ fontSize: '64px', fontWeight: 900, marginBottom: '24px', lineHeight: 1, letterSpacing: '-3px' }}>
                        The First Digital Legacy <br />
                        Protocol on <span style={{ color: '#3B82F6' }}>{currentChain.name}</span>
                    </h1>
                    
                    <p style={{ fontSize: '20px', opacity: 0.8, marginBottom: '56px', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto 56px' }}>
                        Securely pass your digital assets to your loved ones. A decentralized, non-custodial inheritance solution for the modern web3 world.
                    </p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <button className="nb-btn-primary" onClick={onLaunch} style={{ padding: '22px 48px', fontSize: '18px', background: '#fff', color: '#1E3C72', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
                            Enter the Vault
                            <ChevronRight size={22} />
                        </button>
                    </div>
                </div>
                
                {/* Visual Glow */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 1 }}></div>
            </section>

            {/* Sub-Feature Strip */}
            <div style={{ background: '#fff', borderTop: '1px solid #f2f2f7', padding: '40px 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', padding: '0 40px' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <div style={{ width: '48px', height: '48px', background: '#f2f2f7', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}>
                            <Shield size={24} />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Secured by Code</h4>
                            <p style={{ fontSize: '13px', color: '#8E8E93' }}>Fully open-source and audited smart contracts on {currentChain.name}.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <div style={{ width: '48px', height: '48px', background: '#f2f2f7', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16C784' }}>
                            <Heart size={24} />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Pulse Verification</h4>
                            <p style={{ fontSize: '13px', color: '#8E8E93' }}>A simple periodic heartbeat keeps your vault active and private.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                        <div style={{ width: '48px', height: '48px', background: '#f2f2f7', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9500' }}>
                            <Timer size={24} />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Timed Inheritance</h4>
                            <p style={{ fontSize: '13px', color: '#8E8E93' }}>Funds are automatically claimable only if the timer expires.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LandingPage
