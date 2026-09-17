import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { SELLER_PLANS, BUYER_PLANS } from '../../services/subscriptionConfig';

export const UpgradeModal = ({
  isOpen,
  role = 'seller',
  title,
  message,
  targetPlanId = null,
  onClose
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  // Determine target plan recommendations
  const isSeller = role === 'seller';
  const plans = isSeller ? SELLER_PLANS : BUYER_PLANS;
  const targetPlan = plans.find((p) => p.id === targetPlanId) || (isSeller ? SELLER_PLANS[1] : BUYER_PLANS[1]);

  const handleNavigateToPlans = () => {
    onClose();
    if (isSeller) {
      navigate('/seller/plans');
    } else {
      navigate('/buyer/plans');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(13, 27, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="smartnest-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '32px',
          borderRadius: 'var(--radius-modal)',
          boxShadow: 'var(--shadow-modal)',
          animation: 'fadeUpPage 250ms ease-out',
          backgroundColor: '#FFFFFF'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'var(--teal-light)',
                color: 'var(--teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Plan Entitlement Limit
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', margin: '2px 0 0 0' }}>
                {title || (isSeller ? `Unlock more with ${targetPlan.name}` : `Unlock more with ${targetPlan.name}`)}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--slate)',
              cursor: 'pointer',
              padding: '4px'
            }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Message */}
        <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.5, margin: '0 0 20px 0' }}>
          {message || (isSeller
            ? `You've reached your listing limit. Upgrade your plan to add more properties and access advanced buyer matching.`
            : `You've reached your active contact limit. Upgrade to continue initiating conversations with verified property sellers.`)}
        </p>

        {/* Target Plan Perks */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--border)',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
              {targetPlan.name} includes:
            </span>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--teal)' }}>
              {targetPlan.billing_period_text}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {targetPlan.features_list?.filter((f) => f.included).slice(0, 5).map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--ink)' }}>
                <Check size={15} color="var(--teal)" strokeWidth={2.5} />
                <span>{f.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '10px 18px', fontSize: '14px' }}
          >
            Not Now
          </button>
          <button
            type="button"
            onClick={handleNavigateToPlans}
            className="btn btn-primary"
            style={{
              padding: '10px 22px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Upgrade to {targetPlan.name} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
