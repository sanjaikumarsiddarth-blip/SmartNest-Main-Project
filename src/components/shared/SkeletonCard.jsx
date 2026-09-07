import React from 'react';

export const SkeletonCard = () => {
  return (
    <div
      className="smartnest-card"
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '420px',
        width: '100%'
      }}
      aria-hidden="true"
    >
      {/* Image shimmer */}
      <div className="skeleton-shimmer" style={{ width: '100%', height: '200px' }} />

      {/* Body shimmer */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton-shimmer" style={{ width: '60%', height: '22px' }} />
          <div className="skeleton-shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
        </div>

        <div className="skeleton-shimmer" style={{ width: '40%', height: '14px' }} />
        <div className="skeleton-shimmer" style={{ width: '30%', height: '20px' }} />

        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <div className="skeleton-shimmer" style={{ width: '60px', height: '24px', borderRadius: '999px' }} />
          <div className="skeleton-shimmer" style={{ width: '80px', height: '24px', borderRadius: '999px' }} />
          <div className="skeleton-shimmer" style={{ width: '70px', height: '24px', borderRadius: '999px' }} />
        </div>
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="smartnest-card" style={{ padding: '20px', width: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="skeleton-shimmer" style={{ width: '100%', height: '32px' }} />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-shimmer" style={{ width: '100%', height: '48px' }} />
        ))}
      </div>
    </div>
  );
};
