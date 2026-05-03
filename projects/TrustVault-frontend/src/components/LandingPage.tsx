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
            {/* Top Bar for aesthetics */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>TRUSTVAULT</span>
            </div>

            {/* Premium Asset Visual - Face */}
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                padding: '20px',
                marginTop: '10px'
            }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', letterSpacing: '-0.5px' }}>
                    My Identity Key
                </h1>
                <p style={{ fontSize: '14px', color: '#8E8E93', textAlign: 'center', maxWidth: '280px', marginBottom: '40px', lineHeight: 1.5 }}>
                    Don't let your assets wash away. Your identity key is safely stored and protected by the protocol.
                </p>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ 
                        position: 'absolute', 
                        width: '320px', 
                        height: '320px', 
                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
                        filter: 'blur(50px)'
                    }}></div>
                    <img 
                        src="/device_face.png" 
                        alt="Identity Key" 
                        style={{ 
                            width: '240px', 
                            height: 'auto', 
                            zIndex: 1,
                            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))'
                        }} 
                    />
                </div>
                
                <div style={{ marginTop: '32px', fontSize: '13px', color: '#8E8E93' }}>
                    Verification required
                </div>
            </div>

            {/* Bottom Content Area */}
            <div style={{ padding: '32px' }}>
                <button 
                    onClick={onLaunch}
                    style={{ 
                        width: '100%', 
                        padding: '18px', 
                        background: '#FFFFFF', 
                        color: '#000000',
                        fontSize: '16px', 
                        fontWeight: 700, 
                        borderRadius: '24px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(255,255,255,0.1)'
                    }}
                >
                    Proceed
                </button>
            </div>
        </div>
    )
}

export default LandingPage
