import React from 'react';

export const MatchScoreBadge = ({
  score = 90,
  size = 64,
  showLabel = true
}) => {
  // Score Tiers:
  // 95–100: "Excellent Match", teal fill
  // 85–94:  "Great Match", blue-teal fill
  // 70–84:  "Good Match", amber fill
  // <70:    "Partial Match", slate fill

  let strokeColor = '#2A9D8F';
  let labelText = 'Great Match';
  let badgeClass = 'badge-teal';

  if (score >= 95) {
    strokeColor = '#2A9D8F';
    labelText = 'Excellent Match';
    badgeClass = 'badge-teal';
  } else if (score >= 85) {
    strokeColor = '#1F7A8C';
    labelText = 'Great Match';
    badgeClass = 'badge-teal';
  } else if (score >= 70) {
    strokeColor = '#E9C46A';
    labelText = 'Good Match';
    badgeClass = 'badge-amber';
  } else {
    strokeColor = '#64748B';
    labelText = 'Partial Match';
    badgeClass = 'badge-slate';
  }

  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--mist)"
            strokeWidth="5"
            fill="transparent"
          />
          {/* Animated Value Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 800ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </svg>

        {/* Center Percentage Display */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <span
            style={{
              fontSize: size >= 100 ? '28px' : size >= 60 ? '16px' : '12px',
              fontWeight: 700,
              color: 'var(--ink)',
              lineHeight: 1
            }}
          >
            {score}%
          </span>
          {size >= 100 && (
            <span style={{ fontSize: '11px', color: 'var(--slate)', fontWeight: 600, marginTop: '2px' }}>
              Match
            </span>
          )}
        </div>
      </div>

      {showLabel && (
        <span
          className={`badge-pill ${badgeClass}`}
          style={{
            fontSize: size >= 100 ? '13px' : '11px',
            padding: '2px 8px',
            textAlign: 'center',
            fontWeight: 600
          }}
        >
          {labelText}
        </span>
      )}
    </div>
  );
};
