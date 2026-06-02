// ============================================================
// routes/adminRoutes.js
// Admin routes — all except login are JWT protected
// ============================================================

const express = require('express');
const router  = express.Router();

const {
  loginAdmin,
  getAllReports,
  getReportById,
  updateReportStatus,
  addResponse,
  reopenCase
} = require('../controllers/adminController');

const { protect } = require('../middleware/authMiddleware');

const {
  loginValidator,
  statusUpdateValidator,
  responseValidator
} = require('../validators/adminValidator');

const { adminLoginLimiter } = require('../middleware/rateLimiter');

// POST /api/admin/login — public, but rate limited
router.post('/login', adminLoginLimiter, loginValidator, loginAdmin);

// All routes below this line require a valid JWT
router.use(protect);

// GET  /api/admin/reports         — list all reports (filterable)
router.get('/reports', getAllReports);

// GET  /api/admin/reports/:id     — view a single report (decrypts contactValue)
router.get('/reports/:id', getReportById);

// PATCH /api/admin/reports/:id/status  — update report status
router.patch('/reports/:id/status', statusUpdateValidator, updateReportStatus);

// PATCH /api/admin/reports/:id/respond — add a response to a report
router.patch('/reports/:id/respond', responseValidator, addResponse);

// PATCH /api/admin/reports/:id/reopen  — reopen a resolved case
router.patch('/reports/:id/reopen', reopenCase);

module.exports = router;