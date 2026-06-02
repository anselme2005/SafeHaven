// ============================================================
// models/Report.js
// Mongoose schema for abuse reports — the core data object
// ============================================================

const mongoose = require('mongoose');
const {
  ABUSE_TYPES,
  URGENCY_LEVELS,
  REPORT_STATUS,
  CONTACT_METHODS
} = require('../utils/constants');


// --- Sub-schema: Admin Response ---
// Each object in the adminResponses array follows this shape.
// Entries are append-only — never edited or deleted after creation.
const adminResponseSchema = new mongoose.Schema({

  // The message written by the admin
  responseText: {
    type:     String,
    required: true,
    trim:     true
  },

  // Which admin wrote this response
  // References the Admin collection for the audit trail
  respondedBy: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Admin',
    required: true
  },

  // Exact time this response was added
  respondedAt: {
    type:    Date,
    default: Date.now
  }

});


// --- Main Schema: Report ---
const reportSchema = new mongoose.Schema(
  {
    // Unique token in the format SH-XXXXXXXX
    // Generated in utils/tokenUtils.js BEFORE this document is saved.
    // The token is part of the document from creation — not added after saving.
    trackingToken: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true
    },

    // The category of abuse being reported
    // Must match one of the values in ABUSE_TYPES exactly
    abuseType: {
      type:     String,
      required: true,
      enum:     ABUSE_TYPES
    },

    // Free-text account of what happened, written by the victim
    incidentDescription: {
      type:     String,
      required: true,
      trim:     true
    },

    // How urgently this case needs to be handled
    urgencyLevel: {
      type:     String,
      required: true,
      enum:     URGENCY_LEVELS,
      default:  'low'
    },

    // Current processing state of this report
    // ONLY admins can change this — there is no public PATCH route for reports
    // Transition rules are enforced in the admin controller
    reportStatus: {
      type:    String,
      enum:    REPORT_STATUS,
      default: 'pending'
    },

    // Array of admin responses over time
    // New entries are pushed by the admin controller
    // Appending is blocked when status is 'resolved' unless admin reopens first
    adminResponses: [adminResponseSchema],

    // What contact option the victim chose in Step 4 of the form
    contactMethod: {
      type:     String,
      required: true,
      enum:     CONTACT_METHODS
    },

    // AES-256-GCM encrypted string stored as "iv:authTag:ciphertext"
    // null when contactMethod is 'anonymous'
    // Encrypted before saving, decrypted on-the-fly for authorized admin views only
    contactValue: {
      type:    String,
      default: null
    },

    // Optional location detail from Step 3 of the form
    location: {
      type:    String,
      trim:    true,
      default: null
    }
  },
  {
    // Mongoose auto-manages createdAt and updatedAt
    timestamps: true
  }
);


module.exports = mongoose.model('Report', reportSchema);