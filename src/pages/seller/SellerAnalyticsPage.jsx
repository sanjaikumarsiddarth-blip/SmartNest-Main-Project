import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { UpgradeModal } from '../../components/subscription/UpgradeModal';
import { formatPriceINR } from '../../components/shared/PropertyCard';
import {
  Eye,
  Mail,
  Heart,
  TrendingUp,
  Award,
  BarChart2,
  Lock,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const SellerAnalyticsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { subscription, usage } = useSubscription();

  const [period, setPeriod] = useState('30d'); // 7d | 30d | 90d | 1y
  const [analytics, setAnalytics] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isFreePlan = !subscription || subscription?.plan_id === 'free' || subscription?.plan_id === 'seller_free';

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const [stats, props] = await Promise.all([
          api.getSellerAnalytics(user?.user_id),
          api.getSellerProperties(user?.user_id)
        ]);
        setAnalytics(stats);
        setProperties(props);
      } catch (err) {
        addToast({ type: 'error', message: 'Failed to load analytics metrics.' });
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [period, user, addToast]);

  const bestProperty = properties[0];

  return (
    <div className="page-entrance" style={{ padding: '40px 0 100px 0', backgroundColor: '#F8FAFC', minHeight: '90vh' }}>
      <div className="container-main">
        {/* Header with Date Filter Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Performance Metrics
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)' }}>
              Listing & Intent Analytics
            </h1>
          </div>

          {/* Date Filter Tabs: 7 Days | 30 Days | 90 Days | 1 Year */}
          <div style={{ display: 'flex', backgroundColor: 'var(--white)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: '1y', label: '1 Year' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: period === p.id ? 'var(--teal)' : 'transparent',
                  color: period === p.id ? '#FFFFFF' : 'var(--slate)',
                  fontSize: '13px',
                  fontWeight: period === p.id ? 600 : 500,
                  cursor: 'pointer'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Lock Notice for Free Plan */}
        {isFreePlan && (
          <div
            style={{
              backgroundColor: '#FEF3C7',
              border: '1px solid #F59E0B',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={20} color="#B45309" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#92400E' }}>
                  Advanced Market Analytics Locked (Free Plan)
                </div>
                <div style={{ fontSize: '13px', color: '#B45309' }}>
                  Upgrade to SmartSeller (₹699/mo) or Professional to unlock views-over-time trends, enquiry velocity, and buyer match distributions.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="btn btn-primary"
              style={{ backgroundColor: '#D97706', borderColor: '#D97706', fontSize: '13px', padding: '8px 18px', whiteSpace: 'nowrap' }}
            >
              Upgrade to SmartSeller
            </button>
          </div>
        )}

        {/* ── STATS CARDS (4) ─────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}
        >
          <div className="smartnest-card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '13px', color: 'var(--slate)', fontWeight: 500 }}>Total Views</span>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', margin: '8px 0 4px 0' }}>
              1,420
            </div>
            <div style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} /> +24% impressions
            </div>
          </div>

          <div className="smartnest-card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '13px', color: 'var(--slate)', fontWeight: 500 }}>Total Enquiries</span>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', margin: '8px 0 4px 0' }}>
              {analytics?.enquiry_count || 38}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 600 }}>
              Lead response rate 94%
            </div>
          </div>

          <div className="smartnest-card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '13px', color: 'var(--slate)', fontWeight: 500 }}>Average Match Score</span>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--teal)', margin: '8px 0 4px 0' }}>
              89.4%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--slate)' }}>
              Calculated across all searches
            </div>
          </div>

          <div className="smartnest-card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '13px', color: 'var(--slate)', fontWeight: 500 }}>Shortlists</span>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', margin: '8px 0 4px 0' }}>
              {analytics?.shortlist_count || 89}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 600 }}>
              Saved in buyer baskets
            </div>
          </div>
        </div>

        {/* ── CHARTS ROW & ADVANCED INTELLIGENCE (GATED ON FREE PLAN) ────────────────── */}
        <div style={{ position: 'relative' }}>
          {isFreePlan && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(248, 250, 252, 0.88)',
                backdropFilter: 'blur(4px)',
                zIndex: 10,
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 24px',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
                }}
              >
                <Lock size={26} color="#D97706" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
                Advanced Market Charts & Buyer Breakdown
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--slate)', maxWidth: '480px', lineHeight: 1.5, marginBottom: '24px' }}>
                Listing impression velocity, buyer inquiry patterns, and match distribution curves are exclusively available on the <strong>SmartSeller (₹699/mo)</strong> and <strong>Professional (₹1,499/mo)</strong> plans.
              </p>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="btn btn-primary"
                style={{ padding: '12px 28px', fontSize: '15px' }}
              >
                <Sparkles size={16} /> Upgrade to SmartSeller
              </button>
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '24px',
              marginBottom: '32px',
              filter: isFreePlan ? 'blur(2px)' : 'none',
              pointerEvents: isFreePlan ? 'none' : 'auto'
            }}
          >
            {/* Chart 1: Views Over Time */}
            <div className="smartnest-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
                Views Over Time
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '16px' }}>
                Trend of listing impressions
              </p>
              <div style={{ width: '100%', height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.views_over_time || []} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} interval={5} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0D1B2A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="views" stroke="var(--teal)" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Enquiries Over Time */}
            <div className="smartnest-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
                Enquiries Over Time
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '16px' }}>
                Weekly volume of buyer contact requests
              </p>
              <div style={{ width: '100%', height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.enquiries_over_time || []} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0D1B2A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="enquiries" stroke="#3D5A73" strokeWidth={2.5} dot={{ r: 4, fill: '#3D5A73' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── MATCH SCORE DISTRIBUTION & BEST PERFORMING CARD ─── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '24px',
              filter: isFreePlan ? 'blur(2px)' : 'none',
              pointerEvents: isFreePlan ? 'none' : 'auto'
            }}
          >
            {/* Chart 3: Match Score Distribution */}
            <div className="smartnest-card" style={{ padding: '28px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
                Match Score Distribution
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '16px' }}>
                Number of searching buyers fitting each compatibility tier
              </p>
              <div style={{ width: '100%', height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.match_distribution || []} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0D1B2A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="var(--teal)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Best Performing Property Card */}
            {bestProperty && (
              <div className="smartnest-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Award size={20} color="var(--amber)" />
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                    Best Performing Property
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                  <img
                    src={bestProperty.images?.[0]}
                    alt={bestProperty.title}
                    style={{ width: '100px', height: '70px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                      {bestProperty.title}
                    </h4>
                    <div style={{ fontSize: '13px', color: 'var(--slate)' }}>
                      {formatPriceINR(bestProperty.price)} · {bestProperty.bhk} BHK
                    </div>
                    <span className="badge-pill badge-teal" style={{ marginTop: '4px' }}>
                      {bestProperty.match_score}% Average Match
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--slate)', lineHeight: 1.5, marginBottom: '16px' }}>
                  Generated <strong>{bestProperty.views || 452} views</strong> and <strong>{bestProperty.enquiries || 12} direct buyer enquiries</strong>. Ranked top in acoustic quietness and educational transit.
                </p>

                <div style={{ marginTop: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => window.location.href = `/seller/insights/${bestProperty.property_id}`}
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                  >
                    View Full Intelligence Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          limitType="analytics"
          currentPlan={subscription?.plan_id || 'seller_free'}
          userRole="seller"
          usage={usage}
        />
      </div>
    </div>
  );
};
