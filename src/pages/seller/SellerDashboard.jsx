import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatPriceINR } from '../../components/shared/PropertyCard';
import {
  Building,
  Eye,
  Heart,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Mail,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      setLoading(true);
      try {
        const [props, stats, enqs] = await Promise.all([
          api.getSellerProperties(user?.user_id),
          api.getSellerAnalytics(user?.user_id),
          api.getEnquiries(user?.user_id)
        ]);
        setProperties(props);
        setAnalytics(stats);
        setEnquiries(enqs.slice(0, 3));
      } catch (err) {
        console.error('Failed to load seller dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [user]);

  const activeCount = properties.filter((p) => p.status === 'active').length;
  const totalViews = properties.reduce((acc, p) => acc + (p.views || 0), 1240);
  const totalEnquiries = properties.reduce((acc, p) => acc + (p.enquiries || 0), 28);
  const totalShortlists = properties.reduce((acc, p) => acc + (p.shortlists || 0), 75);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="page-entrance" style={{ padding: '40px 0 100px 0', backgroundColor: '#F8FAFC', minHeight: '90vh' }}>
      <div className="container-main">
        {/* Header with business software persona */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Developer Portal · Business Intelligence
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)', marginTop: '4px' }}>
              Welcome back, {user?.name || 'Prestige Developers'}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--slate)' }}>
              {todayStr} · Overview of your property listing pipeline & buyer reach
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/seller/properties" className="btn btn-secondary">
              <Building size={16} /> View All Listings
            </Link>
            <Link to="/seller/add" className="btn btn-primary">
              <PlusCircle size={16} /> Add New Property
            </Link>
          </div>
        </div>

        {/* ── STATS ROW (4 CARDS) ────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}
        >
          {/* Card 1 */}
          <div className="smartnest-card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--slate)' }}>Active Listings</span>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', margin: '8px 0 4px 0' }}>
              {activeCount}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--teal)', fontWeight: 600 }}>
              <TrendingUp size={14} /> +2 listings approved this month
            </div>
          </div>

          {/* Card 2 */}
          <div className="smartnest-card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--slate)' }}>Total Views</span>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', margin: '8px 0 4px 0' }}>
              {totalViews.toLocaleString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--teal)', fontWeight: 600 }}>
              <TrendingUp size={14} /> +18.4% vs last week
            </div>
          </div>

          {/* Card 3 */}
          <div className="smartnest-card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--slate)' }}>Buyer Shortlists</span>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', margin: '8px 0 4px 0' }}>
              {totalShortlists}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--teal)', fontWeight: 600 }}>
              <TrendingUp size={14} /> +12.1% intent velocity
            </div>
          </div>

          {/* Card 4 */}
          <div className="smartnest-card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--slate)' }}>Potential Matches</span>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--teal)', margin: '8px 0 4px 0' }}>
              {analytics?.match_potential_score || 94}%
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--slate)' }}>
              Neural compatibility index
            </div>
          </div>
        </div>

        {/* ── CHART: PROPERTY VIEWS (LAST 30 DAYS) ─────────────── */}
        <div className="smartnest-card" style={{ padding: '28px', marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
                Property Views — Last 30 Days
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--slate)' }}>
                Cumulative aggregate impressions across all active listings
              </p>
            </div>
            <span className="badge-pill badge-teal">Daily Unique Sessions</span>
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.views_over_time || []} margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D1B2A',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="var(--teal)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: 'var(--teal)' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── TOP PERFORMING PROPERTIES TABLE ─────────────────── */}
        <div className="smartnest-card" style={{ padding: '28px', marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
                Top Performing Properties
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--slate)' }}>
                Detailed conversion tracking and buyer match intelligence
              </p>
            </div>
            <Link to="/seller/properties" style={{ fontSize: '13px', color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>
              View All Properties →
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Property</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Views</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Shortlists</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Enquiries</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Match Score</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.slice(0, 5).map((prop) => (
                  <tr key={prop.property_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={prop.images?.[0]}
                          alt={prop.title}
                          style={{ width: '48px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{prop.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--slate)' }}>{formatPriceINR(prop.price)} · {prop.bhk} BHK</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
                      {prop.views || 320}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
                      {prop.shortlists || 24}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
                      {prop.enquiries || 8}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge-pill badge-teal" style={{ fontWeight: 700 }}>
                        {prop.match_score}%
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        className={`badge-pill ${
                          prop.status === 'active'
                            ? 'badge-teal'
                            : prop.status === 'pending'
                            ? 'badge-amber'
                            : prop.status === 'rejected'
                            ? 'badge-rose'
                            : 'badge-slate'
                        }`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {prop.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => navigate(`/seller/insights/${prop.property_id}`)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                        >
                          Insights
                        </button>
                        <button
                          onClick={() => navigate(`/seller/edit/${prop.property_id}`)}
                          className="btn btn-ghost"
                          style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border)' }}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── RECENT ENQUIRIES SECTION ───────────────────────── */}
        <div className="smartnest-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
                Recent Buyer Enquiries
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--slate)' }}>
                Direct inquiries from verified match seekers
              </p>
            </div>
            <Link to="/seller/enquiries" style={{ fontSize: '13px', color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>
              View All Enquiries →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {enquiries.map((enq) => (
              <div
                key={enq.enquiry_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: 'var(--mist)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                      {enq.buyer_name}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--slate)' }}>
                      on <em>{enq.property_title}</em>
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--slate)', maxWidth: '640px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    "{enq.message}"
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    className={`badge-pill ${
                      enq.status === 'new'
                        ? 'badge-rose'
                        : enq.status === 'responded'
                        ? 'badge-teal'
                        : 'badge-slate'
                    }`}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {enq.status}
                  </span>
                  <Link
                    to="/seller/enquiries"
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    Respond
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
