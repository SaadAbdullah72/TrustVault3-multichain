import React from 'react'

interface LandingPageProps {
    onLaunch: () => void;
    currentChain: any;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
    return (
        <div style={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            background: '#0B131E',
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 16px 16px' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '3px', color: '#fff' }}>TRUSTVAULT³</span>
            </div>

            {/* Content */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                padding: '20px'
            }}>
                <h1 style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 800, textAlign: 'center', marginBottom: '16px', lineHeight: 1.1 }}>
                    Don't Lose Your<br/>Crypto Forever
                </h1>
                <p style={{ fontSize: '15px', color: '#8E8E93', textAlign: 'center', maxWidth: '300px', marginBottom: '40px', lineHeight: 1.5 }}>
                    Protect your assets with a dead man's switch. If something happens to you, your crypto goes to your loved ones.
                </p>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '40px' }}>
                    <div style={{ 
                        position: 'absolute', 
                        width: '320px', 
                        height: '320px', 
                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
                        filter: 'blur(50px)'
                    }}></div>
                    <img 
                        src="/device_face.png" 
                        alt="TrustVault" 
                        loading="eager"
                        decoding="async"
                        className="fade-in-image"
                        style={{ 
                            width: '240px', 
                            height: 'auto', 
                            zIndex: 1,
                            filter: 'drop-shadow(0 10px 40px rgba(0,0,0,0.6))',
                            mixBlendMode: 'screen'
                        }} 
                    />
                </div>
            </div>

            <style>{`
                .fade-in-image {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <div style={{ padding: 'clamp(24px, 5vh, 48px) 32px clamp(40px, 8vh, 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button 
                    onClick={onLaunch}
                    style={{ 
                        width: '100%', 
                        maxWidth: '240px',
                        padding: '16px', 
                        background: '#FFFFFF', 
                        color: '#000000',
                        fontSize: '15px', 
                        fontWeight: 800, 
                        borderRadius: '16px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        marginBottom: '20px',
                        transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Proceed
                </button>
                <button 
                    onClick={() => (window as any).setPageStep?.('privacy')}
                    style={{ 
                        width: '100%', 
                        background: 'transparent', 
                        color: '#8E8E93',
                        fontSize: '13px', 
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                >
                    Privacy Policy
                </button>
            </div>
        </div>
    )
}

export default LandingPage
