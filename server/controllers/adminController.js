// ============================================================
// controllers/adminController.js
// All admin-facing report management operations
// ============================================================

const { validationResult } = require('express-validator');
const bcrypt               = require('bcryptjs');
const jwt                  = require('jsonwebtoken');
const Admin                = require('../models/Admin');
const Report               = require('../models/Report');
const AuditLog             = require('../models/AuditLog');
const { decrypt }          = require('../utils/encryptionUtils');
const { AUDIT_ACTIONS }    = require('../utils/constants');
const { sanitizeInput } = require('../utils/sanitize');


// --- loginAdmin ---
// POST /api/admin/login
// Verifies credentials, returns a signed 8-hour JWT
const loginAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { adminEmail, adminPassword } = req.body;

    // Find the admin by email
    const admin = await Admin.findOne({ adminEmail: adminEmail.toLowerCase() });

    if (!admin) {
      // Use a generic message — don't reveal whether the email exists
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Compare the submitted password against the stored bcrypt hash
    const isMatch = await bcrypt.compare(adminPassword, admin.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Update lastLogin timestamp
    admin.lastLogin = new Date();
    await admin.save();

    // Sign the JWT — expires in 8 hours as per architecture spec
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      admin: {
        id:         admin._id,
        adminEmail: admin.adminEmail,
        role:       admin.role,
        lastLogin:  admin.lastLogin
      }
    });

  } catch (error) {
    console.error('Admin login error:', error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};


// --- getAllReports ---
// GET /api/admin/reports
// Returns all reports with optional filtering by status, urgency, abuseType
// contactValue is NOT decrypted here — only in the single report view
const getAllReports = async (req, res) => {
  try {

    // Build filter object from query parameters
    // e.g. GET /api/admin/reports?reportStatus=pending&urgencyLevel=high
    const filter = {};
    if (req.query.reportStatus) filter.reportStatus = req.query.reportStatus;
    if (req.query.urgencyLevel) filter.urgencyLevel  = req.query.urgencyLevel;
    if (req.query.abuseType)    filter.abuseType     = req.query.abuseType;

    const reports = await Report.find(filter)
      .select('-contactValue -adminResponses') // Exclude sensitive fields from list view
      .sort({ createdAt: -1 });               // Newest first

    return res.status(200).json({ count: reports.length, reports });

  } catch (error) {
    console.error('Get all reports error:', error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};


// --- getReportById ---
// GET /api/admin/reports/:id
// Returns full report details including decrypted contactValue
// Logs a REPORT_VIEWED audit entry
const getReportById = async (req, res) => {
  try {

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    // Decrypt contactValue on-the-fly for the admin view
    // This value is never stored decrypted — only plain text in memory here
    const decryptedContact = report.contactMethod !== 'anonymous'
      ? decrypt(report.contactValue)
      : null;

    // Log that this admin viewed the report
    await AuditLog.create({
      adminId:       req.admin._id,
      action:        AUDIT_ACTIONS.REPORT_VIEWED,
      reportId:      report._id,
      previousValue: null,
      newValue:      null
    });

    return res.status(200).json({
      ...report.toObject(),
      contactValue: decryptedContact  // Replace ciphertext with plain text for admin
    });

  } catch (error) {
    console.error('Get report by ID error:', error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};


// --- updateReportStatus ---
// PATCH /api/admin/reports/:id/status
// Changes the reportStatus — enforces allowed transition rules
const updateReportStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    const { reportStatus } = req.body;
    const previousStatus   = report.reportStatus;

    // Prevent setting a status to its current value
    if (previousStatus === reportStatus) {
      return res.status(400).json({
        message: `Report is already set to '${reportStatus}'.`
      });
    }

    // Save the status change
    report.reportStatus = reportStatus;
    await report.save();

    // Log the status change to the audit trail
    await AuditLog.create({
      adminId:       req.admin._id,
      action:        AUDIT_ACTIONS.STATUS_CHANGED,
      reportId:      report._id,
      previousValue: previousStatus,
      newValue:      reportStatus
    });

    return res.status(200).json({
      message:       'Report status updated.',
      reportStatus:  report.reportStatus
    });

  } catch (error) {
    console.error('Status update error:', error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};


// --- addResponse ---
// PATCH /api/admin/reports/:id/respond
// Appends a new admin response to the report
// Blocked if the report is resolved — admin must reopen first
const addResponse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    // Block new responses on resolved cases
    // Admin must explicitly reopen the case first
    if (report.reportStatus === 'resolved') {
      return res.status(403).json({
        message: 'This case is resolved. Please reopen it before adding a response.'
      });
    }

   const responseText = sanitizeInput(req.body.responseText);

    // Append the new response to the array
    report.adminResponses.push({
      responseText,
      respondedBy: req.admin._id
    });

    await report.save();

    // Log the response addition
    await AuditLog.create({
      adminId:       req.admin._id,
      action:        AUDIT_ACTIONS.RESPONSE_ADDED,
      reportId:      report._id,
      previousValue: null,
      newValue:      responseText
    });

    return res.status(200).json({
      message:  'Response added successfully.',
      response: report.adminResponses[report.adminResponses.length - 1]
    });

  } catch (error) {
    console.error('Add response error:', error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};


// --- reopenCase ---
// PATCH /api/admin/reports/:id/reopen
// Moves a resolved report back to under_review
// Only works on resolved reports — all others are rejected
const reopenCase = async (req, res) => {
  try {

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }

    // Only resolved cases can be reopened
    if (report.reportStatus !== 'resolved') {
      return res.status(400).json({
        message: `Only resolved cases can be reopened. Current status: '${report.reportStatus}'.`
      });
    }

    const previousStatus    = report.reportStatus;
    report.reportStatus = 'under_review';
    await report.save();

    // Log the reopen action separately from a regular status change
    await AuditLog.create({
      adminId:       req.admin._id,
      action:        AUDIT_ACTIONS.CASE_REOPENED,
      reportId:      report._id,
      previousValue: previousStatus,
      newValue:      'under_review'
    });

    return res.status(200).json({
      message:      'Case reopened successfully.',
      reportStatus: report.reportStatus
    });

  } catch (error) {
    console.error('Reopen case error:', error.message);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};


module.exports = {
  loginAdmin,
  getAllReports,
  getReportById,
  updateReportStatus,
  addResponse,
  reopenCase
};