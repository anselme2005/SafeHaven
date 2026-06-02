// ============================================================
// server/utils/sanitize.js
// Input sanitization — XSS and NoSQL injection protection
// ============================================================

const xss          = require('xss');
const mongoSanitize = require('mongo-sanitize');

// Sanitize a single string against XSS attacks
// Strips dangerous HTML tags and attributes
const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  return xss(value.trim());
};

// Sanitize a value against NoSQL injection
// Removes any keys starting with $ or containing .
// which MongoDB uses for operators
const sanitizeQuery = (value) => {
  return mongoSanitize(value);
};

// Sanitize a free-text string against both XSS and NoSQL injection
const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  return sanitizeString(mongoSanitize(value));
};

module.exports = { sanitizeString, sanitizeQuery, sanitizeInput };