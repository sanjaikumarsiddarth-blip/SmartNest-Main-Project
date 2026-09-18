import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  Users,
  Target,
  Heart,
  MessageSquare,
  ArrowLeft,
  TrendingUp,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

export const BuyerInsightsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const data = await api.getBuyerInsights(id);
        setInsights(data);
      } catch (err) {
        addToast({ type: 'error', message: 'Failed to load buyer intelligence.' });
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [id, addToast]);

  if (loading) {
    return (
      <div className="container-main" style={{ padding: '60px 0' }}>
        <div className="skeleton-shimmer" style={{ width: '40%', height: '36px', marginBottom: '16px' }} />
        <div className="skeleton-shimmer" style={{ width: '100%', height: '360px', borderRadius: '16px' }} />
      </div>
    );
  }

  const d = insights || {};

  return (
    <div className="page-entrance" style={{ padding: '40px 0 100px 0', backgroundColor: '#F8FAFC', minHeight: '90vh' }}>
      <div className="container-main">
        {/* Navigation Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-ghost"
            style={{ padding: '6px 10px' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Signature Analytics
            </span>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)' }}>
              {d.property_title} — Buyer Match Intelligence
            </h1>
          </div>
        </div>

        {/* ── TOP STATS ROW (4 CARDS) ────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}
        >
          <div className="smartnest-card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '13px', color: 'var(--slate)', fontWeight: 500 }}>Total Potential Buyers</span>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', margin: '8px 0 4px 0' }}>
              {d.total_potential_buyers}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} /> High buyer intent pool
            </div>
          </div>

          <div className="smartnest-card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '13px', color: 'var(--slate)', fontWeight: 500 }}>Average Match Score</span>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--teal)', margin: '8px 0 4px 0' }}>
              {d.avg_match_score}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--slate)' }}>
              Top 5% across city listings
            </div>
          </div>

          <div className="smartnest-card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '13px', color: 'var(--slate)', fontWeight: 500 }}>Shortlists</span>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', margin: '8px 0 4px 0' }}>
              {d.shortlists}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: 600 }}>
              Saved in active baskets
            </div>
          </div>

          <div className="smartnest-card" style={{ padding: '24px' }}>
            <span style={{ fontSize: '13px', color: 'var(--slate)', fontWeight: 500 }}>Direct Inquiries</span>
            <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', margin: '8px 0 4px 0' }}>
              {d.enquiries}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--slate)' }}>
              Site inspection requests
            </div>
          </div>
        </div>

        {/* ── MATCH TIER BREAKDOWN & DONUT CHART ROW ─────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '28px',
            marginBottom: '32px'
          }}
        >
          {/* Match Tier Breakdown */}
          <div className="smartnest-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
              Match Tier Breakdown
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '24px' }}>
              Buyer distribution categorized by neural lifestyle fit
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {d.match_tiers?.map((tier) => (
                <div key={tier.tier} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 500 }}>
                    <span style={{ color: 'var(--ink)' }}>{tier.tier}</span>
                    <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{tier.buyers} buyers ({tier.pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--mist)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${tier.pct}%`,
                        backgroundColor: tier.color,
                        borderRadius: '999px'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Donut Chart: Top Lifestyle Types */}
          <div className="smartnest-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
              Top Lifestyle Types Matching Your Property
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '16px' }}>
              Archetype clustering from buyer profile responses
            </p>

            <div style={{ width: '100%', height: '240px', marginTop: 'auto' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={d.top_lifestyles || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {d.top_lifestyles?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => `${val}%`}
                    contentStyle={{ backgroundColor: '#0D1B2A', color: '#FFF', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── AGGREGATED BUYER PREFERENCES PANEL ──────────────── */}
        <div className="smartnest-card" style={{ padding: '28px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
            What Matched Buyers are Looking For
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '24px' }}>
            Aggregated survey signals from high-compatibility prospective buyers
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px'
            }}
          >
            {/* Preference 1 */}
            <div>
              <span style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Most Common Budget Range</span>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: '4px 0 8px 0' }}>
                {d.top_buyer_preferences?.budget_range || '₹50L – ₹65L'}
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--teal-light)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', backgroundColor: 'var(--teal)' }} />
              </div>
            </div>

            {/* Preference 2 */}
            <div>
              <span style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Preferred BHK</span>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: '4px 0 8px 0' }}>
                {d.top_buyer_preferences?.preferred_bhk || '2 BHK (68%)'}
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--teal-light)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '68%', height: '100%', backgroundColor: 'var(--teal)' }} />
              </div>
            </div>

            {/* Preference 3 */}
            <div>
              <span style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Commute Priority</span>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: '4px 0 8px 0' }}>
                {d.top_buyer_preferences?.commute_priority || 'High (82%)'}
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--teal-light)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '82%', height: '100%', backgroundColor: 'var(--teal)' }} />
              </div>
            </div>

            {/* Preference 4 */}
            <div>
              <span style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>School Proximity</span>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: '4px 0 8px 0' }}>
                {d.top_buyer_preferences?.school_priority || 'High (74%)'}
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--teal-light)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '74%', height: '100%', backgroundColor: 'var(--teal)' }} />
              </div>
            </div>

            {/* Preference 5 */}
            <div>
              <span style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Acoustic Noise Sensitivity</span>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: '4px 0 8px 0' }}>
                {d.top_buyer_preferences?.noise_preference || 'Low Noise (91%)'}
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--teal-light)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '91%', height: '100%', backgroundColor: 'var(--teal)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── INSIGHT CALLOUT BOX (TEAL-LIGHT BACKGROUND) ──────── */}
        <div
          className="smartnest-card"
          style={{
            padding: '28px',
            backgroundColor: 'var(--teal-light)',
            border: '1.5px solid var(--teal)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={20} color="var(--teal)" />
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)' }}>
              AI Growth & Positioning Intelligence
            </h3>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--ink)', lineHeight: 1.6 }}>
            {d.ai_insight || "Your property's low noise level and school proximity are its strongest match drivers — 91% of interested buyers listed noise as high priority."}
          </p>
        </div>
      </div>
    </div>
  );
};
