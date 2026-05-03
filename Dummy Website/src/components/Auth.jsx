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
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage('If an account exists, a reset link has been sent.');
      if (data.resetToken) {
        console.log("Demo Reset Token:", data.resetToken);
        setMessage(`Demo Reset Token: ${data.resetToken}`);
        setResetToken(data.resetToken);
      }
    } catch (err) {
      setError('Request failed');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/auth/reset-password', { token: resetToken, newPassword });
      setMessage('Password reset successfully. You can now login.');
      setForgotPassword(false);
      setResetToken('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed');
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

  if (forgotPassword) {
    return (
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title h4 mb-4 text-center">Reset Password</h2>
              {error && <div className="alert alert-danger">{error}</div>}
              {message && <div className="alert alert-info">{message}</div>}

              {!resetToken ? (
                <form onSubmit={handleForgotPassword}>
                  <div className="mb-3">
                    <label className="form-label">Email address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mb-3">Send Reset Token</button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword}>
                   <div className="mb-3">
                    <label className="form-label">Reset Token</label>
                    <input
                      type="text"
                      className="form-control"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mb-3">Reset Password</button>
                </form>
              )}

              <div className="text-center">
                <button className="btn btn-link btn-sm text-decoration-none" onClick={() => { setForgotPassword(false); setError(''); setMessage(''); }}>
                  Back to Login
                </button>
              </div>
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
            {message && <div className="alert alert-info">{message}</div>}
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
              <button className="btn btn-link btn-sm text-decoration-none" onClick={() => { setIsRegister(!isRegister); setError(''); setMessage(''); }}>
                {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
              </button>
              {!isRegister && (
                <div className="mt-2">
                  <button className="btn btn-link btn-sm text-decoration-none text-muted" onClick={() => { setForgotPassword(true); setError(''); setMessage(''); }}>
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
