import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  requiresReason = false,
  reasonPlaceholder = "Please provide a reason for this decision...",
  onConfirm,
  onCancel
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (requiresReason && !reason.trim()) {
      setError('Reason is required to proceed.');
      return;
    }
    onConfirm(requiresReason ? reason : undefined);
    setReason('');
    setError('');
  };

  const handleCancel = () => {
    setReason('');
    setError('');
    onCancel();
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
          maxWidth: '480px',
          padding: '28px',
          borderRadius: 'var(--radius-modal)',
          boxShadow: 'var(--shadow-modal)',
          animation: 'fadeUpPage 250ms ease-out'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isDestructive && (
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#FDEEE9',
                  color: 'var(--rose)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertTriangle size={20} />
              </div>
            )}
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)' }}>
              {title}
            </h3>
          </div>

          <button
            onClick={handleCancel}
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

        <p style={{ fontSize: '14px', color: 'var(--slate)', marginBottom: requiresReason ? '16px' : '24px' }}>
          {message}
        </p>

        {requiresReason && (
          <div style={{ marginBottom: '20px' }}>
            <label className="smartnest-label" htmlFor="confirm-reason">
              Reason for Action
            </label>
            <textarea
              id="confirm-reason"
              className="smartnest-input"
              rows={3}
              placeholder={reasonPlaceholder}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError('');
              }}
              style={{ resize: 'vertical' }}
            />
            {error && (
              <span style={{ fontSize: '12px', color: 'var(--rose)', marginTop: '4px', display: 'block' }}>
                {error}
              </span>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-ghost" onClick={handleCancel}>
            {cancelText}
          </button>
          <button
            className={`btn ${isDestructive ? 'btn-destructive' : 'btn-primary'}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
