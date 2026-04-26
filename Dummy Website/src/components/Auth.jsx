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
      <div className="auth-container">
        <h2>{useRecoveryCode ? 'Enter Recovery Code' : 'Enter MFA Code'}</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleMfaLogin}>
          <input
            type="text"
            placeholder={useRecoveryCode ? "Recovery Code" : "6-digit code"}
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
          />
          <button type="submit">Verify</button>
        </form>
        <button onClick={() => { setUseRecoveryCode(!useRecoveryCode); setError(''); }}>
          {useRecoveryCode ? 'Use TOTP Code' : 'Use Recovery Code'}
        </button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={isRegister ? handleRegister : handleLogin}>
        {isRegister && (
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Have an account? Login' : 'Need an account? Register'}
      </button>
    </div>
  );
};

export default Auth;
