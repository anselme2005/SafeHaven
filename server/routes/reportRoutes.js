// ============================================================
// routes/reportRoutes.js
// Public routes — no authentication required
// ============================================================

const express = require('express');
const router  = express.Router();

const { submitReport, trackReport }     = require('../controllers/reportController');
const { reportValidator }               = require('../validators/reportValidator');
const { reportSubmissionLimiter, tokenTrackingLimiter } = require('../middleware/rateLimiter');

// POST /api/reports — submit a new abuse report
router.post(
  '/',
  reportSubmissionLimiter,  // Max 3 per hour per IP
  reportValidator,          // Validate all fields before controller runs
  submitReport
);

// GET /api/reports/track/:token — look up a report by tracking token
router.get(
  '/track/:token',
  tokenTrackingLimiter,     // Max 10 per minute per IP (anti brute-force)
  trackReport
);

module.exports = router;