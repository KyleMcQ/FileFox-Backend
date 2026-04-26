import React, { useState } from 'react';
import api from '../api';
import { QRCodeCanvas } from 'qrcode.react';

const Mfa = () => {
  const [mfaData, setMfaData] = useState(null);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');

  const setupMfa = async () => {
    try {
      const { data } = await api.post('/auth/mfa/setup');
      setMfaData(data);
    } catch (err) {
      setStatus('Failed to setup MFA');
    }
  };

  const verifyMfa = async () => {
    try {
      await api.post('/auth/mfa/verify', { code });
      setStatus('MFA Enabled successfully!');
    } catch (err) {
      setStatus('MFA verification failed');
    }
  };

  return (
    <div className="mfa-container">
      <h3>Multi-Factor Authentication</h3>
      {!mfaData ? (
        <button onClick={setupMfa}>Enable MFA</button>
      ) : (
        <div>
          <p>Secret: {mfaData.base32Secret}</p>
          <p>Scan the QR code or enter the secret in your authenticator app.</p>

          <div style={{ margin: '20px 0' }}>
            <QRCodeCanvas value={mfaData.otpAuthUri} size={200} />
          </div>

          {mfaData.recoveryCodes && (
            <div style={{ backgroundColor: '#f0f0f0', padding: '10px', margin: '10px 0' }}>
              <h4>Recovery Codes (Save these!)</h4>
              <ul style={{ textAlign: 'left' }}>
                {mfaData.recoveryCodes.map((c, i) => <li key={i}><code>{c}</code></li>)}
              </ul>
            </div>
          )}

          <input type="text" placeholder="Enter 6-digit code" value={code} onChange={(e) => setCode(e.target.value)} />
          <button onClick={verifyMfa}>Verify & Enable</button>
        </div>
      )}
      {status && <p>{status}</p>}
    </div>
  );
};

export default Mfa;
