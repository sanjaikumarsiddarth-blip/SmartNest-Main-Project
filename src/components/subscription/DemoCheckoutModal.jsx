import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { SmartNestBrand } from '../shared/SmartNestBrand';
import { formatCurrency } from '../../services/subscriptionConfig';

export const DemoCheckoutModal = ({
  isOpen,
  plan,
  onSimulateSuccess,
  onSimulateFailure,
  onCancel
}) => {
  const [processingAction, setProcessingAction] = useState(null);

  if (!isOpen || !plan) return null;

  const handleSuccess = async () => {
    setProcessingAction('success');
    await onSimulateSuccess();
    setProcessingAction(null);
  };

  const handleFailure = async () => {
    setProcessingAction('failure');
    await onSimulateFailure();
    setProcessingAction(null);
  };

  const isBusy = Boolean(processingAction);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(13, 27, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
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
          maxWidth: '480px',
          padding: '28px',
          borderRadius: 'var(--radius-modal)',
          boxShadow: 'var(--shadow-modal)',
          backgroundColor: '#FFFFFF',
          animation: 'fadeUpPage 200ms ease-out',
          border: '1px solid var(--border)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge-pill badge-teal" style={{ fontSize: '11px', padding: '3px 8px', fontWeight: 600 }}>
                Demo Payment Gateway
              </span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
              SmartNest Demo Payment
            </h3>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--slate)',
              cursor: 'pointer',
              padding: '4px'
            }}
            aria-label="Cancel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Summary Card */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#F8FAFC',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            marginBottom: '18px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
              {plan.name} Plan
            </span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--teal)' }}>
              {formatCurrency(plan.price, plan.currency || 'INR')}
            </span>
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--slate)' }}>
            Cycle: {plan.billing_period_text}
          </div>
        </div>

        {/* Demo Notice Banner */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--teal-light)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(42, 157, 143, 0.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            marginBottom: '20px'
          }}
        >
          <ShieldCheck size={18} color="var(--teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '12px', color: '#1B6B61', lineHeight: 1.45 }}>
            <strong>Demo Sandbox Mode:</strong> Real Razorpay is bypassed. Test the end-to-end subscription state machine, verification simulation, entitlement unlock, and failure handling below.
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            onClick={handleSuccess}
            disabled={isBusy}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {processingAction === 'success' ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Verifying Payment...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} /> Simulate Successful Payment
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleFailure}
            disabled={isBusy}
            className="btn"
            style={{
              width: '100%',
              padding: '11px',
              fontSize: '13.5px',
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFF5F5',
              color: '#C53030',
              border: '1px solid #FEB2B2'
            }}
          >
            {processingAction === 'failure' ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Simulating Failure...
              </>
            ) : (
              <>
                <AlertTriangle size={15} /> Simulate Failed Payment
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="btn btn-ghost"
            style={{
              width: '100%',
              padding: '9px',
              fontSize: '13.5px',
              justifyContent: 'center',
              color: 'var(--slate)'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
