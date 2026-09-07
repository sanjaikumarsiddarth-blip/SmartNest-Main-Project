import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--ink)',
        color: '#E2E8F0',
        padding: '64px 0 32px 0',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        marginTop: 'auto'
      }}
    >
      <div className="container-main">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '48px'
          }}
        >
          {/* Column 1: Brand & Tagline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--teal)' }} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#FFFFFF' }}>
                SmartNest <span style={{ color: 'var(--teal)' }}>AI</span>
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.6, maxWidth: '280px' }}>
              "Find a home that fits your life." Next-generation PropTech powered by lifestyle intelligence.
            </p>
          </div>

          {/* Column 2: Platform Roles */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
              Platform
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#94A3B8' }}>
              <Link to="/buyer/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
                Buyer Portal
              </Link>
              <Link to="/seller/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
                Seller Intelligence
              </Link>
              <Link to="/admin/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>
                Admin Operations
              </Link>
              <Link to="/buyer/quiz" style={{ color: 'inherit', textDecoration: 'none' }}>
                Lifestyle Quiz
              </Link>
            </div>
          </div>

          {/* Column 3: Trust & Intelligence */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
              Intelligence
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#94A3B8' }}>
              <span>Commute Optimization</span>
              <span>Acoustic Buffers</span>
              <span>School Walkability</span>
              <span>Green & Wellness Score</span>
            </div>
          </div>

          {/* Column 4: Legal & Compliance */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
              Company
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#94A3B8' }}>
              <a href="#privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
              <a href="#contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact & Support</a>
              <span style={{ fontSize: '12px', color: 'var(--teal)' }}>SNS Workflows Verified</span>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '13px',
            color: '#64748B'
          }}
        >
          <span>© 2026 SmartNest AI, Inc. All rights reserved.</span>
          <span>Zero Business Logic Frontend Architecture. REST API / HTTP JSON Only.</span>
        </div>
      </div>
    </footer>
  );
};
