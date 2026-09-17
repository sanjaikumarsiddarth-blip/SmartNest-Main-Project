// SmartNest AI Express Server (Auth, Payments, Notifications & Data)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {
  createCheckout,
  verifyPayment,
  cancelSubscription,
  handleWebhook,
  testSubscriptionWebhook,
  activateSubscriptionHandler
} = require('./paymentController');
const {
  register,
  login,
  logout
} = require('./authController');
const {
  getNotifications,
  markRead,
  markAllRead
} = require('./notificationController');
const {
  getSubscription,
  getSubscriptionUsage,
  getBuyerPreferences
} = require('./dataController');
const {
  testLeadWebhook,
  getAgentWebhookUrl
} = require('./leadController');
const {
  getSellerEnquiries,
  createEnquiry,
  respondToEnquiry,
  getConversations,
  getConversationById,
  createOrGetConversation,
  sendMessage,
  markConversationAsRead,
  getUnreadCount
} = require('./enquiryController');
const {
  getAdminAnalytics,
  getSubscriptionRevenueMetrics,
  getAllSubscriptions,
  getAllPaymentTransactions,
  getUsers,
  updateUserStatus,
  getSellers,
  updateSellerStatus,
  getProperties,
  approveProperty,
  rejectProperty,
  removeProperty,
  getReports,
  resolveReport,
  getSystemHealth
} = require('./adminController');

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration for frontend development and production
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all dev origins
  },
  credentials: true
}));

// Capture raw body for webhook verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf?.toString() || '';
  }
}));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'SmartNest Backend API Server',
    port: PORT,
    razorpay_configured: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
    supabase_configured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
    agent_webhook_configured: Boolean(getAgentWebhookUrl()),
    seller_webhook_url: getAgentWebhookUrl(),
    subscription_webhook_url: process.env.SNS_SUBSCRIPTION_WEBHOOK_URL || 'https://api.agents.snsihub.ai/webhook/61316be1-7b40-45a7-929e-992052a0274e',
    timestamp: new Date().toISOString()
  });
});

// Authentication Endpoints
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.post('/api/auth/logout', logout);

// Buyer Enquiries & Seller Responses (Two-Way Realtime Flow)
app.get('/api/seller/:sellerId/enquiries', getSellerEnquiries);
app.get('/api/enquiries', getSellerEnquiries);
app.post('/api/property/:id/enquiry', createEnquiry);
app.post('/api/leads/enquiry', createEnquiry);
app.post('/api/seller/enquiry/:enquiryId/respond', respondToEnquiry);
app.post('/api/leads/test-webhook', testLeadWebhook);

// Conversations & Two-Way Buyer-Seller Messaging Endpoints
app.get('/api/conversations', getConversations);
app.get('/api/conversations/unread-count', getUnreadCount);
app.get('/api/conversations/:id', getConversationById);
app.post('/api/conversations', createOrGetConversation);
app.post('/api/conversations/:id/messages', sendMessage);
app.put('/api/conversations/:id/read', markConversationAsRead);
app.get('/api/buyer/preferences/:userId', getBuyerPreferences);

// Admin Operations Endpoints (Powered by Supabase PostgreSQL)
app.get('/api/admin/analytics', getAdminAnalytics);
app.get('/api/admin/subscriptions/revenue', getSubscriptionRevenueMetrics);
app.get('/api/admin/subscriptions', getAllSubscriptions);
app.get('/api/admin/payments', getAllPaymentTransactions);
app.get('/api/admin/users', getUsers);
app.put('/api/admin/user/:id/status', updateUserStatus);
app.get('/api/admin/sellers', getSellers);
app.put('/api/admin/seller/:id/status', updateSellerStatus);
app.get('/api/admin/properties', getProperties);
app.put('/api/admin/property/:id/approve', approveProperty);
app.put('/api/admin/property/:id/reject', rejectProperty);
app.delete('/api/admin/property/:id', removeProperty);
app.get('/api/admin/reports', getReports);
app.put('/api/admin/report/:id/resolve', resolveReport);
app.get('/api/admin/system/health', getSystemHealth);

// Notifications Endpoints
app.get('/api/buyer/notifications/:userId', getNotifications);
app.put('/api/buyer/notifications/:id/read', markRead);
app.put('/api/buyer/notifications/read-all', markAllRead);

// Subscription Endpoints
app.get('/api/subscriptions', getSubscription);
app.get('/api/subscriptions/usage', getSubscriptionUsage);
app.post('/api/subscriptions/activate', activateSubscriptionHandler);
app.post('/api/subscriptions/create', createCheckout);
app.post('/api/subscriptions/verify', verifyPayment);
app.post('/api/subscriptions/test-webhook', testSubscriptionWebhook);
app.post('/api/subscriptions/:subscriptionId/cancel', cancelSubscription);
app.post('/api/payments/webhook/razorpay', handleWebhook);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`SmartNest Backend Server running on port ${PORT}`);
    console.log(`- Base API URL: http://localhost:${PORT}/api`);
    console.log(`- Seller/Lead Webhook: ${getAgentWebhookUrl()}`);
    console.log(`- Subscription Webhook: ${process.env.SNS_SUBSCRIPTION_WEBHOOK_URL || 'https://api.agents.snsihub.ai/webhook/61316be1-7b40-45a7-929e-992052a0274e'}`);
    console.log(`- Registration endpoint: http://localhost:${PORT}/api/auth/register`);
  });
}

module.exports = app;
