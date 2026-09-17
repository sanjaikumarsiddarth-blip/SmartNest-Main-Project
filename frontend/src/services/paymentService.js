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
        userId: user.user_id,
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

  // If Live Mode: Use internal SmartNest subscription activation (No external payment gateways)
  if (!isDemo) {
    try {
      onProcessing();
      const res = await api.activateSubscription({
        plan,
        user,
        role
      });
      onSuccess({
        plan,
        subscription: res.subscription,
        message: `${plan.name} plan activated successfully.`
      });
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
