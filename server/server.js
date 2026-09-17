// SmartNest AI Express Payment Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {
  createCheckout,
  verifyPayment,
  cancelSubscription,
  handleWebhook
} = require('./paymentController');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Capture raw body for webhook verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'SmartNest Payment Gateway Server',
    razorpay_configured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    timestamp: new Date().toISOString()
  });
});

// Subscription Endpoints
app.post('/api/subscriptions/create', createCheckout);
app.post('/api/subscriptions/verify', verifyPayment);
app.post('/api/subscriptions/:subscriptionId/cancel', cancelSubscription);
app.post('/api/payments/webhook/razorpay', handleWebhook);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SmartNest Payment Server running on port ${PORT}`);
  });
}

module.exports = app;
