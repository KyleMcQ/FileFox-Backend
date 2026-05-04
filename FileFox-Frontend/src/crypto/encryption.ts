import forge from "node-forge";
import { Buffer } from "buffer";

/* ================= CONSTANTS ================= */
const PBKDF2_ITERATIONS = 100000;

/* ================= USER KEY MANAGEMENT ================= */

/**
 * Generates an RSA-OAEP 2048 key pair.
 */
export async function generateUserKeyPair() {
  return new Promise<{ publicKey: forge.pki.rsa.PublicKey; privateKey: forge.pki.rsa.PrivateKey }>(
    (resolve, reject) => {
      forge.pki.rsa.generateKeyPair({ bits: 2048, workers: -1 }, (err, keypair) => {
        if (err) reject(err);
        else resolve(keypair);
      });
    }
  );
}

/**
 * Exports a public key to base64 (SubjectPublicKeyInfo).
 */
export function exportPublicKey(publicKey: forge.pki.rsa.PublicKey): string {
  const pem = forge.pki.publicKeyToAsn1(publicKey);
  const der = forge.asn1.toDer(pem).getBytes();
  return Buffer.from(der, "binary").toString("base64");
}

/**
 * Imports a public key from base64 (SubjectPublicKeyInfo).
 */
export function importPublicKey(base64: string): forge.pki.rsa.PublicKey {
  const der = Buffer.from(base64, "base64").toString("binary");
  const asn1 = forge.asn1.fromDer(der);
  return forge.pki.publicKeyFromAsn1(asn1);
}

/**
 * Exports a private key to base64, encrypted with a password-derived key.
 */
export async function exportEncryptedPrivateKey(
  privateKey: forge.pki.rsa.PrivateKey,
  password: string
): Promise<string> {
  const salt = forge.random.getBytesSync(16);
  const derivedKey = forge.pkcs5.pbkdf2(password, salt, PBKDF2_ITERATIONS, 32);

  const pkcs8Asn1 = forge.pki.privateKeyToAsn1(privateKey);
  const pkcs8Der = forge.asn1.toDer(pkcs8Asn1).getBytes();

  const iv = forge.random.getBytesSync(12);
  const cipher = forge.cipher.createCipher("AES-GCM", derivedKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(pkcs8Der));
  cipher.finish();

  const encrypted = cipher.output.getBytes();
  const tag = cipher.mode.tag.getBytes();

  // Combine: salt (16) + iv (12) + tag (16) + encrypted
  const combined = salt + iv + tag + encrypted;
  return Buffer.from(combined, "binary").toString("base64");
}

/**
 * Decrypts and imports a private key from base64 using a password.
 */
export async function importEncryptedPrivateKey(
  base64: string,
  password: string
): Promise<forge.pki.rsa.PrivateKey> {
  const combined = Buffer.from(base64, "base64").toString("binary");

  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const tag = combined.slice(28, 44);
  const encrypted = combined.slice(44);

  const derivedKey = forge.pkcs5.pbkdf2(password, salt, PBKDF2_ITERATIONS, 32);

  const decipher = forge.cipher.createDecipher("AES-GCM", derivedKey);
  decipher.start({ iv, tag: forge.util.createBuffer(tag) });
  decipher.update(forge.util.createBuffer(encrypted));
  const pass = decipher.finish();

  if (!pass) {
    throw new Error("Decryption failed - likely incorrect password");
  }

  const pkcs8Der = decipher.output.getBytes();
  const asn1 = forge.asn1.fromDer(pkcs8Der);
  return forge.pki.privateKeyFromAsn1(asn1);
}

/* ================= FILE KEY MANAGEMENT ================= */

/**
 * Generates a random AES-256 key for a file.
 */
export function generateFileKey(): string {
  return forge.random.getBytesSync(32);
}

/**
 * Encrypts a file key (AES) with an RSA public key using RSA-OAEP.
 */
export function wrapFileKey(fileKey: string, publicKey: forge.pki.rsa.PublicKey): string {
  const wrapped = publicKey.encrypt(fileKey, "RSA-OAEP", {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha256.create(),
    },
  });
  return Buffer.from(wrapped, "binary").toString("base64");
}

/**
 * Decrypts a file key (AES) with an RSA private key using RSA-OAEP.
 */
export function unwrapFileKey(
  wrappedKeyBase64: string,
  privateKey: forge.pki.rsa.PrivateKey
): string {
  const wrapped = Buffer.from(wrappedKeyBase64, "base64").toString("binary");
  return privateKey.decrypt(wrapped, "RSA-OAEP", {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha256.create(),
    },
  });
}

/* ================= DATA ENCRYPTION ================= */

/**
 * Encrypts data with an AES-256-GCM key.
 */
export async function encryptData(
  data: ArrayBuffer | string,
  key: string
): Promise<{ encrypted: string; iv: string }> {
  const iv = forge.random.getBytesSync(12);
  const cipher = forge.cipher.createCipher("AES-GCM", key);

  cipher.start({ iv });
  const dataBinary = typeof data === "string" ? data : Buffer.from(data).toString("binary");
  cipher.update(forge.util.createBuffer(dataBinary));
  cipher.finish();

  const encrypted = cipher.output.getBytes();
  const tag = cipher.mode.tag.getBytes();

  // We match the dummy website's likely expectation of IV + Encrypted + Tag
  // However, looking at Dashboard.jsx in dummy:
  // const iv = combined.slice(0, 12);
  // const encrypted = combined.slice(12);
  // It seems they expect IV and Encrypted (with tag appended if using forge/standard AES-GCM)

  return {
    encrypted: encrypted + tag,
    iv: iv,
  };
}

/**
 * Decrypts data with an AES-256-GCM key.
 */
export async function decryptData(
  encryptedWithTag: string | Uint8Array,
  iv: string | Uint8Array,
  key: string
): Promise<ArrayBuffer> {
  const encryptedStr = typeof encryptedWithTag === "string" ? encryptedWithTag : Buffer.from(encryptedWithTag).toString("binary");
  const ivStr = typeof iv === "string" ? iv : Buffer.from(iv).toString("binary");

  const tag = encryptedStr.slice(-16);
  const ciphertext = encryptedStr.slice(0, -16);

  const decipher = forge.cipher.createDecipher("AES-GCM", key);
  decipher.start({ iv: ivStr, tag: forge.util.createBuffer(tag) });
  decipher.update(forge.util.createBuffer(ciphertext));
  const pass = decipher.finish();

  if (!pass) {
    throw new Error("Data decryption failed");
  }

  const output = decipher.output.getBytes();
  return Buffer.from(output, "binary").buffer;
}
