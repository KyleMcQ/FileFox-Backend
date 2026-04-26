import React, { useState } from 'react';
import api from '../api';
import { generateFileKey, wrapFileKey, encryptData } from '../crypto';

const CHUNK_SIZE = 1024 * 1024; // 1MB

const FileUpload = ({ onUploadSuccess, keys }) => {
  const [file, setFile] = useState(null);
  const [extraMetadata, setExtraMetadata] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleDirectUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (extraMetadata) {
      formData.append('encryptedMetadata', btoa(extraMetadata)); // Simplified simulation
    }
    formData.append('recoveryWrappedKey', 'SIMULATED_RECOVERY_KEY_WRAPPED');

    try {
      await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('File uploaded successfully (Direct)');
      onUploadSuccess();
    } catch (err) {
      alert('Direct upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleChunkedUpload = async () => {
    if (!file || !keys) return;
    setUploading(true);

    try {
      // 1. Generate File Key
      const fileKey = await generateFileKey();

      // 2. Wrap File Key with User's Public Key
      const wrappedFileKey = await wrapFileKey(fileKey, keys.publicKey);

      // 3. Prepare "Manifest" (Simplified: we'll just send the IV for the first chunk as a header placeholder)
      // In a real app, you'd store IVs for all chunks.
      const manifestHeader = btoa(JSON.stringify({ version: 'v1', chunks: Math.ceil(file.size / CHUNK_SIZE) }));

      // 4. Init
      const { data } = await api.post('/files/init', {
        encryptedFileName: file.name, // In real app, encrypt this too
        encryptedMetadata: extraMetadata ? btoa(extraMetadata) : null,
        encryptedManifestHeader: manifestHeader,
        wrappedFileKey,
        recoveryWrappedKey: 'SIMULATED_RECOVERY_KEY_WRAPPED',
        chunkSize: CHUNK_SIZE,
        totalSize: file.size,
        contentType: file.type,
        cryptoVersion: 'v1'
      });

      const fileId = data.fileId;

      // 5. Upload Chunks
      for (let i = 0; i < Math.ceil(file.size / CHUNK_SIZE); i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);
        const arrayBuffer = await chunk.arrayBuffer();

        // Encrypt chunk
        const { encrypted, iv } = await encryptData(arrayBuffer, fileKey);

        // Combine IV and Encrypted Data for storage
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);

        await api.put(`/files/${fileId}/chunks/${i}`, new Blob([combined]), {
          headers: { 'Content-Type': 'application/octet-stream' }
        });
      }

      // 6. Complete
      await api.post(`/files/${fileId}/complete`);

      alert('Chunked upload completed!');
      onUploadSuccess();
    } catch (err) {
      console.error(err);
      alert('Chunked upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <h3>Upload File</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          placeholder="Extra Metadata (Tags, etc.)"
          value={extraMetadata}
          onChange={(e) => setExtraMetadata(e.target.value)}
          style={{ width: '100%', marginBottom: '5px' }}
        />
      </div>
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleDirectUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Direct Upload (Simple)'}
        </button>
        <button onClick={handleChunkedUpload} disabled={uploading} style={{ marginLeft: '10px' }}>
          {uploading ? 'Uploading...' : 'Secure Chunked Upload'}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
