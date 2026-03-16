// src/crypto.js
// Client-side encryption utilities using Web Crypto API

/**
 * Generates an RSA-OAEP key pair for the user.
 */
export async function generateUserKeyPair() {
  return await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Exports a public key to base64.
 */
export async function exportPublicKey(key) {
  const exported = await window.crypto.subtle.exportKey("spki", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Exports a private key to base64, encrypted with a password-derived key.
 */
export async function exportEncryptedPrivateKey(privateKey, password) {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const derivedKey = await deriveKeyFromPassword(password, salt);

  const exported = await window.crypto.subtle.exportKey("pkcs8", privateKey);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    derivedKey,
    exported
  );

  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts and imports a private key from base64 using a password.
 */
export async function importEncryptedPrivateKey(base64, password) {
  const combined = new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)));
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encrypted = combined.slice(28);

  const derivedKey = await deriveKeyFromPassword(password, salt);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    derivedKey,
    encrypted
  );

  return await window.crypto.subtle.importKey(
    "pkcs8",
    decrypted,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
}

async function deriveKeyFromPassword(password, salt) {
  const enc = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a file key (AES) with an RSA public key.
 */
export async function wrapFileKey(fileKey, publicKey) {
  const wrapped = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    fileKey
  );
  return btoa(String.fromCharCode(...new Uint8Array(wrapped)));
}

/**
 * Decrypts a file key (AES) with an RSA private key.
 */
export async function unwrapFileKey(wrappedKeyBase64, privateKey) {
  const wrapped = new Uint8Array(atob(wrappedKeyBase64).split("").map(c => c.charCodeAt(0)));
  const unwrapped = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    wrapped
  );
  return await window.crypto.subtle.importKey(
    "raw",
    unwrapped,
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Generates a random AES-256 key for a file.
 */
export async function generateFileKey() {
  return await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts data with an AES key.
 */
export async function encryptData(data, key) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return { encrypted, iv };
}

/**
 * Decrypts data with an AES key.
 */
export async function decryptData(encrypted, iv, key) {
  return await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted
  );
}
