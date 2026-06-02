// ============================================================
// controllers/reportController.js
// Handles public report submission and token tracking
// ============================================================

const { validationResult } = require('express-validator');
const Report               = require('../models/Report');
const { generateUniqueToken } = require('../utils/tokenUtils');
const { encrypt }          = require('../utils/encryptionUtils');
const { notifyAdmin } = require('../services/emailService');
const { sanitizeInput } = require('../utils/sanitize');


// --- submitReport ---
// POST /api/reports
// Validates input → generates token → encrypts contactValue
// → saves report → triggers EmailJS → returns token to user
const submitReport = async (req, res) => {
  try {

    // Check for validation errors from the validator middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      abuseType,
      incidentDescription,
      urgencyLevel,
      contactMethod,
      contactValue,
      location
    } = req.body;

     // Sanitize all free-text fields before saving
    // abuseType, urgencyLevel, and contactMethod are enum-validated
    // so they don't need sanitization — only free-text fields do
    const cleanDescription = sanitizeInput(incidentDescription);
    const cleanLocation    = sanitizeInput(location);
    const cleanContact     = sanitizeInput(contactValue);

    // Generate unique token BEFORE creating the document
    // The token is part of the document from the start
    const trackingToken = await generateUniqueToken();

    // Encrypt contactValue if the victim provided one
    // If contactMethod is 'anonymous', encrypt() returns null
    const encryptedContact = contactMethod === 'anonymous'
      ? null
      : encrypt(cleanContact);

    // Build and save the report document
    const report = await Report.create({
      trackingToken,
      abuseType,
      incidentDescription: cleanDescription,
      urgencyLevel,
      contactMethod,
      contactValue:        encryptedContact,
      location:            cleanLocation || null
    });

   // Trigger admin email alert — non-blocking side effect
    // Report is already saved at this point. Email failure does
    // NOT affect the victim's token response in any way.
    try {
      await notifyAdmin(report);
    } catch (emailError) {
      console.error('EmailJS notification failed:', emailError.message);
    }

    // Return only the tracking token — nothing else
    // The victim needs this token to check their report status later
    return res.status(201).json({
      message:       'Your report has been submitted successfully.',
      trackingToken: report.trackingToken
    });

  } catch (error) {
    console.error('Report submission error:', error.message);
    return res.status(500).json({
      message: 'Something went wrong. Please try again.'
    });
  }
};


// --- trackReport ---
// GET /api/reports/track/:token
// Returns safe public-facing fields only
// NEVER exposes contactValue, adminId references, or internal fields
const trackReport = async (req, res) => {
  try {
    const { token } = req.params;

    // Find the report by tracking token
    const report = await Report.findOne({ trackingToken: token });

    if (!report) {
      return res.status(404).json({
        message: 'No report found with that tracking token. Please check and try again.'
      });
    }

    // Build a sanitized response object
    // Only include fields that are safe to expose publicly
    // contactValue, contactMethod, and internal IDs are deliberately excluded
    const safeResponse = {
      trackingToken:       report.trackingToken,
      abuseType:           report.abuseType,
      urgencyLevel:        report.urgencyLevel,
      reportStatus:        report.reportStatus,
      location:            report.location,
      submittedAt:         report.createdAt,
      lastUpdated:         report.updatedAt,

      // Only return the text and timestamp of each admin response
      // respondedBy (admin ID) is intentionally excluded
      adminResponses: report.adminResponses.map(r => ({
        responseText: r.responseText,
        respondedAt:  r.respondedAt
      }))
    };

    return res.status(200).json(safeResponse);

  } catch (error) {
    console.error('Report tracking error:', error.message);
    return res.status(500).json({
      message: 'Something went wrong. Please try again.'
    });
  }
};


module.exports = { submitReport, trackReport };