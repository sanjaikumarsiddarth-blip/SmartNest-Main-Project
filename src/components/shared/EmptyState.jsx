import React from 'react';
import { Sparkles } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Sparkles,
  heading = "No items found",
  subtext = "Try adjusting your filters or search query to find what you need.",
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  recoveryButtons = []
}) => {
  return (
    <div
      className="smartnest-card"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        margin: '24px 0'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--teal-light)',
          color: 'var(--teal)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}
      >
        <Icon size={30} strokeWidth={1.75} />
      </div>

      <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
        {heading}
      </h3>

      <p style={{ fontSize: '14px', color: 'var(--slate)', maxWidth: '460px', marginBottom: '24px' }}>
        {subtext}
      </p>

      {/* Recovery Buttons (e.g. for Recommendations zero match recovery) */}
      {recoveryButtons.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
            maxWidth: '600px',
            marginBottom: '16px'
          }}
        >
          {recoveryButtons.map((btn, idx) => (
            <button
              key={idx}
              className="btn btn-secondary"
              style={{ fontSize: '13px', padding: '8px 16px' }}
              onClick={btn.onClick}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      {/* Primary & Secondary Actions */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {actionText && onAction && (
          <button className="btn btn-primary" onClick={onAction}>
            {actionText}
          </button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <button className="btn btn-secondary" onClick={onSecondaryAction}>
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
};
