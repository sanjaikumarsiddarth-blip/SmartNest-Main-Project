// SmartNest AI — Centralized Payment Service
// Coordinates Razorpay Checkout (Live Mode) and Demo Payment Gateway (Demo Mode).
// CRITICAL RULE: Secrets are NEVER included in client code.

import { api, getDemoMode } from './api';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptLoadingPromise = null;

/**
 * Dynamically loads the Razorpay Checkout SDK if not already loaded.
 */
export function loadRazorpayScript() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve) => {
    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay checkout script.');
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return scriptLoadingPromise;
}

/**
 * Initiates payment or demo checkout flow.
 *
 * @param {Object} params
 * @param {Object} params.plan - The selected plan
 * @param {Object} params.user - Current logged-in user
 * @param {string} params.role - 'buyer' or 'seller'
 * @param {Function} params.onProcessing - Callback when payment starts processing
 * @param {Function} params.onSuccess - Callback on verified payment & active subscription
 * @param {Function} params.onFailure - Callback on payment failure or verification rejection
 * @param {Function} params.onCancel - Callback if user dismisses without paying
 */
export async function initiatePayment({
  plan,
  user,
  role,
  onProcessing = () => {},
  onSuccess = () => {},
  onFailure = () => {},
  onCancel = () => {}
}) {
  if (!user) {
    onFailure(new Error('You must be logged in to subscribe to a plan.'));
    return;
  }

  // Free Seller plan activates directly without payment gateway (Section 7)
  if (plan.price === 0) {
    try {
      onProcessing();
      const res = await api.createSubscription({
        userId: user.user_id || user.id,
        role,
        planId: plan.id
      });
      onSuccess({
        plan,
        subscription: res.subscription,
        isFree: true,
        message: 'Free plan activated successfully.'
      });
    } catch (err) {
      onFailure(err);
    }
    return;
  }

  const isDemo = getDemoMode();

  // If Live Mode
  if (!isDemo) {
    const keyId = import.meta.env?.VITE_RAZORPAY_KEY_ID;
    if (!keyId) {
      console.info('Live Mode: VITE_RAZORPAY_KEY_ID not configured; activating plan directly through SNS Subscription Webhook...');
      try {
        onProcessing();
        const res = await api.createSubscription({
          userId: user.user_id || user.id,
          role,
          planId: plan.id,
          paymentMethod: 'SNS Live Subscription Workflow'
        });
        onSuccess({
          plan,
          subscription: res.subscription || res,
          isLiveWorkflow: true,
          message: `Your ${plan.name} subscription is now active.`
        });
        return;
      } catch (err) {
        onFailure(err);
        return;
      }
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || !window.Razorpay) {
      onFailure(new Error('Failed to initialize Razorpay payment gateway. Please check your internet connection.'));
      return;
    }

    try {
      onProcessing();
      // Call backend to create checkout session
      const session = await api.createSubscriptionCheckout({
        userId: user.user_id,
        role,
        planId: plan.id
      });

      const options = {
        key: keyId,
        subscription_id: session.subscription_id || session.provider_subscription_id,
        name: 'SmartNest AI',
        description: `${plan.name} Subscription (${plan.billing_period_text})`,
        image: '/smartnest-logo.svg',
        handler: async function (response) {
          onProcessing();
          try {
            const verifyRes = await api.verifyPayment({
              payment_id: response.razorpay_payment_id,
              subscription_id: response.razorpay_subscription_id || session.provider_subscription_id,
              signature: response.razorpay_signature,
              userId: user.user_id,
              role,
              planId: plan.id
            });

            if (verifyRes.verified) {
              onSuccess({
                plan,
                subscription: verifyRes.subscription,
                transaction: verifyRes.transaction,
                invoice: verifyRes.invoice
              });
            } else {
              onFailure(new Error(verifyRes.error || 'Payment verification failed.'));
            }
          } catch (verifyErr) {
            onFailure(verifyErr);
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || ''
        },
        theme: {
          color: '#2A9D8F'
        },
        modal: {
          ondismiss: function () {
            onCancel();
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        onFailure(new Error(resp.error?.description || 'Payment transaction failed.'));
      });
      rzp.open();
    } catch (err) {
      onFailure(err);
    }
    return;
  }

  // Demo Mode is handled via interactive DemoCheckoutModal component
};

export const paymentService = {
  loadRazorpayScript,
  initiatePayment
};
