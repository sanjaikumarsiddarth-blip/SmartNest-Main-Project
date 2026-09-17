# SmartNest AI — Subscription & Razorpay Payment Gateway Integration Manual

This document is the definitive production guide for SmartNest AI's subscription, billing, and Razorpay payment gateway integration. It outlines system architecture, strict plan specifications, dual-mode operation (Demo Mode & Live Mode), backend webhook orchestration, and entitlement enforcement rules.

---

## 1. Architectural Overview

SmartNest AI uses a decoupled, security-first payment architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React / Vite)                         │
│                                                                        │
│   BuyerPlansPage / SellerPlansPage                                     │
│      ├── PlanConfirmationModal (Price, Entitlements, Total)            │
│      ├── Demo Mode  ──► DemoCheckoutModal (Interactive Sandbox)        │
│      ├── Live Mode  ──► Razorpay Checkout.js Modal                     │
│      └── PaymentStatusModal (Processing, Success, Failed, Cancelled)   │
│                                                                        │
│   SubscriptionContext                                                  │
│      ├── canCreateProperty() [Seller 1/10/30 listings limit]           │
│      ├── canContactSeller()  [Buyer 15/25/50 unique contacts limit]    │
│      └── hasFeature()        [Feature entitlement checks]              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ All calls flow through api.js
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SERVICES & WORKFLOWS                            │
│                                                                        │
│   src/services/api.js                                                  │
│      ├── getSubscription(userId, role)                                │
│      ├── createSubscriptionCheckout({ userId, role, planId })          │
│      ├── verifyPayment(paymentData)                                    │
│      ├── cancelSubscription(subscriptionId)                            │
│      ├── getSubscriptionUsage(userId, role)                            │
│      ├── getPaymentHistory(userId, role) & getInvoices(userId, role)   │
│      └── getSubscriptionRevenueMetrics() & getAllPaymentTransactions() │
│                                                                        │
│   src/services/workflows.js (SNS Workbench Intelligence Engine)       │
│      ├── workflowCreateSubscriptionSession()                           │
│      ├── workflowVerifyPaymentSignature() (HMAC SHA-256)               │
│      ├── workflowProcessRazorpayWebhook()                              │
│      └── workflowGenerateInvoice()                                     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ In Live Mode (VITE_DEMO_MODE=false)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   BACKEND SERVER (Node.js / Express)                   │
│                                                                        │
│   server/server.js & server/paymentController.js                       │
│      ├── POST /api/subscriptions/create                                │
│      ├── POST /api/subscriptions/verify (Server-side HMAC verification)│
│      ├── POST /api/subscriptions/:id/cancel                            │
│      └── POST /api/payments/webhook/razorpay (Webhook signatures)      │
│                                                                        │
│   SECURITY BOUNDARY:                                                   │
│   - RAZORPAY_KEY_SECRET & RAZORPAY_WEBHOOK_SECRET reside ONLY on server│
│   - Client receives only the public VITE_RAZORPAY_KEY_ID               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Canonical Plan Specifications

SmartNest AI defines two separate, strictly non-interchangeable tiers for Buyers and Sellers.

### A. Buyer Membership Plans

| Plan | Price | Duration | Contact Limit | Key Entitlements |
| :--- | :--- | :--- | :--- | :--- |
| **Connect** | ₹1,209 | 45 days | 15 contacts | Zero brokerage, priority customer support, instant property alerts |
| **Connect+** *(Popular)* | ₹1,539 | 45 days | 25 contacts | Zero brokerage, priority customer support, instant property alerts, popular badge |
| **Relax** | ₹2,309 | 45 days | 50 contacts | Zero brokerage, priority support, instant alerts, dedicated relationship manager |

### B. Seller Membership Plans

| Plan | Price | Billing | Property Limit | Key Entitlements |
| :--- | :--- | :--- | :--- | :--- |
| **Free** | ₹0 | Monthly | 1 property | Basic property listing, property photos, buyer enquiries, basic buyer matching *(Instant activation, bypasses payment gateway)* |
| **SmartSeller** *(Popular)* | ₹699 | Monthly | Up to 10 properties | AI buyer matching, buyer match insights, priority visibility, advanced analytics, enquiry management |
| **Professional** | ₹1,499 | Monthly | Up to 30 properties | Advanced AI matching, lead management, priority buyer connections, advanced reports, team access |

---

## 3. End-to-End User Payment Flow

1. **Select Plan**: User reviews plan cards on `/buyer/plans` or `/seller/plans`.
2. **Plan Confirmation Screen**: `PlanConfirmationModal` renders:
   - Header with SmartNest branding (`Find-Match-Move`)
   - Plan Name & Billing Interval
   - Checklist of included features
   - Total amount due
   - *Free Plan*: Displays `[Activate Free Plan]` with ₹0 total, immediately bypassing Razorpay.
   - *Paid Plans*: Displays `[Proceed to Payment]` and `[Cancel]`.
3. **Checkout Initiation**:
   - In **Demo Mode**: Dispatches `DemoCheckoutModal` (Interactive Sandbox with `[Simulate Successful Payment]`, `[Simulate Failed Payment]`, `[Cancel]`).
   - In **Live Mode**: Calls `POST /api/subscriptions/create` and launches official `Razorpay(options).open()` checkout widget.
4. **Signature Verification**:
   - Razorpay returns `razorpay_payment_id`, `razorpay_subscription_id`, and `razorpay_signature`.
   - Data is dispatched to backend (`POST /api/subscriptions/verify` or `api.verifyPayment`).
   - Server computes expected HMAC SHA-256: `HMAC_SHA256(payment_id + "|" + subscription_id, RAZORPAY_KEY_SECRET)`.
   - If match is verified, subscription status is transitioned to `active`, transaction is recorded, tax invoice is generated, and entitlements are granted.
5. **Payment States**:
   - `PROCESSING`: Spinner, "Processing your payment...", buttons disabled to prevent duplicate payments.
   - `SUCCESS`: Checkmark, "Payment Successful", plan name, amount, active status, `[Go to Dashboard]`.
   - `FAILED`: Red alert, "Payment unsuccessful", `[Try Again]`, `[Back to Plans]`.
   - `CANCELLED`: "Payment cancelled. Your current plan has not been changed.", `[Return to Plans]`.
   - `VERIFICATION_FAILED`: "We couldn't verify this payment. Your subscription has not been activated.", `[Retry]`, `[Close]`.

---

## 4. Entitlement & Quota Enforcement Rules

1. **Seller Property Limit**:
   - Enforced client-side in `AddEditPropertyPage.jsx` and server-side in `api.createProperty`.
   - Free: 1, SmartSeller: 10, Professional: 30.
   - When quota is reached, new submissions are rejected with: *"Property limit reached. You've reached the {limit}-property limit on the {plan} plan. Upgrade your plan to add more properties."*
2. **Buyer Contact Quota**:
   - Enforced client-side in `PropertyDetailPage.jsx` and server-side in `api.startConversation`.
   - Quotas: Connect: 15, Connect+: 25, Relax: 50 unique seller conversations.
   - **Crucial Rule**: Normal replies and message exchanges within existing conversations are **NEVER blocked**, even if the contact quota is 100% consumed.
3. **Data Preservation on Downgrade / Expiry**:
   - Neither properties nor existing messaging threads are ever deleted automatically when a user downgrades or allows a subscription to lapse.
   - User simply cannot publish new properties or initiate new seller threads until within lower quota limits.

---

## 5. Webhook System Architecture

The Express server in `server/` listens on `POST /api/payments/webhook/razorpay`. Every request is validated against `RAZORPAY_WEBHOOK_SECRET`:

```javascript
const expectedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(req.rawBody)
  .digest('hex');
```

Supported standard Razorpay lifecycle events:
- `subscription.authenticated`: Sets subscription to active.
- `subscription.activated`: Unlocks full plan entitlements.
- `subscription.charged`: Records recurring billing cycle transaction and issues renewal invoice.
- `subscription.completed`: Marks subscription expired upon completing all cycles.
- `subscription.cancelled`: Sets status to cancelled (access continues until cycle end).
- `subscription.paused` / `subscription.resumed`: Manages temporary access holds.
- `subscription.halted`: Flags past-due status after repeated payment retries fail.
- `payment.captured`: Confirms successful one-time or initial charge.
- `payment.failed`: Flags payment failure and sends alert notification.

---

## 6. Environment Variables Reference

### Frontend Configuration (`.env`)
```bash
# Toggle between local in-browser simulation and live server
VITE_DEMO_MODE=true

# Public Razorpay Key ID (safe for browser)
VITE_RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere

# Backend API URL (for Live Mode)
VITE_SMARTNEST_API_URL=http://localhost:5000/api
```

### Backend Configuration (`server/.env`)
```bash
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Secret Razorpay Keys (NEVER expose to frontend or git)
RAZORPAY_KEY_ID=rzp_test_YourTestKeyIdHere
RAZORPAY_KEY_SECRET=YourRazorpaySecretKeyHere
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere
```

---

## 7. Production Go-Live Checklist

- [ ] Obtain live Razorpay API Keys (`rzp_live_...`) from Razorpay Dashboard.
- [ ] Create Razorpay Plans matching SmartNest pricing (SmartSeller: ₹699/mo, Professional: ₹1,499/mo, Connect: ₹1,209/45d, Connect+: ₹1,539/45d, Relax: ₹2,309/45d).
- [ ] Configure Webhook endpoint in Razorpay Dashboard: `https://api.yourdomain.com/api/payments/webhook/razorpay`.
- [ ] Set Webhook Secret in server environment and subscribe to `subscription.*` and `payment.*` events.
- [ ] Set `VITE_DEMO_MODE=false` in frontend production build.
- [ ] Verify HTTPS is enforced across all checkout and callback URLs.
- [ ] Verify test transactions and signature verification in Razorpay Test Mode prior to toggling live keys.
