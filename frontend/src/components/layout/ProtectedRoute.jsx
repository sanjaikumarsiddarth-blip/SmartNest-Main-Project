import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AccessDenied } from '../../pages/public/AccessDenied';

export const ProtectedRoute = ({ allowedRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="skeleton-shimmer" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
      </div>
    );
  }

  // If no user or token, redirect to /login with return location
  if (!user || !user.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role doesn't match, show Access Denied
  if (allowedRole && user.role !== allowedRole) {
    return <AccessDenied />;
  }

  return <Outlet />;
};
