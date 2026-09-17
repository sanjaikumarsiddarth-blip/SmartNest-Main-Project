import React from 'react';
import { X, Check, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { SmartNestBrand } from '../shared/SmartNestBrand';
import { formatCurrency } from '../../services/subscriptionConfig';

export const PlanConfirmationModal = ({
  isOpen,
  plan,
  onProceed,
  onCancel,
  loading = false
}) => {
  if (!isOpen || !plan) return null;

  const isFree = plan.price === 0;

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
      aria-labelledby="confirm-plan-title"
    >
      <div
        className="smartnest-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '32px',
          borderRadius: 'var(--radius-modal)',
          boxShadow: 'var(--shadow-modal)',
          backgroundColor: '#FFFFFF',
          animation: 'fadeUpPage 250ms ease-out',
          border: '1px solid var(--border)'
        }}
      >
        {/* Branding & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ marginBottom: '10px' }}>
              <SmartNestBrand
                orientation="horizontal"
                withTagline={true}
                iconSize={32}
                textSize="18px"
                taglineSize="10px"
              />
            </div>
            <h2 id="confirm-plan-title" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', margin: '4px 0 0 0' }}>
              {isFree ? 'Confirm Free Plan' : 'Confirm your subscription'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--slate)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Plan Summary Box */}
        <div
          style={{
            padding: '22px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--border)',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <div>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
                {plan.name}
              </span>
              <span className="badge-pill badge-teal" style={{ marginLeft: '10px', fontSize: '11px', textTransform: 'capitalize' }}>
                {plan.role} Plan
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--teal)' }}>
                {plan.billing_period_text}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--slate)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            {plan.description}
          </p>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '10px' }}>
              Includes:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {plan.features_list?.map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: 'var(--ink)' }}>
                  <Check size={16} color="var(--teal)" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                  <span>{feature.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Row */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '14px',
              borderTop: '2px dashed var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--slate)' }}>
              Total Due Today
            </span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)' }}>
              {formatCurrency(plan.price, plan.currency || 'INR')}
            </span>
          </div>
        </div>

        {/* Security badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
            fontSize: '12px',
            color: 'var(--slate)'
          }}
        >
          <ShieldCheck size={16} color="var(--teal)" />
          <span>
            {isFree
              ? 'Zero billing. Immediate instant activation with no card required.'
              : 'Immediate plan activation. Zero payment or card details required.'}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn btn-ghost"
            style={{ padding: '10px 18px', fontSize: '14px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onProceed}
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '10px 22px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isFree ? (
              <>
                <Sparkles size={16} /> Activate Free Plan
              </>
            ) : (
              <>
                Activate Subscription <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
