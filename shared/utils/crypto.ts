import crypto from 'crypto';

// Default 32-byte hex key for development fallback if env variable is unset
const DEFAULT_KEY_HEX =
  '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

function getEncryptionKey(): Buffer {
  const keyHex = process.env.PHI_ENCRYPTION_KEY || DEFAULT_KEY_HEX;
  const keyBuffer = Buffer.from(keyHex.slice(0, 64), 'hex');
  if (keyBuffer.length < 32) {
    // Pad or hash to 32 bytes if needed
    return crypto.createHash('sha256').update(keyHex).digest();
  }
  return keyBuffer.subarray(0, 32);
}

/**
 * Encrypts plaintext string (e.g. Patient Name) using AES-256-GCM.
 * Output format: byte buffer containing iv (12b) + authTag (16b) + ciphertext
 */
export function encryptPatientName(name: string): Buffer {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(name.trim(), 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Return combined Buffer: IV + AuthTag + EncryptedBytes
  return Buffer.concat([iv, authTag, encrypted]);
}

/**
 * Decrypts BYTEA / Buffer back to plaintext name using AES-256-GCM
 */
export function decryptPatientName(encryptedBuffer: Buffer): string {
  try {
    if (!encryptedBuffer || encryptedBuffer.length < 28) {
      return '[ENCRYPTED PHI]';
    }
    const key = getEncryptionKey();
    const iv = encryptedBuffer.subarray(0, 12);
    const authTag = encryptedBuffer.subarray(12, 28);
    const ciphertext = encryptedBuffer.subarray(28);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch {
    return '[ENCRYPTED PHI]';
  }
}

/**
 * Generates unique SHA-256 MRN Hash from patient identifiers (Name, DOB, Gender, timestamp)
 */
export function generateMrnHash(
  name: string,
  dob: string,
  gender: string
): string {
  const payload = `${name.toLowerCase().trim()}|${dob}|${gender}|${Date.now()}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Masks PHI for non-authorized roles or system admin views
 */
export function maskPatientName(name?: string): string {
  if (!name) return 'Patient [Masked]';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0][0] + '***';
  }
  return `${parts[0][0]}*** ${parts[parts.length - 1][0]}***`;
}
