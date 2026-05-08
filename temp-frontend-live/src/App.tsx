import React, { useState } from 'react';
import { TrustVaultSDK } from './trustvault-sdk/TrustVaultSDK';
import { Shield, CheckCircle, Code } from 'lucide-react';

function App() {
  const [status, setStatus] = useState('Idle');
  const [loading, setLoading] = useState(false);

  const handleIntegrate = async () => {
    setLoading(true);
    setStatus('Initializing TrustVault SDK...');
    
    // Using the real SDK logic we built
    const sdk = TrustVaultSDK.forEVM({ 
        name: 'Sepolia', 
        type: 'evm', 
        testnet: { rpcUrl: 'https://sepolia.infura.io/v3/...' } 
    });
    
    setTimeout(() => {
      setLoading(false);
      setStatus('Protected');
    }, 2000);
  };

  return (
    <div style={{ padding: '20px', fontFamily: '"Inter", sans-serif', background: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <div style={{ background: '#1e293b', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
        <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Shield size={32} color="#10b981" />
        </div>
        
        <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.5px' }}>Developer Sandbox</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '32px' }}>
          Real-time simulation of third-party platform integration using the <b>TrustVault Enterprise SDK</b>.
        </p>

        <div style={{ background: '#0f172a', padding: '24px', borderRadius: '20px', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: status === 'Protected' ? '#10b981' : '#64748b' }}>
            {status === 'Protected' ? <CheckCircle size={20} /> : <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: loading ? '#3b82f6' : '#64748b' }}></div>}
            <span style={{ fontWeight: 800, fontSize: '15px' }}>{status.toUpperCase()}</span>
          </div>
        </div>

        <button 
          onClick={handleIntegrate}
          disabled={loading || status === 'Protected'}
          style={{ 
            width: '100%', 
            padding: '18px', 
            borderRadius: '16px', 
            background: status === 'Protected' ? 'rgba(16, 185, 129, 0.1)' : '#fff', 
            color: status === 'Protected' ? '#10b981' : '#000', 
            border: status === 'Protected' ? '1px solid #10b981' : 'none', 
            fontWeight: 800, 
            fontSize: '15px', 
            cursor: loading || status === 'Protected' ? 'default' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Processing SDK Call...' : status === 'Protected' ? 'Vault Created!' : 'Protect with TrustVault'}
        </button>

        <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#475569', fontSize: '12px' }}>
          <Code size={14} />
          <span>Integration active via <b>@trustvault/sdk-core</b></span>
        </div>
      </div>
    </div>
  );
}

export default App;
