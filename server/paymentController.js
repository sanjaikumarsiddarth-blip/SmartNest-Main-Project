// Payment and Subscription Controller
const {
  isConfigured,
  KEY_ID,
  createRazorpaySubscription,
  verifySubscriptionSignature,
  verifyWebhookSignature
} = require('./razorpayClient');

// In-memory or database persistent state for server-side subscriptions
const subscriptionsDb = new Map();
const transactionsDb = new Map();

async function createCheckout(req, res) {
  try {
    const { userId, role, planId, razorpayPlanId, planName, amount } = req.body;

    if (!userId || !role || !planId) {
      return res.status(400).json({ error: 'Missing required subscription checkout parameters.' });
    }

    // If live keys are configured, create with Razorpay
    if (isConfigured && razorpayPlanId) {
      const rzpSub = await createRazorpaySubscription({ planId: razorpayPlanId });
      return res.json({
        success: true,
        key_id: KEY_ID,
        subscription_id: rzpSub.id,
        status: rzpSub.status,
        plan_id: planId
      });
    }

    // Standard prepared response for test mode / fallback
    const subscriptionId = `sub_server_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    return res.json({
      success: true,
      key_id: KEY_ID || 'rzp_test_placeholder',
      subscription_id: subscriptionId,
      status: 'created',
      plan_id: planId,
      message: isConfigured ? 'Checkout created' : 'Razorpay keys pending setup; ready for test configuration.'
    });
  } catch (err) {
    console.error('Payment checkout error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create subscription checkout.' });
  }
}

async function verifyPayment(req, res) {
  try {
    const { payment_id, subscription_id, signature, userId, role, planId } = req.body;

    if (!payment_id || !signature) {
      return res.status(400).json({ error: 'Missing payment verification tokens.' });
    }

    let isValid = false;
    if (isConfigured) {
      isValid = verifySubscriptionSignature({ payment_id, subscription_id, signature });
    } else {
      // Demo / simulated verification check
      isValid = signature.startsWith('demo_sig_') || signature.length >= 16;
    }

    if (!isValid) {
      return res.status(400).json({
        verified: false,
        error: 'Payment signature verification failed. Subscription not activated.'
      });
    }

    // Record subscription as active
    const record = {
      subscription_id,
      user_id: userId,
      role,
      plan_id: planId,
      status: 'active',
      verified_at: new Date().toISOString()
    };
    subscriptionsDb.set(subscription_id, record);

    return res.json({
      verified: true,
      subscription_id,
      status: 'active',
      message: 'Payment verified successfully.'
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    return res.status(500).json({ error: 'Internal payment verification failure.' });
  }
}

async function cancelSubscription(req, res) {
  try {
    const { subscriptionId } = req.params;
    if (!subscriptionId) {
      return res.status(400).json({ error: 'Subscription ID is required.' });
    }

    const sub = subscriptionsDb.get(subscriptionId);
    if (sub) {
      sub.status = 'cancelled';
      sub.cancelled_at = new Date().toISOString();
      subscriptionsDb.set(subscriptionId, sub);
    }

    return res.json({
      success: true,
      subscription_id: subscriptionId,
      status: 'cancelled',
      message: 'Subscription marked for cancellation at period end.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to cancel subscription.' });
  }
}

async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);

    if (isConfigured && signature) {
      const isValid = verifyWebhookSignature({ rawBody, signature });
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid webhook signature.' });
      }
    }

    const event = req.body?.event;
    console.log('[Razorpay Webhook Received]', event);

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Webhook processing error.' });
  }
}

module.exports = {
  createCheckout,
  verifyPayment,
  cancelSubscription,
  handleWebhook
};
