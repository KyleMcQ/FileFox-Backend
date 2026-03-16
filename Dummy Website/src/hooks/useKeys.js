import { useState, useEffect } from 'react';
import api from '../api';
import { importEncryptedPrivateKey, generateUserKeyPair, exportPublicKey, exportEncryptedPrivateKey } from '../crypto';

export function useKeys() {
  const [keys, setKeys] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadKeys = async () => {
    const password = localStorage.getItem('userPassword');
    if (!password) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/keys/me');
      const privateKey = await importEncryptedPrivateKey(data.encryptedPrivateKey, password);

      const publicKeyBuffer = new Uint8Array(atob(data.publicKey).split("").map(c => c.charCodeAt(0)));
      const publicKey = await window.crypto.subtle.importKey(
        "spki",
        publicKeyBuffer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["encrypt"]
      );

      setKeys({ publicKey, privateKey });
    } catch (err) {
      if (err.response?.status === 404) {
        const keyPair = await generateUserKeyPair();
        const pubBase64 = await exportPublicKey(keyPair.publicKey);
        const privBase64 = await exportEncryptedPrivateKey(keyPair.privateKey, password);

        await api.post('/keys/register', {
          algorithm: 'RSA-OAEP',
          publicKey: pubBase64,
          encryptedPrivateKey: privBase64
        });

        setKeys(keyPair);
      } else {
        console.error("Failed to load keys", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  return { keys, loading };
}
