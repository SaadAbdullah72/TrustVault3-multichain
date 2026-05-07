import React from 'react'
import { Shield, Lock, Users, ArrowRight, Zap, Globe } from 'lucide-react'

interface LandingPageProps {
    onLaunch: () => void;
    currentChain: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch, currentChain }) => {
    return (
        <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            background: 'radial-gradient(circle at top right, #111e2f, #0B131E)',
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
            fontFamily: 'Inter, -apple-system, sans-serif'
        }}>
            {/* Ambient Background Elements */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0 }}></div>
            <div style={{ position: 'absolute', bottom: '20%', left: '-5%', width: '30%', height: '30%', background: 'rgba(16, 185, 129, 0.03)', borderRadius: '50%', filter: 'blur(60px)', zIndex: 0 }}></div>

            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 16px', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={16} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '2px', color: '#fff' }}>TRUSTVAULT³</span>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '100px', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.05)' }}>
                    V2.4.0 <span style={{ color: '#10b981', marginLeft: '4px' }}>LIVE</span>
                </div>
            </div>

            {/* Content */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                padding: '0 32px',
                zIndex: 10
            }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '6px 12px', borderRadius: '100px', color: '#3b82f6', fontSize: '11px', fontWeight: 800, marginBottom: '20px', width: 'fit-content' }}>
                    <Zap size={12} fill="#3b82f6" /> MULTI-CHAIN INHERITANCE
                </div>
                
                <h1 style={{ fontSize: '42px', fontWeight: 900, textAlign: 'left', marginBottom: '20px', lineHeight: 1.05, letterSpacing: '-1px' }}>
                    Secure Your <span style={{ background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Crypto Legacy</span> Forever.
                </h1>
                
                <p style={{ fontSize: '16px', color: '#94a3b8', textAlign: 'left', maxWidth: '340px', marginBottom: '48px', lineHeight: 1.6 }}>
                    Protect your digital assets with a decentralized dead man's switch. Your legacy, secured on-chain.
                </p>

                {/* Feature Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Lock size={20} color="#3b82f6" style={{ marginBottom: '12px' }} />
                        <div style={{ fontSize: '14px', fontWeight: 800 }}>Non-Custodial</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>You retain 100% control.</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Users size={20} color="#10b981" style={{ marginBottom: '12px' }} />
                        <div style={{ fontSize: '14px', fontWeight: 800 }}>Family First</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Secure beneficiaries.</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b', fontSize: '12px', fontWeight: 700 }}>
                    <Globe size={14} /> Active on {currentChain.name}
                </div>
            </div>

            {/* Bottom CTA */}
            <div style={{ padding: '32px', zIndex: 10 }}>
                <button 
                    onClick={onLaunch}
                    style={{ 
                        width: '100%', 
                        padding: '20px', 
                        background: '#FFFFFF', 
                        color: '#000000',
                        fontSize: '17px', 
                        fontWeight: 800, 
                        borderRadius: '24px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: '0 10px 30px rgba(255,255,255,0.1)'
                    }}
                >
                    Launch TrustVault <ArrowRight size={18} />
                </button>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', marginTop: '24px' }}>
                    <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, letterSpacing: '1px' }}>
                        ENCRYPTED BY BLOCKCHAIN
                    </div>
                    <button 
                        onClick={() => (window as any).setPageStep?.('privacy')}
                        style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11px', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        PRIVACY POLICY
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    )
}

export default LandingPage
