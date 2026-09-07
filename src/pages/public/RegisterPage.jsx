import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserPlus, User, Mail, Lock, CheckCircle2 } from 'lucide-react';

export const RegisterPage = () => {
  const { register, getDashboardPath } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('buyer'); // 'buyer' | 'seller'
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    try {
      const user = await register(name, email, password, role);
      addToast({ type: 'success', message: `Account created successfully! Welcome to SmartNest.` });
      const target = getDashboardPath(user.role);
      navigate(target);
    } catch (err) {
      setErrors({ form: err.message || 'Registration failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="page-entrance"
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}
    >
      <div
        className="smartnest-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '36px 32px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--teal-light)',
              color: 'var(--teal)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}
          >
            <UserPlus size={24} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)' }}>
            Create Your SmartNest Account
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--slate)', marginTop: '4px' }}>
            Experience intelligent real-estate matching tailored to your lifestyle
          </p>
        </div>

        {errors.form && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#FDEEE9',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #F8CDBE',
              color: 'var(--rose)',
              fontSize: '13px',
              marginBottom: '20px'
            }}
          >
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Role Selector Tabs (Buyer vs Seller only) */}
          <div style={{ marginBottom: '20px' }}>
            <label className="smartnest-label">I want to join as a:</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                padding: '4px',
                backgroundColor: 'var(--mist)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <button
                type="button"
                onClick={() => setRole('buyer')}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: role === 'buyer' ? 'var(--white)' : 'transparent',
                  color: role === 'buyer' ? 'var(--teal)' : 'var(--slate)',
                  fontWeight: role === 'buyer' ? 600 : 500,
                  fontSize: '13px',
                  boxShadow: role === 'buyer' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {role === 'buyer' && <CheckCircle2 size={14} color="var(--teal)" />}
                Home Buyer / Seeker
              </button>

              <button
                type="button"
                onClick={() => setRole('seller')}
                style={{
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: role === 'seller' ? 'var(--white)' : 'transparent',
                  color: role === 'seller' ? 'var(--teal)' : 'var(--slate)',
                  fontWeight: role === 'seller' ? 600 : 500,
                  fontSize: '13px',
                  boxShadow: role === 'seller' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {role === 'seller' && <CheckCircle2 size={14} color="var(--teal)" />}
                Property Seller / Builder
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div style={{ marginBottom: '16px' }}>
            <label className="smartnest-label" htmlFor="register-name">
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-name"
                type="text"
                className="smartnest-input"
                placeholder="e.g. Aarav Sharma"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                style={{
                  paddingLeft: '38px',
                  borderColor: errors.name ? 'var(--rose)' : 'var(--border)'
                }}
              />
              <User size={16} color="var(--slate)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
            {errors.name && (
              <span style={{ fontSize: '12px', color: 'var(--rose)', marginTop: '4px', display: 'block' }}>
                {errors.name}
              </span>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label className="smartnest-label" htmlFor="register-email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-email"
                type="email"
                className="smartnest-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                style={{
                  paddingLeft: '38px',
                  borderColor: errors.email ? 'var(--rose)' : 'var(--border)'
                }}
              />
              <Mail size={16} color="var(--slate)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
            {errors.email && (
              <span style={{ fontSize: '12px', color: 'var(--rose)', marginTop: '4px', display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label className="smartnest-label" htmlFor="register-password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-password"
                type="password"
                className="smartnest-input"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                style={{
                  paddingLeft: '38px',
                  borderColor: errors.password ? 'var(--rose)' : 'var(--border)'
                }}
              />
              <Lock size={16} color="var(--slate)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
            {errors.password && (
              <span style={{ fontSize: '12px', color: 'var(--rose)', marginTop: '4px', display: 'block' }}>
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '24px' }}>
            <label className="smartnest-label" htmlFor="register-confirm">
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-confirm"
                type="password"
                className="smartnest-input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                style={{
                  paddingLeft: '38px',
                  borderColor: errors.confirmPassword ? 'var(--rose)' : 'var(--border)'
                }}
              />
              <Lock size={16} color="var(--slate)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            </div>
            {errors.confirmPassword && (
              <span style={{ fontSize: '12px', color: 'var(--rose)', marginTop: '4px', display: 'block' }}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            disabled={submitting}
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--slate)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
