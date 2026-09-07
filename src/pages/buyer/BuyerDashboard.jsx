import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PropertyCard } from '../../components/shared/PropertyCard';
import { SkeletonCard } from '../../components/shared/SkeletonCard';
import { EmptyState } from '../../components/shared/EmptyState';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sliders
} from 'lucide-react';

export const BuyerDashboard = () => {
  const { user, sessionId } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [shortlistIds, setShortlistIds] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [aiSearchInput, setAiSearchInput] = useState('');

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

  const handleCompareToggle = (propId) => {
    if (compareIds.includes(propId)) {
      setCompareIds((prev) => prev.filter((id) => id !== propId));
      addToast({ type: 'info', message: 'Removed from comparison.' });
    } else {
      if (compareIds.length >= 3) {
        addToast({ type: 'warning', message: 'You can compare up to 3 properties.' });
        return;
      }
      setCompareIds((prev) => [...prev, propId]);
      addToast({ type: 'success', message: 'Added to comparison bar.' });
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
        <div style={{ marginBottom: '32px' }}>
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
                  isComparing={compareIds.includes(property.property_id)}
                  isSaved={shortlistIds.includes(property.property_id)}
                  onCompare={handleCompareToggle}
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
              placeholder="Describe your ideal home... (e.g. A quiet 2BHK near Tidel Park under ₹60L)"
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
      {compareIds.length > 0 && (
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
            {compareIds.length} of 3 properties selected
          </span>
          <button
            onClick={() => navigate(`/buyer/compare?ids=${compareIds.join(',')}`)}
            className="btn btn-primary"
            style={{ padding: '6px 16px', fontSize: '13px' }}
          >
            Compare Now
          </button>
          <button
            onClick={() => setCompareIds([])}
            style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '12px', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
