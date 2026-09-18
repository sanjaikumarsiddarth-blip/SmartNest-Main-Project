import React, { useEffect, useState } from 'react';

export const ScoreBreakdownBar = ({ label, score, max = 100, icon: Icon, isPercentage = true }) => {
  // If score is an object like { score: 18, max: 20 }, extract it
  const numScore = typeof score === 'object' && score !== null ? score.score : Number(score) || 0;
  const numMax = typeof score === 'object' && score !== null ? (score.max || 20) : max;

  const percentage = Math.min(100, Math.max(0, (numScore / numMax) * 100));
  const [fillWidth, setFillWidth] = useState(0);

  useEffect(() => {
    // Animate width from 0 on mount (400ms ease-out)
    const timer = setTimeout(() => {
      setFillWidth(percentage);
    }, 50);
    return () => clearTimeout(timer);
  }, [percentage]);

  const displayPercentage = numMax === 100 || isPercentage;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, color: 'var(--ink)' }}>
          {Icon && <Icon size={14} color="var(--teal)" />}
          {label}
        </span>
        <span style={{ color: 'var(--slate)', fontWeight: 600, fontSize: '12px' }}>
          {displayPercentage ? (
            <span style={{ color: 'var(--teal)', fontWeight: 700 }}>{Math.round(percentage)}%</span>
          ) : (
            <>
              {numScore} <span style={{ color: '#94A3B8', fontWeight: 400 }}>/ {numMax}</span>
            </>
          )}
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
        aria-valuenow={numScore}
        aria-valuemin={0}
        aria-valuemax={numMax}
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
