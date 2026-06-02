// ============================================================
// validators/reportValidator.js
// Input validation rules for report submission
// ============================================================
// These are pure express-validator chains.
// They run before the controller — if any check fails,
// the controller never executes.
// ============================================================

const { body } = require('express-validator');
const { ABUSE_TYPES, URGENCY_LEVELS, CONTACT_METHODS } = require('../utils/constants');

const reportValidator = [

  // abuseType must be one of the defined categories
  body('abuseType')
    .trim()
    .notEmpty().withMessage('Abuse type is required.')
    .isIn(ABUSE_TYPES).withMessage('Invalid abuse type selected.'),

  // incidentDescription must exist and have meaningful length
  body('incidentDescription')
    .trim()
    .notEmpty().withMessage('Incident description is required.')
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters.')
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters.'),

  // urgencyLevel must be one of the defined levels
  body('urgencyLevel')
    .trim()
    .notEmpty().withMessage('Urgency level is required.')
    .isIn(URGENCY_LEVELS).withMessage('Invalid urgency level.'),

  // contactMethod must be one of the defined options
  body('contactMethod')
    .trim()
    .notEmpty().withMessage('Contact method is required.')
    .isIn(CONTACT_METHODS).withMessage('Invalid contact method.'),

  // contactValue is required ONLY when contactMethod is email or phone
  // If contactMethod is anonymous, contactValue is ignored entirely
  body('contactValue')
    .if(body('contactMethod').isIn(['email', 'phone']))
    .notEmpty().withMessage('Contact value is required when a contact method is selected.')
    .if(body('contactMethod').equals('email'))
    .isEmail().withMessage('A valid email address is required.'),

  // location is optional — just sanitize it if provided
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Location cannot exceed 200 characters.')

];

module.exports = { reportValidator };