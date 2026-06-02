// ============================================================
// models/AuditLog.js
// Mongoose schema for admin action audit logs
// ============================================================
// Every meaningful admin action is recorded here as a separate
// document — not embedded inside the Report document.
//
// Keeping this as its own collection means:
//   - Report documents stay clean and don't grow unboundedly
//   - You can query all actions across all reports independently
//   - The full accountability trail is easy to read and filter
// ============================================================

const mongoose = require('mongoose');
const { AUDIT_ACTIONS } = require('../utils/constants');

const auditLogSchema = new mongoose.Schema(
  {
    // Which admin performed this action
    adminId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Admin',
      required: true
    },

    // What the admin did — must be one of the defined AUDIT_ACTIONS values
    action: {
      type:     String,
      required: true,
      enum:     Object.values(AUDIT_ACTIONS)
    },

    // Which report this action was performed on
    reportId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Report',
      required: true
    },

    // What the value was before the action (null for view events)
    previousValue: {
      type:    mongoose.Schema.Types.Mixed,
      default: null
    },

    // What the value became after the action (null for view events)
    newValue: {
      type:    mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    // createdAt on this document IS the timestamp of the admin action
    timestamps: true
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);