import React, { useState } from 'react';
import api from '../api';
import { generateUserKeyPair, exportPublicKey, exportEncryptedPrivateKey } from '../crypto';

const Auth = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mfaToken, setMfaToken] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { username, email, password });

      // After registration, log in to get tokens for key registration
      await handleLogin(e);

      // Generate and register keys
      const keyPair = await generateUserKeyPair();
      const publicKey = await exportPublicKey(keyPair.publicKey);
      const encryptedPrivateKey = await exportEncryptedPrivateKey(keyPair.privateKey, password);

      await api.post('/keys/register', {
        algorithm: 'RSA-OAEP',
        publicKey,
        encryptedPrivateKey
      });

      alert('Registered successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.mfaRequired) {
        setMfaToken(data.mfaToken);
      } else {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('userPassword', password); // Keep temporarily for key decryption
        onLogin();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleMfaLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let response;
      if (useRecoveryCode) {
        response = await api.post('/auth/login/recovery', { mfaToken, recoveryCode: mfaCode });
      } else {
        response = await api.post('/auth/login/mfa', { mfaToken, code: mfaCode });
      }
      const { data } = response;
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('userPassword', password);
      onLogin();
    } catch (err) {
      setError(useRecoveryCode ? 'Recovery code validation failed' : 'MFA Validation failed');
    }
  };

  if (mfaToken) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="card shadow">
            <div className="card-body text-center">
              <h2 className="card-title h4 mb-3">{useRecoveryCode ? 'Enter Recovery Code' : 'Enter MFA Code'}</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleMfaLogin}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={useRecoveryCode ? "Recovery Code" : "6-digit code"}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 mb-2">Verify</button>
              </form>
              <button
                className="btn btn-link btn-sm"
                onClick={() => { setUseRecoveryCode(!useRecoveryCode); setError(''); setMfaCode(''); }}
              >
                {useRecoveryCode ? 'Use TOTP Code' : 'Use Recovery Code'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card shadow">
          <div className="card-body">
            <h2 className="card-title h4 mb-4 text-center">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={isRegister ? handleRegister : handleLogin}>
              {isRegister && (
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-3">
                {isRegister ? 'Register' : 'Login'}
              </button>
            </form>
            <div className="text-center">
              <button className="btn btn-link btn-sm text-decoration-none" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
