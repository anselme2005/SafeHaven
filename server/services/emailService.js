// ============================================================
// server/services/emailService.js
// EmailJS admin alert notification
// ============================================================
// PURPOSE: Notify the admin by email when a new report is
// submitted. This is a side effect — its failure must NEVER
// affect the victim's submission or token response.
//
// WHAT IS SENT: Only non-sensitive fields.
//   - tracking token
//   - abuse type label
//   - urgency level
//   - submission timestamp
//
// WHAT IS NEVER SENT:
//   - incident description
//   - contact value (phone/email)
//   - any other sensitive information
//
// EmailJS requests pass through third-party servers.
// Treat every payload like a postcard — assume it can be read.
// ============================================================

const { ABUSE_TYPE_LABELS } = require('../utils/constants');

const notifyAdmin = async (report) => {

  // Read credentials from environment variables
  const serviceId   = process.env.EMAILJS_SERVICE_ID;
  const templateId  = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey   = process.env.EMAILJS_PUBLIC_KEY;
  const adminEmail  = process.env.EMAILJS_ADMIN_EMAIL;

  // If any credential is missing, log and skip — don't crash
  if (!serviceId || !templateId || !publicKey || !adminEmail) {
    console.warn('EmailJS credentials not fully configured. Skipping admin notification.');
    return;
  }

  // Build the template parameters
  // These variable names must match exactly what you defined
  // in your EmailJS template
  const templateParams = {
    to_email:      adminEmail,
    tracking_token: report.trackingToken,
    abuse_type:    ABUSE_TYPE_LABELS[report.abuseType] || report.abuseType,
    urgency_level: report.urgencyLevel.toUpperCase(),
    submitted_at:  new Date(report.createdAt).toLocaleString('en-GB', {
      day:    '2-digit',
      month:  'long',
      year:   'numeric',
      hour:   '2-digit',
      minute: '2-digit'
    })
  };

  // EmailJS REST API endpoint
  // We use fetch (available natively in Node 18+) to call their API
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id:   serviceId,
      template_id:  templateId,
      user_id:      publicKey,
      accessToken:  process.env.EMAILJS_PRIVATE_KEY,
      template_params: templateParams
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`EmailJS API error: ${response.status} — ${text}`);
  }

  console.log(`Admin alert sent for report: ${report.trackingToken}`);
};

module.exports = { notifyAdmin };