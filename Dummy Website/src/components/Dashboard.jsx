import React, { useState, useEffect } from 'react';
import api from '../api';
import { useKeys } from '../hooks/useKeys';
import { unwrapFileKey, decryptData } from '../crypto';
import Mfa from './Mfa';
import FileUpload from './FileUpload';
import Profile from './Profile';

const Dashboard = ({ onLogout }) => {
  const [files, setFiles] = useState([]);
  const { keys, loading } = useKeys();
  const [showMfa, setShowMfa] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const fetchFiles = async () => {
    try {
      const { data } = await api.get('/files');
      setFiles(data);
    } catch (err) {
      console.error("Failed to fetch files", err);
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user info", err);
    }
  };

  useEffect(() => {
    if (keys) {
      fetchFiles();
      fetchUser();
    }
  }, [keys]);

  const handleMfaUpdate = () => {
    fetchUser();
    setShowMfa(false);
  };

  const handleDownloadDirect = async (fileId, fileName) => {
    try {
      const response = await api.get(`/files/${fileId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Download failed");
    }
  };

  const handleDownloadSecure = async (fileId, fileName, wrappedKeys) => {
    try {
      const wrappedKey = wrappedKeys[0];
      const fileKey = await unwrapFileKey(wrappedKey, keys.privateKey);

      const { data: metadata } = await api.get(`/files/${fileId}`);

      const decryptedChunks = [];
      let i = 0;
      while (true) {
        try {
          const response = await api.get(`/files/${fileId}/chunks/${i}`, { responseType: 'arraybuffer' });
          const combined = new Uint8Array(response.data);

          const iv = combined.slice(0, 12);
          const encrypted = combined.slice(12);

          const decrypted = await decryptData(encrypted, iv, fileKey);
          decryptedChunks.push(decrypted);
          i++;
        } catch (e) {
          if (e.response?.status === 404 && i > 0) {
            break;
          }
          throw e;
        }
      }

      const blob = new Blob(decryptedChunks, { type: metadata.contentType || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Secure download failed");
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await api.delete(`/files/${fileId}`);
      alert("File deleted");
      fetchFiles();
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center my-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading Keys...</span>
      </div>
    </div>
  );

  if (!keys) return (
    <div className="alert alert-danger" role="alert">
      Error loading keys. Please re-login.
      <button className="btn btn-outline-danger btn-sm ms-3" onClick={onLogout}>Logout</button>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 mb-0">Dashboard</h2>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" onClick={() => setShowProfile(true)}>Profile</button>
          <button className="btn btn-outline-secondary" onClick={() => setShowMfa(!showMfa)}>
            {showMfa ? 'Close MFA' : (user?.mfaEnabled ? 'MFA Settings' : 'Enable MFA')}
          </button>
          <button className="btn btn-outline-danger" onClick={onLogout}>Logout</button>
        </div>
      </div>

      {showProfile && <Profile user={user} onClose={() => setShowProfile(false)} />}

      {showMfa && (
        <div className="card mb-4">
          <div className="card-body">
            <Mfa mfaEnabled={user?.mfaEnabled} onMfaUpdate={handleMfaUpdate} />
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header bg-light">
          <h5 className="mb-0">Upload File</h5>
        </div>
        <div className="card-body">
          <FileUpload onUploadSuccess={fetchFiles} keys={keys} />
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white">
          <h5 className="mb-0">Your Files</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Metadata</th>
                <th>Recovery</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">No files found.</td>
                </tr>
              ) : (
                files.map(f => (
                  <tr key={f.id}>
                    <td className="fw-medium">{f.fileName} <span className="badge bg-info text-dark ms-1" style={{fontSize: '0.7rem'}}>Enc</span></td>
                    <td>
                      {f.encryptedMetadata ? (
                        <span className="text-truncate d-inline-block" style={{maxWidth: '150px'}} title={atob(f.encryptedMetadata)}>{atob(f.encryptedMetadata)}</span>
                      ) : '-'}
                    </td>
                    <td>{f.recoveryWrappedKey ? <span className="text-success">✅</span> : <span className="text-muted">-</span>}</td>
                    <td>{(f.length / 1024).toFixed(2)} KB</td>
                    <td className="text-muted small">{new Date(f.uploadedAt).toLocaleString()}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" onClick={() => handleDownloadDirect(f.id, f.fileName)}>Direct</button>
                        <button className="btn btn-outline-success" onClick={() => handleDownloadSecure(f.id, f.fileName, f.wrappedKeys)}>Secure</button>
                        <button className="btn btn-outline-danger" onClick={() => handleDelete(f.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
