import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  Users,
  Building,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Activity,
  ArrowRight,
  Clock
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [properties, setProperties] = useState([]);
  const [reports, setReports] = useState([]);
  const [health, setHealth] = useState({
    backend: 'online',
    database: 'online',
    ai_service: 'online',
    api: 'online'
  });
  const [loading, setLoading] = useState(true);

  // Poll system health every 60s
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const h = await api.getSystemHealth();
        setHealth(h);
      } catch (e) {}
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stats, props, reps] = await Promise.all([
        api.getAdminAnalytics(),
        api.getProperties(),
        api.getReports()
      ]);
      setAnalytics(stats);
      setProperties(props);
      setReports(reps);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickApprove = async (propId) => {
    try {
      await api.approveProperty(propId);
      setProperties((prev) =>
        prev.map((p) => (p.property_id === propId ? { ...p, status: 'active' } : p))
      );
      addToast({ type: 'success', message: 'Property approved and live.' });
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to approve property.' });
    }
  };

  const pendingApprovals = properties.filter((p) => p.status === 'pending').slice(0, 5);
  const recentReports = reports.slice(0, 3);

  return (
    <div className="page-entrance" style={{ padding: '32px 0 100px 0', backgroundColor: '#F1F5F9', minHeight: '90vh' }}>
      <div className="container-main">
        {/* Ops Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              System Administration & Moderation
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>
              SmartNest Admin Operations · {user?.name || 'Vikram Malhotra'}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/admin/properties" className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
              Moderate Listings
            </Link>
            <Link to="/admin/analytics" className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
              Platform Metrics
            </Link>
          </div>
        </div>

        {/* ── SYSTEM HEALTH STRIP (4 STATUS DOTS, POLLS 60S) ──── */}
        <div
          className="smartnest-card"
          style={{
            padding: '14px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            backgroundColor: 'var(--white)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
            <Activity size={16} color="var(--teal)" />
            <span>Infrastructure Health Status:</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { label: 'SNS Backend', status: health.backend },
              { label: 'Database', status: health.database },
              { label: 'AI Match Engine', status: health.ai_service },
              { label: 'Gateway API', status: health.api }
            ].map((node) => {
              const color = node.status === 'online' ? 'var(--teal)' : node.status === 'degraded' ? 'var(--amber)' : 'var(--rose)';
              return (
                <div key={node.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--slate)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                  <span style={{ fontWeight: 500 }}>{node.label}</span>
                  <span style={{ color, fontWeight: 600, textTransform: 'capitalize' }}>({node.status})</span>
                </div>
              );
            })}
          </div>

          <span style={{ fontSize: '11px', color: 'var(--slate)' }}>
            Auto-polling 60s
          </span>
        </div>

        {/* ── STATS ROW (7 COMPACT CARDS) ────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '14px',
            marginBottom: '32px'
          }}
        >
          <div className="smartnest-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Total Users</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
              {analytics?.total_users || 1428}
            </div>
          </div>

          <div className="smartnest-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Total Sellers</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
              {analytics?.total_sellers || 86}
            </div>
          </div>

          <div className="smartnest-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Total Properties</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
              {properties.length}
            </div>
          </div>

          <div className="smartnest-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Active Listings</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--teal)', marginTop: '4px' }}>
              {properties.filter((p) => p.status === 'active').length}
            </div>
          </div>

          <div className="smartnest-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Pending Approval</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--amber)', marginTop: '4px' }}>
              {pendingApprovals.length}
            </div>
          </div>

          <div className="smartnest-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Reported Listings</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--rose)', marginTop: '4px' }}>
              {reports.filter((r) => r.status === 'pending').length}
            </div>
          </div>

          <div className="smartnest-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Recommendations</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
              {analytics?.recommendations_total?.toLocaleString() || '18,720'}
            </div>
          </div>
        </div>

        {/* ── TWO COLUMN OPERATIONAL TABLES ───────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px'
          }}
        >
          {/* Pending Approvals Quick List (Top 5) */}
          <div className="smartnest-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                  Pending Listing Approvals ({pendingApprovals.length})
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--slate)' }}>
                  New seller submissions awaiting compliance verification
                </p>
              </div>
              <Link to="/admin/properties" style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>
                All Properties →
              </Link>
            </div>

            {pendingApprovals.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendingApprovals.map((p) => (
                  <div
                    key={p.property_id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      backgroundColor: 'var(--mist)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{p.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--slate)' }}>{p.city} · {p.bhk} BHK · ₹{Math.round(p.price / 100000)}L</div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleQuickApprove(p.property_id)}
                        className="btn btn-primary"
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => navigate('/admin/properties')}
                        className="btn btn-ghost"
                        style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid var(--border)' }}
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--slate)', fontSize: '13px' }}>
                <CheckCircle2 size={24} color="var(--teal)" style={{ margin: '0 auto 8px auto' }} />
                No pending property approvals in queue.
              </div>
            )}
          </div>

          {/* Recent Reports (Top 3) */}
          <div className="smartnest-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                  Reported Listings Queue ({reports.filter((r) => r.status === 'pending').length})
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--slate)' }}>
                  Community flags regarding acoustics, specs, or pricing
                </p>
              </div>
              <Link to="/admin/reports" style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>
                All Reports →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentReports.map((rep) => (
                <div
                  key={rep.report_id}
                  style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--mist)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{rep.property_title}</span>
                    <span className={`badge-pill ${rep.status === 'pending' ? 'badge-rose' : 'badge-teal'}`} style={{ fontSize: '10px' }}>
                      {rep.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--slate)', lineHeight: 1.4 }}>
                    "{rep.reason}"
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--slate)' }}>Reported by: {rep.reported_by}</span>
                    <button
                      onClick={() => navigate('/admin/reports')}
                      className="btn btn-secondary"
                      style={{ padding: '2px 8px', fontSize: '11px' }}
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
