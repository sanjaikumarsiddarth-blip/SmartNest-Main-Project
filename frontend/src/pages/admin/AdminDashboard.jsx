import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../services/subscriptionConfig';
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
  Clock,
  CreditCard,
  TrendingUp,
  Filter,
  FileText
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [properties, setProperties] = useState([]);
  const [reports, setReports] = useState([]);
  const [revenueMetrics, setRevenueMetrics] = useState(null);
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);

  // Transaction Filters
  const [txRoleFilter, setTxRoleFilter] = useState('all'); // 'all' | 'buyer' | 'seller'
  const [txStatusFilter, setTxStatusFilter] = useState('all'); // 'all' | 'successful' | 'failed' | 'pending' | 'cancelled'

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
      const [stats, props, reps, rev, subs, txs] = await Promise.all([
        api.getAdminAnalytics(),
        api.getProperties(),
        api.getReports(),
        api.getSubscriptionRevenueMetrics(),
        api.getAllSubscriptions(),
        api.getAllPaymentTransactions()
      ]);
      setAnalytics(stats);
      setProperties(props);
      setReports(reps);
      setRevenueMetrics(rev);
      setAllSubscriptions(subs || []);
      setAllTransactions(txs || []);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdated = () => {
      api.getSubscriptionRevenueMetrics().then(setRevenueMetrics).catch(console.error);
      api.getAllSubscriptions().then(setAllSubscriptions).catch(console.error);
      api.getAllPaymentTransactions().then(setAllTransactions).catch(console.error);
    };
    window.addEventListener('smartnest_subscription_updated', handleUpdated);
    return () => window.removeEventListener('smartnest_subscription_updated', handleUpdated);
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

  // Filtered transactions
  const filteredTransactions = allTransactions.filter((tx) => {
    if (txRoleFilter !== 'all' && tx.role !== txRoleFilter) return false;
    if (txStatusFilter !== 'all' && tx.status !== txStatusFilter) return false;
    return true;
  });

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

        {/* Live System Health Bar */}
        <div
          className="smartnest-card"
          style={{
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            backgroundColor: '#FFFFFF'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--teal)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
              Core Infrastructure Health
            </span>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {Object.entries(health).map(([service, status]) => (
              <div key={service} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: status === 'online' ? '#10B981' : '#EF4444'
                  }}
                />
                <span style={{ fontSize: '12px', color: 'var(--slate)', textTransform: 'capitalize' }}>
                  {service.replace('_', ' ')}: <strong style={{ color: 'var(--ink)' }}>{status}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Operational KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}
        >
          <div className="smartnest-card" style={{ padding: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Active Properties</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
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

        {/* ── SUBSCRIPTIONS & REVENUE METRICS ────────────────── */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                  Subscriptions, Revenue & Gateway Operations
                </h2>
                <span
                  className="badge-pill"
                  style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontSize: '11px', fontWeight: 700 }}
                >
                  Razorpay & Demo Gateway
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--slate)', margin: '2px 0 0 0' }}>
                Real-time financial and subscription telemetry for Buyer and Seller tiers
              </p>
            </div>
          </div>

          {/* Revenue KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}
          >
            {/* Total Revenue */}
            <div
              className="smartnest-card"
              style={{
                padding: '20px',
                borderTop: '3px solid var(--teal)',
                background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Total Revenue</span>
                <CreditCard size={18} color="var(--teal)" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)' }}>
                {formatCurrency(revenueMetrics?.total_demo_revenue || 0)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={13} /> Across {revenueMetrics?.active_subscribers || 0} active subscriptions
              </div>
            </div>

            {/* Monthly Recurring Revenue */}
            <div className="smartnest-card" style={{ padding: '20px', borderTop: '3px solid #3B82F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Est. MRR</span>
                <Building size={18} color="#3B82F6" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ink)' }}>
                {formatCurrency(revenueMetrics?.mrr || 0)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '4px' }}>
                Monthly recurring baseline
              </div>
            </div>

            {/* Buyer vs Seller Ratio */}
            <div className="smartnest-card" style={{ padding: '20px', borderTop: '3px solid #8B5CF6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Subscribers by Role</span>
                <Users size={18} color="#8B5CF6" />
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink)' }}>
                {revenueMetrics?.buyer_subscribers || 0} Buyers · {revenueMetrics?.seller_subscribers || 0} Sellers
              </div>
              <div style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '4px' }}>
                {revenueMetrics?.cancelled_subscribers || 0} cancelled · {revenueMetrics?.failed_payments || 0} failed
              </div>
            </div>

            {/* Plan Distribution Breakdown */}
            <div className="smartnest-card" style={{ padding: '18px 20px', borderTop: '3px solid #10B981' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase' }}>
                Plan Breakdown
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                <span className="badge-pill" style={{ backgroundColor: '#F1F5F9', color: 'var(--ink)', fontSize: '11px' }}>
                  Connect: {revenueMetrics?.plans_distribution?.connect || 0}
                </span>
                <span className="badge-pill" style={{ backgroundColor: '#F1F5F9', color: 'var(--ink)', fontSize: '11px' }}>
                  Connect+: {revenueMetrics?.plans_distribution?.connect_plus || 0}
                </span>
                <span className="badge-pill" style={{ backgroundColor: '#F1F5F9', color: 'var(--ink)', fontSize: '11px' }}>
                  Relax: {revenueMetrics?.plans_distribution?.relax || 0}
                </span>
                <span className="badge-pill" style={{ backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '11px' }}>
                  Free: {revenueMetrics?.plans_distribution?.free || 0}
                </span>
                <span className="badge-pill" style={{ backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '11px' }}>
                  SmartSeller: {revenueMetrics?.plans_distribution?.smart_seller || 0}
                </span>
                <span className="badge-pill" style={{ backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '11px' }}>
                  Professional: {revenueMetrics?.plans_distribution?.professional || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Transactions Table with Filters (Section 30) */}
          <div className="smartnest-card" style={{ padding: '24px', marginBottom: '28px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px 0' }}>
                  Recent Payment Transactions Log ({filteredTransactions.length})
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--slate)', margin: 0 }}>
                  Audited transaction events from Razorpay checkout sessions and demo simulations.
                </p>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--slate)' }}>
                  <Filter size={14} /> Filter Role:
                  <select
                    value={txRoleFilter}
                    onChange={(e) => setTxRoleFilter(e.target.value)}
                    style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border)' }}
                  >
                    <option value="all">All Roles</option>
                    <option value="buyer">Buyers</option>
                    <option value="seller">Sellers</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--slate)' }}>
                  Status:
                  <select
                    value={txStatusFilter}
                    onChange={(e) => setTxStatusFilter(e.target.value)}
                    style={{ padding: '5px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid var(--border)' }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="successful">Successful</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--slate)', fontSize: '13px' }}>
                No transactions match the selected filters.
              </div>
            ) : (
              <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--slate)', fontSize: '11.5px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>User</th>
                    <th style={{ padding: '10px 12px' }}>Role</th>
                    <th style={{ padding: '10px 12px' }}>Plan</th>
                    <th style={{ padding: '10px 12px' }}>Amount</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                    <th style={{ padding: '10px 12px' }}>Payment ID</th>
                    <th style={{ padding: '10px 12px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx, idx) => {
                    const maskedId = tx.payment_id
                      ? tx.payment_id.length > 12
                        ? `${tx.payment_id.slice(0, 7)}...${tx.payment_id.slice(-4)}`
                        : tx.payment_id
                      : 'N/A';

                    return (
                      <tr key={tx.payment_id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--ink)' }}>
                          {tx.user_name || tx.user_id}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            className="badge-pill"
                            style={{
                              fontSize: '11px',
                              textTransform: 'capitalize',
                              backgroundColor: tx.role === 'seller' ? '#E0F2FE' : '#F3E8FF',
                              color: tx.role === 'seller' ? '#0284C7' : '#7C3AED'
                            }}
                          >
                            {tx.role}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--ink)' }}>
                          {tx.plan_name}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--ink)' }}>
                          {formatCurrency(tx.amount)}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            className={`badge-pill ${tx.status === 'successful' ? 'badge-teal' : 'badge-rose'}`}
                            style={{ fontSize: '11px', textTransform: 'capitalize' }}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: '11.5px', color: 'var(--slate)' }}>
                          {maskedId}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--slate)' }}>
                          {new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
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
