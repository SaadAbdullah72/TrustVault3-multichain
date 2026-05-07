import React from 'react'
import { ArrowLeft, Shield, Lock, Eye, FileText, CheckCircle } from 'lucide-react'

interface PrivacyPolicyProps {
    onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0B131E', color: '#fff' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: '10px', borderRadius: '12px' }}>
                    <ArrowLeft size={20} />
                </button>
                <h1 style={{ fontSize: '20px', fontWeight: 800 }}>Privacy Policy</h1>
            </div>

            <div style={{ flex: 1, padding: '32px 24px', overflowY: 'auto' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                        <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={24} color="#10b981" />
                        </div>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 800 }}>Your Security, Our Priority</div>
                            <div style={{ fontSize: '14px', color: '#94a3b8' }}>TrustVault is a non-custodial, decentralized protocol.</div>
                        </div>
                    </div>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>1. Information We Collect</h2>
                        <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                            TrustVault is designed to be privacy-preserving. We do not collect personal information like your name, email, or physical address. 
                        </p>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Lock size={16} color="#3b82f6" /> Public Wallet Addresses
                                </div>
                                <p style={{ fontSize: '13px', color: '#64748b' }}>We process your public wallet address to interact with smart contracts and display your vaults.</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={16} color="#8b5cf6" /> Vault Metadata
                                </div>
                                <p style={{ fontSize: '13px', color: '#64748b' }}>Vault names and beneficiary mappings are stored in our secure cloud registry (Supabase) to enable cross-device discovery.</p>
                            </div>
                        </div>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>2. How We Use Data</h2>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '12px' }}>
                            {[
                                'To provide core protocol functionality (Heartbeats, Withdrawals).',
                                'To allow users to find vaults across different devices.',
                                'To monitor system performance and prevent abuse.',
                                'To improve the user experience through anonymous usage stats.'
                            ].map((item, i) => (
                                <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '14px', color: '#94a3b8' }}>
                                    <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0 }} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>3. Non-Custodial Nature</h2>
                        <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <p style={{ color: '#fca5a5', fontSize: '14px', lineHeight: 1.6 }}>
                                <b>IMPORTANT:</b> TrustVault never has access to your private keys. Your assets are secured by the underlying blockchain (Algorand, Solana, EVM). We cannot recover your funds if you lose access to your wallet.
                            </p>
                        </div>
                    </section>

                    <div style={{ padding: '40px 0', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ color: '#64748b', fontSize: '12px' }}>Last updated: May 2024</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
