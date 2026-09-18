import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AccessDenied = () => {
  const navigate = useNavigate();
  const { user, getDashboardPath } = useAuth();

  return (
    <div
      className="page-entrance"
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px'
      }}
    >
      <div
        className="smartnest-card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '48px 36px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#FDEEE9',
            color: 'var(--rose)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}
        >
          <ShieldAlert size={32} />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--ink)', marginBottom: '10px' }}>
          Access Denied
        </h2>

        <p style={{ fontSize: '15px', color: 'var(--slate)', marginBottom: '28px', lineHeight: 1.6 }}>
          You do not have the required role permissions to access this dashboard section.
          {user && (
            <span style={{ display: 'block', marginTop: '8px', fontSize: '13px' }}>
              Your current role is: <strong style={{ textTransform: 'capitalize', color: 'var(--ink)' }}>{user.role}</strong>
            </span>
          )}
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} /> Go Back
          </button>

          {user && (
            <button
              onClick={() => navigate(getDashboardPath(user.role))}
              className="btn btn-primary"
            >
              Go to My Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
