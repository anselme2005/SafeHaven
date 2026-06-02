// ============================================================
// utils/tokenUtils.js
// Tracking token generation with collision retry loop
// ============================================================
// Token format: SH-XXXXXXXX
//   - "SH" prefix is mandatory (stands for SafeHaven)
//   - 8 uppercase alphanumeric characters follow the dash
//   - Generated using Node's native crypto module
//   - Uniqueness is verified against MongoDB before returning
//   - If a collision is found, a new token is generated and
//     rechecked. Retries up to MAX_RETRIES times.
//   - If all retries collide (astronomically unlikely), an
//     error is thrown and the submission returns a 500.
// ============================================================

const crypto    = require('crypto');
const Report    = require('../models/Report');

// Characters allowed in the random portion of the token
// Uppercase letters + digits only — easy to read, easy to copy
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// Length of the random portion (after "SH-")
const TOKEN_LENGTH = 8;

// Maximum number of generation attempts before giving up
const MAX_RETRIES = 5;


// --- generateRandomSegment ---
// Produces a random string of TOKEN_LENGTH characters
// drawn from the CHARACTERS alphabet using crypto.randomBytes()
// for cryptographically secure randomness.
const generateRandomSegment = () => {
  const bytes = crypto.randomBytes(TOKEN_LENGTH);

  // Map each byte to a character in our alphabet
  // Modulo bias is negligible here given the alphabet size (36)
  // and the security requirements of a tracking token
  return Array.from(bytes)
    .map(byte => CHARACTERS[byte % CHARACTERS.length])
    .join('');
};


// --- generateUniqueToken ---
// Generates a token, checks MongoDB for a collision,
// and retries up to MAX_RETRIES times if needed.
// Returns the unique token string on success.
// Throws an error if all retries are exhausted.
const generateUniqueToken = async () => {

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

    // Build the full token string
    const token = `SH-${generateRandomSegment()}`;

    // Check if this token already exists in the database
    const existing = await Report.findOne({ trackingToken: token });

    if (!existing) {
      // Token is unique — safe to use
      return token;
    }

    // Token collided — log and retry
    console.warn(`Token collision on attempt ${attempt}: ${token}. Retrying...`);
  }

  // All retries exhausted — this should essentially never happen
  // but we handle it properly so the server doesn't crash silently
  throw new Error('Failed to generate a unique tracking token after maximum retries.');
};


module.exports = { generateUniqueToken };