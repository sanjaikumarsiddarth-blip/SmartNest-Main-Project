import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  TrendingUp,
  Users,
  Building,
  Search,
  Sparkles,
  MapPin
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

export const AdminAnalyticsPage = () => {
  const { addToast } = useToast();

  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.getAdminAnalytics(period);
        setData(res);
      } catch (err) {
        addToast({ type: 'error', message: 'Failed to fetch platform metrics.' });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [period, addToast]);

  const d = data || {};

  return (
    <div className="page-entrance" style={{ padding: '36px 0 100px 0', backgroundColor: '#F1F5F9', minHeight: '90vh' }}>
      <div className="container-main">
        {/* Header with Period Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Platform Ops Intelligence
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--ink)' }}>
              Platform-Wide Analytics
            </h1>
          </div>

          {/* Period Tabs: 7 Days | 30 Days | 90 Days | 1 Year */}
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

        {/* ── TOP STATS SUMMARY (3 STATS) ────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}
        >
          <div className="smartnest-card" style={{ padding: '20px' }}>
            <span style={{ fontSize: '13px', color: 'var(--slate)', fontWeight: 500 }}>Most Searched City</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', margin: '6px 0 2px 0' }}>
              Coimbatore (38%)
            </div>
            <span style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 600 }}>Followed by Bangalore (28%)</span>
          </div>

          <div className="smartnest-card" style={{ padding: '20px' }}>
            <span style={{ fontSize: '13px', color: 'var(--slate)', fontWeight: 500 }}>Most Popular BHK</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)', margin: '6px 0 2px 0' }}>
              2 BHK (64% demand)
            </div>
            <span style={{ fontSize: '12px', color: 'var(--slate)' }}>Average budget bracket ₹50L–₹65L</span>
          </div>

          <div className="smartnest-card" style={{ padding: '20px' }}>
            <span style={{ fontSize: '13px', color: 'var(--slate)', fontWeight: 500 }}>Average Platform Match Score</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--teal)', margin: '6px 0 2px 0' }}>
              {d.avg_match_score || 86.4}%
            </div>
            <span style={{ fontSize: '12px', color: 'var(--slate)' }}>High satisfaction index</span>
          </div>
        </div>

        {/* ── 4 CHARTS GRID (2x2) ─────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px',
            marginBottom: '36px'
          }}
        >
          {/* Chart 1: New Users Over Time */}
          <div className="smartnest-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
              New Users Over Time
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--slate)', marginBottom: '16px' }}>
              Monthly cumulative registered accounts
            </p>
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={d.users_over_time || []} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0D1B2A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="users" stroke="var(--teal)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--teal)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: New Properties Over Time */}
          <div className="smartnest-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
              New Properties Over Time
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--slate)', marginBottom: '16px' }}>
              Monthly verified developer listings submitted
            </p>
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={d.properties_over_time || []} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0D1B2A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="properties" stroke="#3D5A73" strokeWidth={2.5} dot={{ r: 4, fill: '#3D5A73' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Buyer Searches Per Day */}
          <div className="smartnest-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
              Buyer Searches Per Day
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--slate)', marginBottom: '16px' }}>
              Daily lifestyle query volume
            </p>
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.searches_per_day || []} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0D1B2A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="var(--teal)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Recommendations Generated */}
          <div className="smartnest-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
              Recommendations Generated
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--slate)', marginBottom: '16px' }}>
              Total neural score calculations across SNS Workflows
            </p>
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={d.recommendations_generated || []} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0D1B2A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="recs" stroke="#E76F51" strokeWidth={2.5} dot={{ r: 4, fill: '#E76F51' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── TABLE: TOP 5 CITIES BY SEARCH VOLUME ───────────── */}
        <div className="smartnest-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
            Top 5 Geographic Markets by Search Volume
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '20px' }}>
            Regional distribution of buyer demand across the platform
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Rank</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>City</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Total Inquiries</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Share</th>
                </tr>
              </thead>
              <tbody>
                {d.most_searched_locations?.map((loc, idx) => (
                  <tr key={loc.city} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 700, color: 'var(--slate)' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={15} color="var(--teal)" />
                        {loc.city}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
                      {loc.searches.toLocaleString()} searches
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '120px', height: '6px', backgroundColor: 'var(--teal-light)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${loc.percentage * 2.5}%`, height: '100%', backgroundColor: 'var(--teal)' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--teal)' }}>{loc.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
