import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Get or derive a 32-byte encryption key
function getEncryptionKey(): Buffer {
  const secret =
    process.env.EMAIL_ENCRYPTION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "jinnah-hardware-store-secure-email-key-2026-fallback-x89";

  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a plain text password or secret string using AES-256-GCM.
 * Output format: hex(iv):hex(authTag):hex(encrypted)
 */
export function encryptCredential(plainText?: string | null): string {
  if (!plainText) return "";

  // If already encrypted format, return as is
  if (isEncryptedFormat(plainText)) {
    return plainText;
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 */
export function decryptCredential(encryptedString?: string | null): string {
  if (!encryptedString) return "";

  // If not encrypted format, return as is (fallback for transition)
  if (!isEncryptedFormat(encryptedString)) {
    return encryptedString;
  }

  try {
    const parts = encryptedString.split(":");
    if (parts.length !== 3) return encryptedString;

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encryptedText = parts[2];

    const key = getEncryptionKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("[Email Crypto] Decryption failed:", error);
    return "";
  }
}

/**
 * Checks if a string matches the encrypted format (iv:tag:data)
 */
export function isEncryptedFormat(str?: string | null): boolean {
  if (!str) return false;
  const parts = str.split(":");
  return (
    parts.length === 3 &&
    parts[0].length === IV_LENGTH * 2 &&
    parts[1].length === AUTH_TAG_LENGTH * 2 &&
    /^[0-9a-fA-F]+$/.test(parts[0]) &&
    /^[0-9a-fA-F]+$/.test(parts[1])
  );
}

/**
 * Masks a sensitive string for client-side display (e.g. "••••••••")
 */
export function maskSensitive(str?: string | null): string {
  if (!str) return "";
  return "••••••••";
}
