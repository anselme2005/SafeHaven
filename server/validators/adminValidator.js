// ============================================================
// validators/adminValidator.js
// Input validation rules for admin routes
// ============================================================

const { body } = require('express-validator');

// --- Login Validator ---
const loginValidator = [

  body('adminEmail')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('A valid email address is required.')
    .normalizeEmail(),

  body('adminPassword')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')

];

// --- Status Update Validator ---
const statusUpdateValidator = [

  body('reportStatus')
    .trim()
    .notEmpty().withMessage('Report status is required.')
    .isIn(['pending', 'under_review', 'resolved'])
    .withMessage('Invalid status value.')

];

// --- Response Validator ---
const responseValidator = [

  body('responseText')
    .trim()
    .notEmpty().withMessage('Response text is required.')
    .isLength({ min: 5 }).withMessage('Response must be at least 5 characters.')
    .isLength({ max: 2000 }).withMessage('Response cannot exceed 2000 characters.')

];

module.exports = { loginValidator, statusUpdateValidator, responseValidator };