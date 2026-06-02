// ============================================================
// middleware/authMiddleware.js
// JWT verification middleware for protected admin routes
// ============================================================
// Attach this middleware to any route that requires admin access.
// If the token is missing, invalid, or expired, the request is
// rejected with a 401 before the controller ever runs.
// On success, req.admin is populated with the decoded payload
// so controllers can read req.admin.id and req.admin.role.
// ============================================================

const jwt   = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  try {
    // The token is expected in the Authorization header as:
    // "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access denied. No token provided.'
      });
    }

    // Extract the token string after "Bearer "
    const token = authHeader.split(' ')[1];

    // Verify the token using the JWT secret
    // If expired or tampered with, jwt.verify() throws and we hit the catch block
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Confirm the admin still exists in the database
    // This catches the edge case where an admin account was deleted
    // but their token hasn't expired yet
    const admin = await Admin.findById(decoded.id).select('-passwordHash');

    if (!admin) {
      return res.status(401).json({
        message: 'Access denied. Admin account not found.'
      });
    }

    // Attach the admin object to the request for use in controllers
    req.admin = admin;

    // Pass control to the next middleware or controller
    next();

  } catch (error) {

    // jwt.verify() throws 'TokenExpiredError' when the 8-hour window has passed
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Session expired. Please log in again.'
      });
    }

    // Any other JWT error (malformed, wrong signature, etc.)
    return res.status(401).json({
      message: 'Invalid token. Access denied.'
    });
  }
};

module.exports = { protect };