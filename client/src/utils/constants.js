// ============================================================
// src/utils/constants.js
// Frontend mirror of server/utils/constants.js
// ============================================================
// IMPORTANT: Keep this in sync with the server copy at all times.
// If you change a value on the server, change it here too.
// ============================================================


// Abuse categories — values must match the server enums exactly
export const ABUSE_TYPES = [
  'physical',
  'sexual',
  'emotional',
  'cyberbullying',
  'financial',
  'neglect',
  'human_trafficking',
  'other'
];

// Human-readable labels for form dropdowns and admin filters
export const ABUSE_TYPE_LABELS = {
  physical:          'Physical Abuse',
  sexual:            'Sexual Abuse',
  emotional:         'Emotional / Psychological Abuse',
  cyberbullying:     'Cyberbullying / Online Harassment',
  financial:         'Financial / Economic Abuse',
  neglect:           'Neglect',
  human_trafficking: 'Human Trafficking',
  other:             'Other'
};

// Urgency levels
export const URGENCY_LEVELS = ['low', 'medium', 'high'];

// Report status values
export const REPORT_STATUS = ['pending', 'under_review', 'resolved'];

// Contact method options
export const CONTACT_METHODS = ['anonymous', 'email', 'phone'];