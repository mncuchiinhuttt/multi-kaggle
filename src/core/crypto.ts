import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard 96-bit IV for GCM
const SALT = "multi-kaggle-static-salt-v1";

/**
 * Derives a consistent 32-byte key from a secret passphrase.
 */
function deriveKey(secret: string): Buffer {
  return scryptSync(secret, SALT, 32);
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 */
export function encryptApiKey(
  plainText: string,
  secretKey: string
): { encrypted: string; iv: string } {
  if (!plainText) {
    throw new Error("Cannot encrypt empty text");
  }
  const key = deriveKey(secretKey);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  // Format: encryptedCiphertext + authTag
  return {
    encrypted: `${encrypted}:${authTag}`,
    iv: iv.toString("hex"),
  };
}

/**
 * Decrypts ciphertext with auth tag validation using AES-256-GCM.
 */
export function decryptApiKey(
  encryptedWithTag: string,
  ivHex: string,
  secretKey: string
): string {
  const parts = encryptedWithTag.split(":");
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted format. Expected ciphertext:authTag");
  }

  const [ciphertext, authTagHex] = parts;
  const key = deriveKey(secretKey);
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
