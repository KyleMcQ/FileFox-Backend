import React from 'react';

const Profile = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">User Profile</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
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
