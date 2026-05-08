import React, { useState } from 'react';
import { TrustVaultSDK } from '@trustvault/sdk-core';

function App() {
  const [status, setStatus] = useState('Ready to protect');

  const handleIntegrate = async () => {
    setStatus('Initializing TrustVault SDK...');
    
    // Simulate SDK usage
    const sdk = TrustVaultSDK.forEVM({ name: 'Sepolia', type: 'evm', testnet: { rpcUrl: '' } });
    
    setTimeout(() => {
      setStatus('Success! Inheritance Vault created via SDK. ✅');
    }, 2000);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '400px', textAlign: 'center' }}>
        <h2 style={{ color: '#0f172a' }}>My New App</h2>
        <p style={{ color: '#64748b', fontSize: '14px' }}>This app uses TrustVault Service to protect user assets.</p>
        
        <div style={{ margin: '30px 0', padding: '20px', background: '#f1f5f9', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold', color: '#10b981' }}>
          {status}
        </div>

        <button 
          onClick={handleIntegrate}
          style={{ width: '100%', padding: '16px', borderRadius: '12px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Enable Inheritance Protection
        </button>
      </div>
      <p style={{ marginTop: '20px', color: '#94a3b8', fontSize: '12px' }}>Powered by @trustvault/sdk-core</p>
    </div>
  );
}

export default App;
