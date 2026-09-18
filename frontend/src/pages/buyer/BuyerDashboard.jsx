import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCompare } from '../../context/CompareContext';
import { PropertyCard } from '../../components/shared/PropertyCard';
import { SkeletonCard } from '../../components/shared/SkeletonCard';
import { EmptyState } from '../../components/shared/EmptyState';
import { useSubscription } from '../../context/SubscriptionContext';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sliders,
  CreditCard
} from 'lucide-react';

export const BuyerDashboard = () => {
  const { user, sessionId } = useAuth();
  const { subscription, usage } = useSubscription();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [shortlistIds, setShortlistIds] = useState([]);
  const [aiSearchInput, setAiSearchInput] = useState('');
  const {
    selectedPropertyIds,
    toggleCompare,
    isInCompare,
    clearCompare
  } = useCompare();

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const recData = await api.getRecommendations();
        setRecommendations(recData.properties.slice(0, 3)); // Top 3 for dashboard
        setProfile(recData.profile);

        const history = await api.getSearchHistory(sessionId);
        setRecentSearches(history.slice(0, 3));

        const saved = await api.getSavedProperties(sessionId);
        setShortlistIds(saved.properties.map((p) => p.property_id));
      } catch (err) {
        console.error('Failed to load buyer dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [sessionId]);

  const handleSaveToggle = async (propId) => {
    try {
      if (shortlistIds.includes(propId)) {
        await api.removeSavedProperty(propId, sessionId);
        setShortlistIds((prev) => prev.filter((id) => id !== propId));
        addToast({ type: 'info', message: 'Property removed from saved shortlist.' });
      } else {
        await api.saveProperty(propId, sessionId);
        setShortlistIds((prev) => [...prev, propId]);
        addToast({ type: 'success', message: 'Property saved to your shortlist!' });
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update shortlist.' });
    }
  };

  const handleAiSearchSubmit = (e) => {
    e.preventDefault();
    if (!aiSearchInput.trim()) return;
    navigate(`/buyer/ai-search?q=${encodeURIComponent(aiSearchInput.trim())}`);
  };

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page-entrance" style={{ padding: '40px 0 80px 0' }}>
      <div className="container-main">
        {/* Top Greeting Header (DM Serif 32px) */}
        <div style={{ marginBottom: '24px' }}>
          <h1
            className="font-display"
            style={{ fontSize: '32px', color: 'var(--ink)', marginBottom: '6px' }}
          >
            {greeting}, {user?.name || 'Explorer'}
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--slate)' }}>
            Here are properties tailored to your commute limits, family schools, and acoustic tranquility.
          </p>
        </div>

        {/* Active Subscription Status & Change Plan Widget */}
        <div
          className="smartnest-card"
          style={{
            padding: '18px 24px',
            marginBottom: '32px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'var(--teal-light)',
                color: 'var(--teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <CreditCard size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Buyer Subscription
                </span>
                <span className="badge-pill badge-teal" style={{ textTransform: 'capitalize', fontSize: '11px', padding: '1px 7px' }}>
                  {subscription?.status || 'Active'}
                </span>
              </div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)' }}>
                {subscription?.plan_name || 'Free'} · {subscription?.billing_period_text || (subscription?.amount === 0 ? '₹0 / month' : `₹${subscription?.amount?.toLocaleString()} / month`)}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '160px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                <span style={{ color: 'var(--slate)' }}>Seller Contacts</span>
                <span style={{ color: (usage?.contacts_used || 0) >= (usage?.contact_limit || 1) ? 'var(--rose)' : 'var(--teal)' }}>
                  {usage?.contacts_used || 0} / {usage?.contact_limit || 1} Used
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round(((usage?.contacts_used || 0) / (usage?.contact_limit || 1)) * 100))}%`,
                    backgroundColor: (usage?.contacts_used || 0) >= (usage?.contact_limit || 1) ? 'var(--rose)' : 'var(--teal)',
                    transition: 'width 300ms ease'
                  }}
                />
              </div>
            </div>

            <Link
              to="/buyer/plans"
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
            >
              <CreditCard size={14} /> Change Plan
            </Link>
          </div>
        </div>

        {/* Quiz Onboarding Banner or Profile Summary Card */}
        {!profile ? (
          <div
            className="smartnest-card"
            style={{
              padding: '28px 32px',
              backgroundColor: 'var(--teal-light)',
              border: '1.5px solid var(--teal)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              marginBottom: '40px'
            }}
          >
            <div>
              <span className="badge-pill badge-teal" style={{ background: '#FFFFFF', marginBottom: '8px' }}>
                Lifestyle Profile Not Completed
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>
                Set up your lifestyle profile to get personalized recommendations.
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--slate)', maxWidth: '540px' }}>
                Answer 7 brief questions regarding your workplace transit, neighborhood acoustics, and family priorities.
              </p>
            </div>
            <Link to="/buyer/quiz" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              <Sparkles size={16} /> Start Lifestyle Quiz
            </Link>
          </div>
        ) : (
          <div
            className="smartnest-card"
            style={{
              padding: '24px 28px',
              marginBottom: '40px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Active Lifestyle Profile
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <span className="badge-pill badge-teal" style={{ fontSize: '14px', padding: '6px 14px' }}>
                    {profile.lifestyle_type}
                  </span>
                  <Link to="/buyer/profile" style={{ fontSize: '13px', color: 'var(--teal)', fontWeight: 600, textDecoration: 'none' }}>
                    View Profile Breakdown →
                  </Link>
                </div>
              </div>

              <Link to="/buyer/quiz" className="btn btn-ghost" style={{ fontSize: '13px', padding: '6px 12px', color: 'var(--slate)' }}>
                <Sliders size={14} /> Edit Preferences
              </Link>
            </div>

            {/* AI Summary Sentence */}
            <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.5 }}>
              {profile.ai_summary}
            </p>

            {/* Compact Priority Weights Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              {Object.entries(profile.priority_weights || {}).slice(0, 4).map(([key, weight]) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--slate)', textTransform: 'capitalize' }}>
                    <span>{key}</span>
                    <span style={{ fontWeight: 600, color: 'var(--teal)' }}>{weight}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--teal-light)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${weight * 2.5}%`, height: '100%', backgroundColor: 'var(--teal)', borderRadius: '999px' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Dealbreakers as Rose Pill Badges */}
            {profile.dealbreakers && profile.dealbreakers.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Non-negotiables:</span>
                {profile.dealbreakers.map((dealbreaker, idx) => (
                  <span key={idx} className="badge-pill badge-rose" style={{ fontSize: '11px' }}>
                    {dealbreaker}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RECOMMENDED FOR YOU SECTION ───────────────────── */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)' }}>
                Recommended for You
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--slate)', marginTop: '2px' }}>
                Ranked by multi-dimensional lifestyle compatibility
              </p>
            </div>

            <Link
              to="/buyer/recommendations"
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              View All Matches <ArrowRight size={15} />
            </Link>
          </div>

          {/* 3-Column Property Grid */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : recommendations.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {recommendations.map((property) => (
                <PropertyCard
                  key={property.property_id}
                  property={property}
                  showCompare={true}
                  showSave={true}
                  isComparing={isInCompare(property.property_id)}
                  isSaved={shortlistIds.includes(property.property_id)}
                  onCompare={() => toggleCompare(property)}
                  onSave={handleSaveToggle}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Compass}
              heading="No recommendations generated yet"
              subtext="Take the lifestyle quiz to calibrate the AI engine for your personal commute and family habits."
              actionText="Start Lifestyle Quiz"
              onAction={() => navigate('/buyer/quiz')}
            />
          )}
        </div>

        {/* ── RECENT SEARCHES ROW ────────────────────────────── */}
        {recentSearches.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate)', display: 'block', marginBottom: '10px' }}>
              Recent Searches
            </span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {recentSearches.map((s) => (
                <button
                  key={s.history_id}
                  onClick={() => navigate('/buyer/recommendations')}
                  className="badge-pill badge-slate"
                  style={{
                    padding: '8px 14px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    background: 'var(--white)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Clock size={13} color="var(--slate)" />
                  {s.summary}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── BOTTOM AI SEARCH BAR SHORTCUT ──────────────────── */}
        <div
          className="smartnest-card"
          style={{
            padding: '28px',
            backgroundColor: 'var(--white)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--teal)" />
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>
              Natural Language AI Search
            </span>
          </div>

          <form onSubmit={handleAiSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="smartnest-input"
              style={{ flex: 1, minWidth: '260px' }}
              placeholder="Type your requirements"
              value={aiSearchInput}
              onChange={(e) => setAiSearchInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              Search with AI
            </button>
          </form>
        </div>
      </div>

      {/* Sticky Bottom Compare Bar if properties selected */}
      {selectedPropertyIds.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--ink)',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: 'var(--radius-pill)',
            boxShadow: '0 10px 30px rgba(13, 27, 42, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            zIndex: 9000,
            animation: 'fadeUpPage 250ms ease-out'
          }}
        >
          <span style={{ fontSize: '14px', fontWeight: 500 }}>
            {selectedPropertyIds.length} of 3 properties selected
          </span>
          <button
            onClick={() => navigate(`/buyer/compare?ids=${selectedPropertyIds.join(',')}`)}
            className="btn btn-primary"
            style={{ padding: '6px 16px', fontSize: '13px' }}
          >
            Compare Now
          </button>
          <button
            onClick={clearCompare}
            style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '12px', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
