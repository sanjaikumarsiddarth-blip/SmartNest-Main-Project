import React from 'react';

/**
 * Official SmartNest Brand Component
 * Renders the iconic dark rounded icon with home silhouette & teal accent dot,
 * bold 'SmartNest' typography (no standalone 'AI'), and optional 'Find-Match-Move' tagline.
 */
export const SmartNestBrand = ({
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  withTagline = true,
  iconSize = 42,
  textSize = '22px',
  taglineSize = '11.5px',
  style = {}
}) => {
  const isVertical = orientation === 'vertical';

  return (
    <div
      className="smartnest-brand-block"
      style={{
        display: 'inline-flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: 'center',
        gap: isVertical ? '6px' : '12px',
        textAlign: isVertical ? 'center' : 'left',
        textDecoration: 'none',
        ...style
      }}
    >
      {/* Official SmartNest Logo Icon with Teal Accent Dot */}
      <div
        className="brand-logo-icon"
        style={{
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          borderRadius: `${Math.round(iconSize * 0.28)}px`,
          backgroundColor: 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative'
        }}
      >
        <svg
          width={Math.round(iconSize * 0.58)}
          height={Math.round(iconSize * 0.58)}
          viewBox="0 0 24 24"
          fill="none"
        >
          {/* Home shape */}
          <path
            d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Teal Accent Dot */}
          <circle cx="12" cy="14" r="2.5" fill="var(--teal)" />
        </svg>
      </div>

      {/* Brand Name & Subtle Tagline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isVertical ? 'center' : 'flex-start',
          lineHeight: 1.15
        }}
      >
        <span
          style={{
            fontSize: textSize,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            lineHeight: 1.15,
            whiteSpace: 'nowrap'
          }}
        >
          SmartNest
        </span>

        {withTagline && (
          <span
            style={{
              fontSize: taglineSize,
              color: 'var(--slate)',
              fontWeight: 500,
              letterSpacing: '0.02em',
              marginTop: '2px',
              textTransform: 'none',
              lineHeight: 1.2,
              whiteSpace: 'nowrap'
            }}
          >
            Find-Match-Move
          </span>
        )}
      </div>
    </div>
  );
};
