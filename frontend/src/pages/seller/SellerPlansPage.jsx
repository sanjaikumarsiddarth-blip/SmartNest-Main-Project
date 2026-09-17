import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { SELLER_PLANS, formatCurrency } from '../../services/subscriptionConfig';
import { api, getDemoMode } from '../../services/api';
import { initiatePayment } from '../../services/paymentService';
import { SmartNestBrand } from '../../components/shared/SmartNestBrand';
import { PlanConfirmationModal } from '../../components/subscription/PlanConfirmationModal';
import { DemoCheckoutModal } from '../../components/subscription/DemoCheckoutModal';
import { PaymentStatusModal } from '../../components/subscription/PaymentStatusModal';
import { InvoiceModal } from '../../components/subscription/InvoiceModal';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import {
  Sparkles,
  Check,
  ShieldCheck,
  CreditCard,
  History,
  FileText,
  Building,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export const SellerPlansPage = ({ defaultTab = 'plans' }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { subscription, usage, refresh } = useSubscription();

  // Active Tab: 'plans' | 'manage'
  const isManageRoute = location.pathname.includes('/subscription') || defaultTab === 'manage';
  const [activeTab, setActiveTab] = useState(isManageRoute ? 'manage' : 'plans');

  // Modals and payment state
  const [selectedPlanForConfirmation, setSelectedPlanForConfirmation] = useState(null);
  const [demoCheckoutPlan, setDemoCheckoutPlan] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'processing' | 'success' | 'failed' | 'cancelled' | 'verification_failed'
  const [activePaymentPlan, setActivePaymentPlan] = useState(null);
  const [paymentError, setPaymentError] = useState(null);

  // Cancellation confirm modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Downgrade confirm modal
  const [downgradePlanTarget, setDowngradePlanTarget] = useState(null);

  // Payment History & Invoices
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const activePlanId = subscription?.plan_id || 'connect';
  const propertiesUsed = usage?.properties_published || 0;
  const propertyLimit = usage?.property_limit || 15;
  const usagePct = Math.min(100, Math.round((propertiesUsed / propertyLimit) * 100));

  // Load payment history and invoices
  const loadHistoryAndInvoices = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const [historyData, invoicesData] = await Promise.all([
        api.getPaymentHistory(user.user_id, 'seller'),
        api.getInvoices(user.user_id, 'seller')
      ]);
      setPaymentHistory(historyData || []);
      setInvoices(invoicesData || []);
    } catch (err) {
      console.error('Error fetching billing history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistoryAndInvoices();
  }, [user]);

  useEffect(() => {
    if (location.pathname.includes('/subscription')) {
      setActiveTab('manage');
    }
  }, [location.pathname]);

  // Handle plan selection
  const handleSelectPlan = (plan) => {
    if (plan.id === activePlanId && subscription?.status === 'active') return;

    // Check if downgrade
    const currentIdx = SELLER_PLANS.findIndex((p) => p.id === activePlanId);
    const targetIdx = SELLER_PLANS.findIndex((p) => p.id === plan.id);

    if (targetIdx < currentIdx && currentIdx !== -1) {
      setDowngradePlanTarget(plan);
      return;
    }

    setSelectedPlanForConfirmation(plan);
  };

  // When user proceeds from Confirmation Modal
  const handleProceedToPayment = async () => {
    const plan = selectedPlanForConfirmation;
    setSelectedPlanForConfirmation(null);
    setActivePaymentPlan(plan);

    const isDemo = getDemoMode();

    if (isDemo) {
      // Open Demo Payment Gateway modal
      setDemoCheckoutPlan(plan);
    } else {
      // Live Mode: Direct internal SmartNest plan activation
      setPaymentStatus('processing');
      try {
        await api.activateSubscription({
          plan,
          user,
          role: 'seller'
        });
        setPaymentStatus('success');
        addToast({ type: 'success', message: `Your ${plan.name} subscription is now active.` });
        await refresh();
        await loadHistoryAndInvoices();
      } catch (err) {
        setPaymentError(err.message || 'Subscription activation failed.');
        setPaymentStatus('failed');
      }
    }
  };

  // Demo: User clicks "Simulate Successful Payment"
  const handleDemoSuccess = async () => {
    const plan = demoCheckoutPlan;
    setDemoCheckoutPlan(null);
    setPaymentStatus('processing');

    try {
      // 1. Create checkout session
      const session = await api.createSubscriptionCheckout({
        userId: user?.user_id || 'usr_seller_01',
        role: 'seller',
        planId: plan.id
      });

      // 2. Simulate payment response
      const simPaymentId = `pay_demo_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const simSignature = `demo_sig_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // 3. Backend verifies signature & activates subscription
      const verifyRes = await api.verifyPayment({
        payment_id: simPaymentId,
        subscription_id: session.provider_subscription_id,
        signature: simSignature,
        userId: user?.user_id || 'usr_seller_01',
        role: 'seller',
        planId: plan.id,
        paymentMethod: 'Demo Simulation (UPI AutoPay)'
      });

      if (verifyRes.verified) {
        setPaymentStatus('success');
        addToast({
          type: 'success',
          message: `Your ${plan.name} subscription is now active.`
        });
        await refresh();
        await loadHistoryAndInvoices();
      } else {
        setPaymentError('Signature verification failed.');
        setPaymentStatus('verification_failed');
      }
    } catch (err) {
      setPaymentError(err.message || 'Payment verification failed.');
      setPaymentStatus('failed');
    }
  };

  // Demo: User clicks "Simulate Failed Payment"
  const handleDemoFailure = async () => {
    const plan = demoCheckoutPlan;
    setDemoCheckoutPlan(null);
    setPaymentStatus('processing');

    try {
      await api.verifyPayment({
        payment_id: `pay_failed_${Date.now().toString(36)}`,
        subscription_id: 'sub_failed',
        signature: 'invalid_demo_signature_payload',
        userId: user?.user_id || 'usr_seller_01',
        role: 'seller',
        planId: plan.id,
        paymentMethod: 'Demo Simulation'
      });
    } catch (e) {}

    setPaymentError('Payment failed or transaction was declined.');
    setPaymentStatus('failed');
    addToast({
      type: 'error',
      message: `Your ${plan.name} payment failed.`
    });
    await loadHistoryAndInvoices();
  };

  // Confirm Downgrade
  const handleConfirmDowngrade = async () => {
    if (!downgradePlanTarget) return;
    const targetPlan = downgradePlanTarget;
    setDowngradePlanTarget(null);

    // If downgrading to Free
    if (targetPlan.price === 0) {
      try {
        await api.createSubscription({
          userId: user?.user_id || 'usr_seller_01',
          role: 'seller',
          planId: 'free'
        });
        addToast({
          type: 'info',
          message: `Plan changed to Free. Your ${propertiesUsed} existing properties are preserved.`
        });
        await refresh();
      } catch (err) {
        addToast({ type: 'error', message: err.message || 'Failed to change plan.' });
      }
      return;
    }

    setSelectedPlanForConfirmation(targetPlan);
  };

  // Cancel Subscription flow
  const handleConfirmCancel = async () => {
    if (!subscription) return;
    setCancelling(true);
    try {
      await api.cancelSubscription(subscription.subscription_id);
      addToast({
        type: 'info',
        message: 'Subscription marked for cancellation. Your listing capacity remains active until the end of the billing period.'
      });
      setShowCancelModal(false);
      await refresh();
    } catch (err) {
      addToast({ type: 'error', message: err.message || 'Failed to cancel subscription.' });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="page-entrance" style={{ padding: '40px 0 100px 0', backgroundColor: '#F8FAFC', minHeight: '90vh' }}>
      <div className="container-main" style={{ maxWidth: '1140px' }}>
        {/* Top Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <SmartNestBrand
              orientation="horizontal"
              withTagline={true}
              iconSize={42}
              textSize="24px"
              taglineSize="11.5px"
            />
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', margin: '4px 0 10px 0' }}>
            Seller Listing & Growth Plans
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--slate)', maxWidth: '620px', margin: '0 auto', lineHeight: 1.5 }}>
            Publish your properties, connect with AI-matched buyers, and unlock advanced real estate intelligence.
          </p>

          {/* Navigation Tab Pills */}
          <div style={{ display: 'inline-flex', padding: '4px', backgroundColor: '#E2E8F0', borderRadius: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('plans')}
              style={{
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'plans' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'plans' ? 'var(--ink)' : 'var(--slate)',
                boxShadow: activeTab === 'plans' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 150ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CreditCard size={16} /> Browse Plans
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manage')}
              style={{
                padding: '8px 20px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'manage' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'manage' ? 'var(--ink)' : 'var(--slate)',
                boxShadow: activeTab === 'manage' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 150ms ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <History size={16} /> My Subscription & Billing
            </button>
          </div>
        </div>

        {/* TAB 1: BROWSE PLANS */}
        {activeTab === 'plans' && (
          <div>
            {/* Plans Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
              }}
            >
              {SELLER_PLANS.map((plan) => {
                const isCurrent = activePlanId === plan.id;
                const isPopular = plan.popular;

                return (
                  <div
                    key={plan.id}
                    className="smartnest-card"
                    style={{
                      borderRadius: '16px',
                      padding: '32px 28px',
                      backgroundColor: '#FFFFFF',
                      border: isPopular ? '2px solid var(--teal)' : '1px solid var(--border)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: isPopular ? '0 12px 28px -6px rgba(42, 157, 143, 0.15)' : 'var(--shadow-sm)'
                    }}
                  >
                    {isPopular && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-12px',
                          right: '24px',
                          backgroundColor: 'var(--teal)',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Sparkles size={13} /> Most Popular
                      </div>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 6px 0' }}>
                        {plan.name}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--slate)', margin: 0, minHeight: '38px', lineHeight: 1.45 }}>
                        {plan.description}
                      </p>
                    </div>

                    {/* Pricing */}
                    <div style={{ margin: '16px 0 24px 0', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ink)' }}>
                          {formatCurrency(plan.price, plan.currency)}
                        </span>
                        <span style={{ fontSize: '14px', color: 'var(--slate)', fontWeight: 500 }}>
                          / 45 days
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 600, marginTop: '4px' }}>
                        {plan.property_limit === 1 ? '1 property listing' : `Up to ${plan.property_limit} properties`}
                      </div>
                    </div>

                    {/* Features list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, marginBottom: '28px' }}>
                      {plan.features_list.map((feat, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13.5px' }}>
                          <Check size={16} color="var(--teal)" strokeWidth={2.5} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ color: 'var(--ink)' }}>{feat.name}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action button */}
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isCurrent}
                      className={isPopular ? 'btn btn-primary' : 'btn btn-secondary'}
                      style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '14.5px',
                        justifyContent: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: isCurrent ? 'default' : 'pointer',
                        opacity: isCurrent ? 0.7 : 1
                      }}
                    >
                      {isCurrent ? (
                        <>
                          <Check size={16} /> Current Plan
                        </>
                      ) : (
                        <>
                          Subscribe to {plan.name} <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Trust Banner */}
            <div
              className="smartnest-card"
              style={{
                borderRadius: '16px',
                padding: '24px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                gap: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Building size={28} color="var(--teal)" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Protected Property Listings</div>
                  <div style={{ fontSize: '12px', color: 'var(--slate)' }}>Existing properties are never deleted on downgrade</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TrendingUp size={28} color="var(--teal)" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>AI Buyer Matching</div>
                  <div style={{ fontSize: '12px', color: 'var(--slate)' }}>Direct connections with pre-qualified buyers</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={28} color="var(--teal)" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>Verified Ownership</div>
                  <div style={{ fontSize: '12px', color: 'var(--slate)' }}>Zero commission seller tools</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY SUBSCRIPTION & BILLING */}
        {activeTab === 'manage' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Current Active Plan Card */}
            <div
              className="smartnest-card"
              style={{
                borderRadius: '16px',
                padding: '30px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                      {subscription?.plan_name || 'Connect'} Plan
                    </h2>
                    <span
                      className={`badge-pill ${subscription?.status === 'active' ? 'badge-teal' : 'badge-amber'}`}
                      style={{ fontSize: '12px', padding: '3px 10px', textTransform: 'capitalize' }}
                    >
                      {subscription?.status || 'Active'}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--slate)' }}>
                    Billed at {formatCurrency(subscription?.amount || 500)} / 45 days
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('plans')}
                    className="btn btn-primary"
                    style={{ padding: '9px 18px', fontSize: '13.5px' }}
                  >
                    Upgrade / Change Plan
                  </button>
                  {subscription?.status === 'active' && subscription?.plan_id !== 'free' && (
                    <button
                      type="button"
                      onClick={() => setShowCancelModal(true)}
                      className="btn btn-ghost"
                      style={{ padding: '9px 16px', fontSize: '13.5px', color: '#DC2626' }}
                    >
                      Cancel Subscription
                    </button>
                  )}
                </div>
              </div>

              {/* Usage Bar */}
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  marginBottom: '24px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                    Property Listings Capacity
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--teal)' }}>
                    {propertiesUsed} / {propertyLimit} properties listed
                  </span>
                </div>

                <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${usagePct}%`,
                      backgroundColor: usagePct >= 100 ? '#DC2626' : 'var(--teal)',
                      transition: 'width 300ms ease'
                    }}
                  />
                </div>

                <div style={{ fontSize: '12.5px', color: 'var(--slate)' }}>
                  {propertyLimit - propertiesUsed > 0 ? (
                    <span>You can publish <strong>{propertyLimit - propertiesUsed}</strong> more propert{propertyLimit - propertiesUsed === 1 ? 'y' : 'ies'} under your current plan.</span>
                  ) : (
                    <span style={{ color: '#DC2626', fontWeight: 600 }}>Property limit reached. Upgrade to publish more listings.</span>
                  )}
                </div>
              </div>

              {/* Metadata Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  fontSize: '13.5px',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '20px'
                }}
              >
                <div>
                  <div style={{ color: 'var(--slate)', fontSize: '12px', marginBottom: '2px' }}>Start Date</div>
                  <div style={{ fontWeight: 600, color: 'var(--ink)' }}>
                    {subscription?.started_at ? new Date(subscription.started_at).toLocaleDateString('en-IN') : '01 Sep 2026'}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--slate)', fontSize: '12px', marginBottom: '2px' }}>Next Billing / Expiry Date</div>
                  <div style={{ fontWeight: 600, color: 'var(--ink)' }}>
                    {subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString('en-IN') : '01 Oct 2026'}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--slate)', fontSize: '12px', marginBottom: '2px' }}>Subscription ID</div>
                  <div style={{ fontFamily: 'monospace', color: 'var(--slate)' }}>
                    {subscription?.subscription_id || 'sub_seller_01'}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History & Invoices Table */}
            <div
              className="smartnest-card"
              style={{
                borderRadius: '16px',
                padding: '30px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px 0' }}>
                    Payment History & Invoices
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--slate)', margin: 0 }}>
                    Official tax receipts and verification records for your SmartNest transactions.
                  </p>
                </div>
              </div>

              {paymentHistory.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--slate)', fontSize: '14px' }}>
                  No payment records found.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--slate)', fontSize: '12px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 10px' }}>Date</th>
                        <th style={{ padding: '12px 10px' }}>Plan</th>
                        <th style={{ padding: '12px 10px' }}>Amount</th>
                        <th style={{ padding: '12px 10px' }}>Status</th>
                        <th style={{ padding: '12px 10px' }}>Payment ID</th>
                        <th style={{ padding: '12px 10px', textAlign: 'right' }}>Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((tx, idx) => {
                        const inv = invoices.find((i) => i.payment_id === tx.payment_id) || {
                          invoice_id: `INV-202609-${1001 + idx}`,
                          payment_id: tx.payment_id,
                          subscription_id: tx.subscription_id,
                          user_id: tx.user_id,
                          customer_name: tx.user_name || user?.name || 'SmartNest Seller',
                          customer_email: user?.email || 'seller@smartnest.ai',
                          plan_name: tx.plan_name,
                          role: 'seller',
                          amount: tx.amount,
                          base_amount: Math.round((tx.amount / 1.18) * 100) / 100,
                          cgst_9_pct: Math.round((tx.amount * 0.09) * 100) / 100,
                          sgst_9_pct: Math.round((tx.amount * 0.09) * 100) / 100,
                          status: 'PAID',
                          payment_method: tx.payment_method,
                          issued_date: tx.created_at
                        };

                        const maskedPaymentId = tx.payment_id
                          ? tx.payment_id.length > 12
                            ? `${tx.payment_id.slice(0, 7)}...${tx.payment_id.slice(-4)}`
                            : tx.payment_id
                          : 'N/A';

                        return (
                          <tr key={tx.payment_id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '12px 10px', color: 'var(--ink)' }}>
                              {new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td style={{ padding: '12px 10px', fontWeight: 600, color: 'var(--ink)' }}>
                              {tx.plan_name}
                            </td>
                            <td style={{ padding: '12px 10px', fontWeight: 600, color: 'var(--teal)' }}>
                              {formatCurrency(tx.amount)}
                            </td>
                            <td style={{ padding: '12px 10px' }}>
                              <span
                                className={`badge-pill ${tx.status === 'successful' ? 'badge-teal' : 'badge-rose'}`}
                                style={{ fontSize: '11px', textTransform: 'capitalize' }}
                              >
                                {tx.status === 'successful' ? 'Paid' : tx.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 10px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--slate)' }}>
                              {maskedPaymentId}
                            </td>
                            <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                              {tx.status === 'successful' && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedInvoice(inv)}
                                  className="btn btn-ghost"
                                  style={{ padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <FileText size={13} /> View Invoice
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ────────────────────────────────────────── */}

      {/* 1. Plan Confirmation Modal */}
      <PlanConfirmationModal
        isOpen={Boolean(selectedPlanForConfirmation)}
        plan={selectedPlanForConfirmation}
        onProceed={handleProceedToPayment}
        onCancel={() => setSelectedPlanForConfirmation(null)}
      />

      {/* 2. Demo Checkout Modal (Demo Mode only) */}
      <DemoCheckoutModal
        isOpen={Boolean(demoCheckoutPlan)}
        plan={demoCheckoutPlan}
        onSimulateSuccess={handleDemoSuccess}
        onSimulateFailure={handleDemoFailure}
        onCancel={() => setDemoCheckoutPlan(null)}
      />

      {/* 3. Payment Status Modal (Processing, Success, Failed, Cancelled, Verification Failed) */}
      <PaymentStatusModal
        status={paymentStatus}
        plan={activePaymentPlan}
        amount={activePaymentPlan?.price}
        error={paymentError}
        targetDashboard="/seller/dashboard"
        onRetry={() => {
          setPaymentStatus(null);
          if (activePaymentPlan) {
            handleSelectPlan(activePaymentPlan);
          }
        }}
        onClose={() => {
          setPaymentStatus(null);
          setActivePaymentPlan(null);
          setPaymentError(null);
        }}
      />

      {/* 4. Tax Invoice Modal */}
      <InvoiceModal
        isOpen={Boolean(selectedInvoice)}
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />

      {/* 5. Cancellation Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Your Subscription?"
        message="Are you sure you want to cancel? Your benefits and property listings will remain active until the end of your current monthly billing period. No further renewals will take place."
        confirmText="Confirm Cancellation"
        cancelText="Keep My Plan"
        isDestructive={true}
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />

      {/* 6. Downgrade Warning Modal */}
      <ConfirmModal
        isOpen={Boolean(downgradePlanTarget)}
        title="Change Subscription Plan"
        message={`You are switching to ${downgradePlanTarget?.name}. All your ${propertiesUsed} existing properties will be safely preserved. If your existing listings exceed ${downgradePlanTarget?.property_limit || 1}, you won't be able to add new listings until your count is within the limit.`}
        confirmText="Proceed with Downgrade"
        cancelText="Keep Current Plan"
        isDestructive={false}
        onConfirm={handleConfirmDowngrade}
        onCancel={() => setDowngradePlanTarget(null)}
      />
    </div>
  );
};
