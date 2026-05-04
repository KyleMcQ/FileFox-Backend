import { useState, useEffect } from "react";
import api from "../api/apiClient";
import { useAuth } from "./useAuth";
import {
  importEncryptedPrivateKey,
  importPublicKey,
} from "../crypto/encryption";
import forge from "node-forge";

export function useKeys() {
  const { password } = useAuth();
  const [keys, setKeys] = useState<{
    publicKey: forge.pki.rsa.PublicKey;
    privateKey: forge.pki.rsa.PrivateKey;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadKeys = async () => {
    if (!password) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/keys/me");
      const privateKey = await importEncryptedPrivateKey(
        data.encryptedPrivateKey,
        password
      );
      const publicKey = importPublicKey(data.publicKey);

      setKeys({ publicKey, privateKey });
    } catch (err: any) {
      console.error("Failed to load keys", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, [password]);

  return { keys, loading };
}
