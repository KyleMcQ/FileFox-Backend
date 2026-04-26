import React, { useState, useEffect } from 'react';
import api from '../api';
import { useKeys } from '../hooks/useKeys';
import { unwrapFileKey, decryptData } from '../crypto';
import Mfa from './Mfa';
import FileUpload from './FileUpload';

const Dashboard = ({ onLogout }) => {
  const [files, setFiles] = useState([]);
  const { keys, loading } = useKeys();
  const [showMfa, setShowMfa] = useState(false);

  const fetchFiles = async () => {
    try {
      const { data } = await api.get('/files');
      setFiles(data);
    } catch (err) {
      console.error("Failed to fetch files", err);
    }
  };

  useEffect(() => {
    if (keys) fetchFiles();
  }, [keys]);

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
      // 1. Get Wrapped Key (using the first one for this user)
      const wrappedKey = wrappedKeys[0];
      const fileKey = await unwrapFileKey(wrappedKey, keys.privateKey);

      // 2. Get Metadata (to know how many chunks, though we can just loop)
      const { data: metadata } = await api.get(`/files/${fileId}`);

      const decryptedChunks = [];
      let i = 0;
      while (true) {
        try {
          console.log(`Downloading chunk ${i}...`);
          const response = await api.get(`/files/${fileId}/chunks/${i}`, { responseType: 'arraybuffer' });
          const combined = new Uint8Array(response.data);

          const iv = combined.slice(0, 12);
          const encrypted = combined.slice(12);

          const decrypted = await decryptData(encrypted, iv, fileKey);
          decryptedChunks.push(decrypted);
          i++;
        } catch (e) {
          if (e.response?.status === 404 && i > 0) {
            // Break when no more chunks (404)
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

  if (loading) return <div>Loading Keys...</div>;
  if (!keys) return <div>Error loading keys. Please re-login. <button onClick={onLogout}>Logout</button></div>;

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>FileFox Dashboard</h2>
        <div>
          <button onClick={() => setShowMfa(!showMfa)}>{showMfa ? 'Close MFA' : 'MFA Settings'}</button>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      {showMfa && <Mfa />}

      <FileUpload onUploadSuccess={fetchFiles} keys={keys} />

      <h3>Your Files</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Metadata (Enc)</th>
            <th>Recovery</th>
            <th>Size</th>
            <th>Uploaded</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map(f => (
            <tr key={f.id}>
              <td>{f.fileName} (Enc)</td>
              <td>
                {f.encryptedMetadata ? (
                  <span title="Decrypted would go here">{atob(f.encryptedMetadata)}</span>
                ) : '-'}
              </td>
              <td>{f.recoveryWrappedKey ? '✅' : '-'}</td>
              <td>{(f.length / 1024).toFixed(2)} KB</td>
              <td>{new Date(f.uploadedAt).toLocaleString()}</td>
              <td>
                <button onClick={() => handleDownloadDirect(f.id, f.fileName)}>Direct</button>
                <button onClick={() => handleDownloadSecure(f.id, f.fileName, f.wrappedKeys)} style={{ marginLeft: '5px' }}>Secure</button>
                <button onClick={() => handleDelete(f.id)} style={{ marginLeft: '5px', color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
