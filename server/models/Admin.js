// ============================================================
// models/Admin.js
// Mongoose schema for admin accounts
// ============================================================
// There is only one admin account in V1.
// Created once via scripts/seedAdmin.js — never through a public route.
// ============================================================

const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    // Admin login email
    adminEmail: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
      lowercase: true
    },

    // bcrypt hash of the admin password
    // The plain-text password is NEVER stored anywhere in the system
    passwordHash: {
      type:     String,
      required: true
    },

    // Role field kept for potential future expansion (e.g. super_admin)
    // In V1 this is always 'admin'
    role: {
      type:    String,
      default: 'admin'
    },

    // Updated every time the admin successfully logs in
    // Useful for security auditing
    lastLogin: {
      type:    Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Admin', adminSchema);