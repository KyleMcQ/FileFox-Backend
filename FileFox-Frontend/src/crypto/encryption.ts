import nacl from "tweetnacl";
import * as SecureStore from "expo-secure-store";
import { Buffer } from "buffer";

/* ================= KEY STORAGE ================= */

const PRIVATE_KEY = "privateKey";
const PUBLIC_KEY = "publicKey";

export async function generateKeyPair() {
  const keyPair = nacl.box.keyPair();

  await SecureStore.setItemAsync(
    PUBLIC_KEY,
    Buffer.from(keyPair.publicKey).toString("base64")
  );

  await SecureStore.setItemAsync(
    PRIVATE_KEY,
    Buffer.from(keyPair.secretKey).toString("base64")
  );

  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.secretKey,
  };
}

export async function getKeyPair() {
  const pub = await SecureStore.getItemAsync(PUBLIC_KEY);
  const priv = await SecureStore.getItemAsync(PRIVATE_KEY);

  if (!pub || !priv) return null;

  return {
    publicKey: new Uint8Array(Buffer.from(pub, "base64")),
    privateKey: new Uint8Array(Buffer.from(priv, "base64")),
  };
}

/* ================= FILE KEY ================= */

export function generateFileKey(): Uint8Array {
  return nacl.randomBytes(32);
}

/* ================= ENCRYPT DATA ================= */

export async function encryptData(
  data: ArrayBuffer,
  key: Uint8Array
): Promise<{ encrypted: Uint8Array; iv: Uint8Array }> {
  const iv = nacl.randomBytes(24);

  const encrypted = nacl.secretbox(new Uint8Array(data), iv, key);

  return { encrypted, iv };
}

/* ================= WRAP FILE KEY ================= */

export function wrapFileKey(
  fileKey: Uint8Array,
  recipientPublicKey: Uint8Array,
  senderSecretKey: Uint8Array
) {
  const nonce = nacl.randomBytes(24);

  const boxed = nacl.box(
    fileKey,
    nonce,
    recipientPublicKey,
    senderSecretKey
  );

  return {
    wrapped: boxed,
    nonce,
  };
}