// ============================================================
// middleware/rateLimiter.js
// Per-route rate limiters — each route has its own attack profile
// ============================================================
// trust proxy must be set in server.js so that req.ip returns
// the real client IP behind Render/Vercel load balancers,
// not the load balancer's IP (which would make limiting useless).
// ============================================================

const rateLimit = require('express-rate-limit');

// --- Report Submission Limiter ---
// 3 submissions per hour per IP
// Neutralizes automated spam scripts flooding the database
const reportSubmissionLimiter = rateLimit({
  windowMs:    60 * 60 * 1000, // 1 hour
  max:         3,
  message: {
    message: 'Too many reports submitted from this IP. Please try again after an hour.'
  },
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders:   false
});


// --- Token Tracking Limiter ---
// 10 requests per minute per IP
// Stops brute-force token guessing (tokens are short — 8 chars)
const tokenTrackingLimiter = rateLimit({
  windowMs:    60 * 1000, // 1 minute
  max:         10,
  message: {
    message: 'Too many tracking requests. Please wait a moment before trying again.'
  },
  standardHeaders: true,
  legacyHeaders:   false
});


// --- Admin Login Limiter ---
// 5 attempts per 15 minutes per IP
// Neutralizes credential stuffing and dictionary attacks
const adminLoginLimiter = rateLimit({
  windowMs:    15 * 60 * 1000, // 15 minutes
  max:         5,
  message: {
    message: 'Too many login attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders:   false
});


module.exports = {
  reportSubmissionLimiter,
  tokenTrackingLimiter,
  adminLoginLimiter
};