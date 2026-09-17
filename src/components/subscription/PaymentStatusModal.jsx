import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, Loader2, ArrowRight, RefreshCw, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../services/subscriptionConfig';

export const PaymentStatusModal = ({
  status, // 'processing' | 'success' | 'failed' | 'cancelled' | 'verification_failed'
  plan,
  amount,
  error,
  onRetry,
  onClose,
  targetDashboard = '/buyer/dashboard'
}) => {
  const navigate = useNavigate();

  if (!status) return null;

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
          maxWidth: '460px',
          padding: '36px 30px',
          borderRadius: 'var(--radius-modal)',
          boxShadow: 'var(--shadow-modal)',
          backgroundColor: '#FFFFFF',
          animation: 'fadeUpPage 200ms ease-out',
          textAlign: 'center',
          border: '1px solid var(--border)'
        }}
      >
        {/* State: PROCESSING */}
        {status === 'processing' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--teal-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--teal)'
                }}
              >
                <Loader2 size={32} className="animate-spin" />
              </div>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
              Activating your plan...
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--slate)', margin: 0, lineHeight: 1.5 }}>
              Please do not close or refresh this window while we activate your subscription plan.
            </p>
          </div>
        )}

        {/* State: SUCCESS */}
        {status === 'success' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--teal-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--teal)'
                }}
              >
                <CheckCircle2 size={36} strokeWidth={2.2} />
              </div>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
              Subscription Activated
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--slate)', margin: '0 0 20px 0' }}>
              Your plan is now active with immediate entitlement access.
            </p>

            {plan && (
              <div
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid var(--border)',
                  marginBottom: '24px',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--slate)' }}>Plan:</span>
                  <strong style={{ color: 'var(--ink)' }}>{plan.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--slate)' }}>Amount:</span>
                  <strong style={{ color: 'var(--teal)' }}>{formatCurrency(amount || plan.price)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                  <span style={{ color: 'var(--slate)' }}>Subscription:</span>
                  <span className="badge-pill badge-teal" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    Active
                  </span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(targetDashboard);
              }}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14.5px',
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Go to Dashboard <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* State: FAILED */}
        {status === 'failed' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#DC2626'
                }}
              >
                <XCircle size={36} strokeWidth={2.2} />
              </div>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
              Activation Unsuccessful
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--slate)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              {error || 'The subscription could not be activated. Your account was not changed.'}
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost"
                style={{ flex: 1, padding: '11px', fontSize: '14px', justifyContent: 'center' }}
              >
                Back to Plans
              </button>
              <button
                type="button"
                onClick={onRetry}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: '11px',
                  fontSize: '14px',
                  justifyContent: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={15} /> Try Again
              </button>
            </div>
          </div>
        )}

        {/* State: CANCELLED */}
        {status === 'cancelled' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--slate)'
                }}
              >
                <AlertCircle size={36} strokeWidth={2} />
              </div>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
              Activation Cancelled
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--slate)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Subscription activation was cancelled. Your current plan has not been changed.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary"
              style={{ width: '100%', padding: '11px', fontSize: '14px', justifyContent: 'center' }}
            >
              Return to Plans
            </button>
          </div>
        )}

        {/* State: VERIFICATION_FAILED */}
        {status === 'verification_failed' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D97706'
                }}
              >
                <ShieldAlert size={36} strokeWidth={2.2} />
              </div>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
              Payment Verification Failed
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--slate)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              We couldn't verify this payment signature with our backend. Your subscription has not been activated. If amount was deducted, it will be automatically refunded by your bank.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost"
                style={{ flex: 1, padding: '11px', fontSize: '14px', justifyContent: 'center' }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={onRetry}
                className="btn btn-primary"
                style={{ flex: 1, padding: '11px', fontSize: '14px', justifyContent: 'center' }}
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
