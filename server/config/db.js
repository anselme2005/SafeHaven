// ============================================================
// config/db.js
// MongoDB connection using Mongoose
// ============================================================
// Called once at startup from server.js.
// If the connection fails the process exits — the server
// cannot function without a database.
// ============================================================

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    // Exit with failure code so Render knows to restart the service
    process.exit(1);
  }
};

module.exports = connectDB;