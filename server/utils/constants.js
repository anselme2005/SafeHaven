// ============================================================
// utils/constants.js
// Shared enums used across models, validators, and controllers
// ============================================================
// IMPORTANT: This file has a mirror on the frontend at:
//   client/src/utils/constants.js
//
// If you add, remove, or rename anything here, update the
// client copy too. A mismatch causes silent bugs.
// ============================================================


// --- Abuse Categories ---
// Exact string values stored in MongoDB
const ABUSE_TYPES = [
  'physical',
  'sexual',
  'emotional',
  'cyberbullying',
  'financial',
  'neglect',
  'human_trafficking',
  'other'
];

// Human-readable labels for the frontend form and admin filters
const ABUSE_TYPE_LABELS = {
  physical:          'Physical Abuse',
  sexual:            'Sexual Abuse',
  emotional:         'Emotional / Psychological Abuse',
  cyberbullying:     'Cyberbullying / Online Harassment',
  financial:         'Financial / Economic Abuse',
  neglect:           'Neglect',
  human_trafficking: 'Human Trafficking',
  other:             'Other'
};


// --- Urgency Levels ---
const URGENCY_LEVELS = ['low', 'medium', 'high'];


// --- Report Status ---
// Allowed transitions (enforced in admin controller, not schema):
//   pending      → under_review → resolved
//   pending      → resolved     (direct, for clear-cut cases)
//   resolved     → under_review (admin only, after live chat discussion)
//   under_review → resolved
const REPORT_STATUS = ['pending', 'under_review', 'resolved'];


// --- Contact Methods ---
const CONTACT_METHODS = ['anonymous', 'email', 'phone'];


// --- Audit Log Action Types ---
// Every admin action that is recorded in the AuditLog collection.
// Add new action types here when you add new admin capabilities.
const AUDIT_ACTIONS = {
  REPORT_VIEWED:  'REPORT_VIEWED',   // Admin opened a report detail page
  STATUS_CHANGED: 'STATUS_CHANGED',  // Admin changed reportStatus
  RESPONSE_ADDED: 'RESPONSE_ADDED',  // Admin appended a response
  CASE_REOPENED:  'CASE_REOPENED'    // Admin moved resolved → under_review
};


module.exports = {
  ABUSE_TYPES,
  ABUSE_TYPE_LABELS,
  URGENCY_LEVELS,
  REPORT_STATUS,
  CONTACT_METHODS,
  AUDIT_ACTIONS
};