// ============================================================
// utils/encryptionUtils.js
// AES-256-GCM encryption and decryption for contactValue
// ============================================================
// WHAT gets encrypted:
//   contactValue only (victim's phone number or email)
//
// WHAT does NOT get encrypted:
//   abuseType, urgency, description, token, timestamps, status
//
// HOW it works:
//   - Algorithm : AES-256-GCM (authenticated encryption)
//   - Key source: ENCRYPTION_KEY in .env (64-char hex = 32 bytes)
//   - A fresh random 12-byte IV is generated for EVERY encryption
//     operation — never reused
//   - The IV, auth tag, and ciphertext are joined as one string:
//     "iv:authTag:ciphertext"
//   - This single string is what gets stored in MongoDB
//   - Decryption splits the string and reconstructs all three parts
//
// WHY GCM:
//   GCM provides both encryption AND authentication. The auth tag
//   means we can detect if the ciphertext was tampered with before
//   we decrypt it. This matters for a security-sensitive platform.
//
// IF THE DATABASE IS DUMPED:
//   Without the ENCRYPTION_KEY (which lives only in .env on Render),
//   the stored ciphertext is completely unreadable.
// ============================================================

const crypto = require('crypto');

// Algorithm used for encryption
const ALGORITHM = 'aes-256-gcm';

// IV length in bytes — 12 bytes is the recommended size for GCM
const IV_LENGTH = 12;


// --- getKey ---
// Reads the hex encryption key from .env and converts it to a
// 32-byte Buffer that Node's crypto module can use directly.
// Called inside encrypt/decrypt rather than at module load time
// so that missing env vars produce a clear error at the point of use.
const getKey = () => {
  const hexKey = process.env.ENCRYPTION_KEY;

  if (!hexKey || hexKey.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }

  return Buffer.from(hexKey, 'hex');
};


// --- encrypt ---
// Takes a plain-text string (phone number or email).
// Returns a single string: "iv:authTag:ciphertext" (all hex-encoded).
// Returns null if the input is null or empty (anonymous contact method).
const encrypt = (plainText) => {

  // Nothing to encrypt for anonymous submissions
  if (!plainText) return null;

  const key = getKey();

  // Fresh random IV for every encryption — NEVER reuse an IV with the same key
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create the cipher instance
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt the plain text
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final()
  ]);

  // GCM produces an authentication tag — must be saved alongside the ciphertext
  // getAuthTag() MUST be called after cipher.final()
  const authTag = cipher.getAuthTag();

  // Serialize as "iv:authTag:ciphertext" — all three parts hex-encoded
  // This single string is what gets stored in MongoDB contactValue field
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
};


// --- decrypt ---
// Takes the stored "iv:authTag:ciphertext" string from MongoDB.
// Returns the original plain-text string.
// Returns null if the input is null (anonymous contact method).
// Throws if the ciphertext has been tampered with (GCM auth tag mismatch).
const decrypt = (storedValue) => {

  // Nothing to decrypt for anonymous submissions
  if (!storedValue) return null;

  const key = getKey();

  // Split the stored string back into its three components
  const parts = storedValue.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted value format. Expected "iv:authTag:ciphertext".');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  // Reconstruct Buffers from hex
  const iv        = Buffer.from(ivHex,        'hex');
  const authTag   = Buffer.from(authTagHex,   'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  // Create the decipher instance
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  // Set the auth tag so GCM can verify the data hasn't been tampered with
  // If the tag doesn't match, decipher.final() will throw — this is intentional
  decipher.setAuthTag(authTag);

  // Decrypt and return as a UTF-8 string
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
};


module.exports = { encrypt, decrypt };