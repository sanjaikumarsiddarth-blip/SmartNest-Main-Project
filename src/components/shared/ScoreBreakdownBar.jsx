import React, { useEffect, useState } from 'react';

export const ScoreBreakdownBar = ({ label, score, max = 20, icon: Icon }) => {
  const [fillWidth, setFillWidth] = useState(0);
  const percentage = Math.min(100, Math.max(0, (score / max) * 100));

  useEffect(() => {
    // Animate width from 0 on mount (400ms ease-out)
    const timer = setTimeout(() => {
      setFillWidth(percentage);
    }, 50);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, color: 'var(--ink)' }}>
          {Icon && <Icon size={14} color="var(--teal)" />}
          {label}
        </span>
        <span style={{ color: 'var(--slate)', fontWeight: 600, fontSize: '12px' }}>
          {score} <span style={{ color: '#94A3B8', fontWeight: 400 }}>/ {max}</span>
        </span>
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--teal-light)',
          borderRadius: '999px',
          overflow: 'hidden'
        }}
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          style={{
            height: '100%',
            width: `${fillWidth}%`,
            backgroundColor: 'var(--teal)',
            borderRadius: '999px',
            transition: 'width 400ms cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      </div>
    </div>
  );
};
