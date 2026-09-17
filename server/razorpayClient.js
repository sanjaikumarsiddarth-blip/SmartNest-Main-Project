// Razorpay Client Initializer
// CRITICAL RULE: Secrets are never exposed to client browser.

const crypto = require('crypto');

const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

const isConfigured = Boolean(KEY_ID && KEY_SECRET);

/**
 * Creates Razorpay Subscription via REST API or SDK
 */
async function createRazorpaySubscription({ planId, totalCount = 12, customerNotify = 1 }) {
  if (!isConfigured) {
    throw new Error('Razorpay credentials are not configured in backend environment.');
  }

  const authHeader = 'Basic ' + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      plan_id: planId,
      total_count: totalCount,
      quantity: 1,
      customer_notify: customerNotify
    })
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody?.error?.description || 'Razorpay subscription creation failed.');
  }

  return response.json();
}

/**
 * Verifies Razorpay HMAC SHA256 Signature for Subscriptions
 * Signature formula: HMAC_SHA256(razorpay_payment_id + "|" + subscription_id, secret)
 */
function verifySubscriptionSignature({ payment_id, subscription_id, signature }) {
  if (!KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured on backend.');
  }

  const payload = `${payment_id}|${subscription_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', KEY_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf8'),
    Buffer.from(signature, 'utf8')
  );
}

/**
 * Verifies Razorpay Webhook Signature
 * Signature formula: HMAC_SHA256(raw_request_body, webhook_secret)
 */
function verifyWebhookSignature({ rawBody, signature }) {
  if (!WEBHOOK_SECRET) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured on backend.');
  }

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf8'),
    Buffer.from(signature, 'utf8')
  );
}

module.exports = {
  isConfigured,
  KEY_ID,
  createRazorpaySubscription,
  verifySubscriptionSignature,
  verifyWebhookSignature
};
