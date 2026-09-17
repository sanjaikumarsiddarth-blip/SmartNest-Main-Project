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

    // Dispatch webhook to SNS Agent Workbench
    dispatchSubscriptionWebhook({
      subscription_id,
      user_id: userId,
      role,
      plan_id: planId,
      status: 'active'
    }).catch(() => {});

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

async function dispatchSubscriptionWebhook(subData) {
  const primaryUrl = process.env.SNS_SUBSCRIPTION_WEBHOOK_URL || process.env.SNS_AGENT_WEBHOOK_URL || 'https://api.agents.snsihub.ai/webhook/61316be1-7b40-45a7-929e-992052a0274e';
  const testUrl = primaryUrl.replace('/webhook/', '/webhook-test/');

  // Try primary webhook, fallback to webhook-test if primary returns 404
  const targetUrls = [primaryUrl];
  if (!primaryUrl.includes('/webhook-test/')) {
    targetUrls.push(testUrl);
  }

  const payload = {
    user_id: subData.user_id || subData.userId,
    userId: subData.user_id || subData.userId,
    session_id: subData.session_id || subData.sessionId,
    sessionId: subData.session_id || subData.sessionId,
    plan: subData.plan || subData.plan_id,
    plan_id: subData.plan || subData.plan_id,
    plan_name: subData.plan_name || subData.planName,
    planName: subData.plan_name || subData.planName,
    amount: subData.amount || subData.price,
    price: subData.amount || subData.price,
    currency: 'INR',
    status: 'active',
    role: subData.role,
    timestamp: new Date().toISOString()
  };

  for (const url of targetUrls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'SmartNest-AI-Agent-Gateway/1.0' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (response.ok) {
        console.log(`[SNS Subscription Webhook] Successfully dispatched to: ${url} (Status: ${response.status})`);
        return { dispatched: true, statusCode: response.status, ok: true, url };
      }
      if (response.status === 404 && url === primaryUrl && targetUrls.length > 1) {
        console.log(`[SNS Subscription Webhook] Primary returned 404, attempting fallback to webhook-test: ${testUrl}`);
        continue;
      }
      return { dispatched: true, statusCode: response.status, ok: response.ok, url };
    } catch (err) {
      console.warn(`[SNS Subscription Webhook] Dispatch notice to ${url}:`, err.message);
    }
  }

  return { dispatched: false, error: 'All webhook endpoints failed' };
}

async function activateSubscriptionHandler(req, res) {
  try {
    const { user_id, userId, session_id, sessionId, plan, plan_id, plan_name, planName, amount, price, role } = req.body || {};

    const effectiveUserId = user_id || userId;
    const effectiveSessionId = session_id || sessionId;
    const effectivePlan = plan || plan_id;
    const effectivePlanName = plan_name || planName;
    const effectiveAmount = parseInt(amount || price || 0, 10);
    const effectiveRole = role || 'buyer';

    if (!effectiveUserId || !effectivePlan) {
      return res.status(400).json({ error: 'Missing user_id or plan for subscription activation.' });
    }

    const subId = `sub_${effectivePlan}_${Date.now().toString(36)}`;
    const now = new Date();
    const validityDays = effectiveRole === 'seller' ? 45 : 30;
    const expiry = new Date(now.getTime() + validityDays * 86400000).toISOString();

    const subObj = {
      id: subId,
      subscription_id: subId,
      user_id: effectiveUserId,
      session_id: effectiveSessionId,
      plan: effectivePlan,
      plan_id: effectivePlan,
      plan_name: effectivePlanName,
      amount: effectiveAmount,
      currency: 'INR',
      role: effectiveRole,
      status: 'active',
      started_at: now.toISOString(),
      created_at: now.toISOString(),
      expires_at: expiry,
      renewal_at: expiry,
      billing_cycle: effectiveRole === 'seller' ? '45_days' : 'monthly'
    };

    // 1. Dispatch to SNS Webhook
    const webhookResult = await dispatchSubscriptionWebhook({
      user_id: effectiveUserId,
      session_id: effectiveSessionId,
      plan: effectivePlan,
      plan_name: effectivePlanName,
      amount: effectiveAmount,
      role: effectiveRole,
      status: 'active'
    });

    // 2. Persist to server memory store
    subscriptionsDb.set(effectiveUserId, subObj);
    if (effectiveUserId.startsWith('usr_')) {
      if (effectiveUserId === 'usr_buyer_01') subscriptionsDb.set('d4e6d678-c40c-43ad-8665-e10e32c027f7', subObj);
      if (effectiveUserId === 'usr_seller_01') subscriptionsDb.set('616af1d1-f101-4987-8f0e-c4189b752c7c', subObj);
    }

    // 3. Attempt direct Supabase insert as best effort
    try {
      const { supabase, isSupabaseConfigured } = require('./supabaseClient');
      if (isSupabaseConfigured && supabase) {
        supabase.from('Subscriptions').insert([{
          user_id: effectiveUserId,
          session_id: effectiveSessionId,
          plan: effectivePlan,
          plan_name: effectivePlanName,
          amount: effectiveAmount,
          status: 'active'
        }]).then(({ error }) => {
          if (error) console.log('[Supabase Subscriptions Insert Notice]', error.message);
          else console.log('[Supabase Subscriptions Insert] Successfully inserted subscription into Supabase.');
        }).catch(() => {});
      }
    } catch (e) {}

    return res.json({
      success: true,
      subscription: subObj,
      webhook_result: webhookResult,
      message: 'Subscription activated successfully.'
    });
  } catch (err) {
    console.error('Subscription activation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to activate subscription.' });
  }
}

async function testSubscriptionWebhook(req, res) {
  const webhookUrl = process.env.SNS_SUBSCRIPTION_WEBHOOK_URL || process.env.SNS_AGENT_WEBHOOK_URL || 'https://api.agents.snsihub.ai/webhook/61316be1-7b40-45a7-929e-992052a0274e';
  const sample = {
    subscription_id: `sub_test_${Date.now()}`,
    user_id: 'usr_seller_01',
    role: 'seller',
    plan_id: 'connect',
    plan_name: 'Connect',
    amount: 500,
    currency: 'INR',
    status: 'active'
  };
  const result = await dispatchSubscriptionWebhook(sample);
  return res.json({
    success: true,
    message: 'Test subscription trigger sent to SNS iHub AI Agent webhook.',
    target_url: webhookUrl,
    webhook_result: result,
    sample_payload: sample
  });
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
  handleWebhook,
  dispatchSubscriptionWebhook,
  testSubscriptionWebhook,
  activateSubscriptionHandler,
  subscriptionsDb
};
