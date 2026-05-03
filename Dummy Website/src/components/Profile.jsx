import React, { useState } from 'react';
import api from '../api';

const Profile = ({ user, onClose, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError('File too large (max 1MB)');
      return;
    }

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/auth/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (onUpdate) await onUpdate();
    } catch (err) {
      setError(err.response?.data || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">User Profile</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="text-center mb-4">
              {user.profilePicture ? (
                <img
                  src={`data:${user.profilePictureContentType};base64,${user.profilePicture}`}
                  alt="Profile"
                  className="rounded-circle shadow-sm"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center text-white shadow-sm"
                  style={{ width: '100px', height: '100px', fontSize: '40px' }}
                >
                  {user.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="mt-3">
                <label className="btn btn-outline-primary btn-sm">
                  {uploading ? 'Uploading...' : 'Change Picture'}
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} disabled={uploading} />
                </label>
                {error && <div className="text-danger small mt-1">{error}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Username</label>
              <p className="form-control-plaintext">{user.userName}</p>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <p className="form-control-plaintext">{user.email}</p>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
