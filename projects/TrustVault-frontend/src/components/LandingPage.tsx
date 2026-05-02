import React from 'react'
import { Asterisk, Shield, Lock, ChevronRight, Globe, Zap, Heart, Timer } from 'lucide-react'

interface LandingPageProps {
    onLaunch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
    return (
        <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column' }}>
            {/* Nav */}
            <nav style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f2f2f7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', background: '#3B82F6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Asterisk size={18} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>TRUSTVAULT</span>
                </div>
                <button className="nb-btn-primary" onClick={onLaunch} style={{ padding: '10px 24px', fontSize: '14px' }}>
                    Launch App
                </button>
            </nav>

            {/* Hero */}
            <section className="hero-gradient" style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                    <h1 style={{ fontSize: '64px', fontWeight: 900, marginBottom: '24px', lineHeight: 1.1, letterSpacing: '-2px' }}>
                        The Future of Digital <br />
                        <span style={{ color: '#3B82F6' }}>Inheritance</span> is Here.
                    </h1>
                    <p style={{ fontSize: '20px', opacity: 0.8, marginBottom: '48px', lineHeight: 1.6 }}>
                        Protect your crypto assets for the next generation. Secure, decentralized, and multichain vaults for your family's future.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <button className="nb-btn-primary" onClick={onLaunch} style={{ padding: '20px 40px', fontSize: '18px', background: '#fff', color: '#1E3C72' }}>
                            Get Started Now
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
                
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(59, 130, 246, 0.2)', filter: 'blur(100px)', borderRadius: '50%' }}></div>
            </section>

            {/* Features */}
            <section style={{ padding: '100px 40px', background: '#f8fafc' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '16px' }}>Secure by Design.</h2>
                        <p style={{ color: '#64748b', fontSize: '18px' }}>The decentralized protocol built for peace of mind.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                        <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '60px', height: '60px', background: '#f2f2f7', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: '#3B82F6' }}>
                                <Heart size={32} />
                            </div>
                            <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>Heartbeat System</h3>
                            <p style={{ color: '#64748b', lineHeight: 1.6 }}>As long as you stay active, your funds remain yours. A simple heartbeat keeps your assets protected.</p>
                        </div>
                        <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '60px', height: '60px', background: '#f2f2f7', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: '#16C784' }}>
                                <Timer size={32} />
                            </div>
                            <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>Automatic Release</h3>
                            <p style={{ color: '#64748b', lineHeight: 1.6 }}>If the timer expires, your beneficiaries can automatically claim the assets without any third-party intervention.</p>
                        </div>
                        <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '60px', height: '60px', background: '#f2f2f7', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: '#ef4444' }}>
                                <Globe size={32} />
                            </div>
                            <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>Multichain Support</h3>
                            <p style={{ color: '#64748b', lineHeight: 1.6 }}>Available on Solana, Ethereum, Algorand and more. Your legacy is protected across all major ecosystems.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '60px 40px', textAlign: 'center', borderTop: '1px solid #f2f2f7', color: '#8e8e93', fontSize: '14px' }}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <Asterisk size={16} />
                    <span style={{ fontWeight: 700 }}>TRUSTVAULT PROTOCOL © 2026</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
                    <span>Security Audit</span>
                    <span>Documentation</span>
                    <span>Community</span>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
