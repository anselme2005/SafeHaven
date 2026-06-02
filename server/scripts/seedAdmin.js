// ============================================================
// scripts/seedAdmin.js
// One-time script to create the first admin account
// ============================================================
// HOW TO RUN (once, during initial deployment):
//   npm run seed
//
// RULES:
//   - Run this ONCE on Render after deployment
//   - If an admin already exists, the script exits safely
//   - Password is read from .env — never hardcoded here
//   - After seeding, you can remove SEED_ADMIN_* from .env
// ============================================================

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const dotenv   = require('dotenv');

dotenv.config();

const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    // Connect directly to MongoDB — this script runs standalone,
    // not through the Express server
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connected.');

    // Guard — if an admin already exists, do nothing and exit
    // This prevents accidental duplicate records if run twice
    const existing = await Admin.findOne({});
    if (existing) {
      console.log('Admin account already exists. Seed skipped.');
      process.exit(0);
    }

    // Read credentials from .env — never hardcode them in this file
    const email    = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error(
        'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env before seeding.'
      );
    }

    // Hash the password with bcrypt before storing
    // Salt rounds of 12 gives strong security without being too slow
    const passwordHash = await bcrypt.hash(password, 12);

    // Create and save the admin record
    const admin = await Admin.create({
      adminEmail:   email,
      passwordHash: passwordHash,
      role:         'admin'
    });

    console.log(`Admin account created successfully: ${admin.adminEmail}`);
    process.exit(0);

  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();