import React, { useState } from 'react';
import api from '../api';
import { QRCodeCanvas } from 'qrcode.react';

const Mfa = ({ mfaEnabled, onMfaUpdate }) => {
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
      setTimeout(() => {
        onMfaUpdate();
      }, 1500);
    } catch (err) {
      setStatus('MFA verification failed');
    }
  };

  const disableMfa = async () => {
    if (!window.confirm("Are you sure you want to disable MFA? This will reduce your account security.")) return;
    try {
      await api.post('/auth/mfa/disable');
      setStatus('MFA Disabled successfully!');
      setTimeout(() => {
        onMfaUpdate();
      }, 1500);
    } catch (err) {
      setStatus('Failed to disable MFA');
    }
  };

  return (
    <div className="mfa-section">
      <h4 className="mb-3">Multi-Factor Authentication</h4>
      {mfaEnabled && !mfaData ? (
        <div className="text-center py-3">
          <p className="text-success fw-bold">MFA is currently enabled.</p>
          <button className="btn btn-outline-danger" onClick={disableMfa}>Disable MFA</button>
        </div>
      ) : !mfaData ? (
        <button className="btn btn-primary" onClick={setupMfa}>Enable MFA</button>
      ) : (
        <div className="row">
          <div className="col-md-6 text-center border-end">
            <p className="mb-2">Scan the QR code or enter the secret.</p>
            <div className="bg-white p-3 d-inline-block border rounded mb-3">
              <QRCodeCanvas value={mfaData.otpAuthUri} size={180} />
            </div>
            <div className="mb-3">
              <small className="text-muted d-block">Manual Secret:</small>
              <code className="h6">{mfaData.base32Secret}</code>
            </div>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button className="btn btn-success" onClick={verifyMfa}>Verify & Enable</button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card h-100 bg-light">
              <div className="card-body">
                <h5 className="card-title h6 text-danger fw-bold">Recovery Codes (Save these!)</h5>
                <p className="small text-muted mb-2">Use these codes if you lose access to your authenticator app.</p>
                <div className="row g-1">
                  {mfaData.recoveryCodes.map((c, i) => (
                    <div key={i} className="col-6">
                      <code className="bg-white border rounded p-1 d-block text-center small">{c}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {status && (
        <div className={`alert mt-3 ${status.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
          {status}
        </div>
      )}
    </div>
  );
};

export default Mfa;
