// ============================================================
// server.js
// Entry point — configures Express and starts the server
// ============================================================

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const dotenv  = require('dotenv');

// Load .env variables first — before anything reads process.env
dotenv.config();

const connectDB      = require('./config/db');
const reportRoutes   = require('./routes/reportRoutes');
const adminRoutes    = require('./routes/adminRoutes');

const app = express();

// --- Database Connection ---
connectDB();

// --- Trust Proxy ---
// Required so express-rate-limit reads the real client IP
// from X-Forwarded-For behind Render/Vercel load balancers
// Without this, all requests appear to come from the same IP
// and rate limiting becomes completely ineffective
app.set('trust proxy', 1);

// --- Security Middleware ---
app.use(helmet());

// --- CORS ---
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// --- Body Parser ---
app.use(express.json());

// --- Input Sanitization ---
// express-mongo-sanitize strips $ and . from req.body, req.params,
// and req.query to prevent NoSQL injection attacks against MongoDB

// --- Routes ---
app.use('/api/reports', reportRoutes);
app.use('/api/admin',   adminRoutes);

// --- Health Check ---
// Visit http://localhost:5000/api/health to confirm server is up
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'SafeHaven server is running.' });
});

// --- 404 Handler ---
// Catches any request to a route that doesn't exist
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// --- Global Error Handler ---
// Catches any unhandled errors thrown by controllers or middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: 'An unexpected error occurred.' });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});