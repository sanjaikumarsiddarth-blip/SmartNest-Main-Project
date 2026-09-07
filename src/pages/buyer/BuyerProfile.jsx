import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ScoreBreakdownBar } from '../../components/shared/ScoreBreakdownBar';
import {
  Sparkles,
  Sliders,
  ArrowRight,
  ShieldAlert,
  Clock,
  Coins,
  GraduationCap,
  Volume2,
  Trees,
  Coffee
} from 'lucide-react';

const PRIORITY_ICONS = {
  commute: Clock,
  budget: Coins,
  schools: GraduationCap,
  noise: Volume2,
  parks: Trees,
  amenities: Coffee
};

export const BuyerProfile = () => {
  const { sessionId } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.getRecommendations();
        setProfile(res.profile);
      } catch (e) {
        console.error('Failed to load lifestyle profile', e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="container-main" style={{ padding: '60px 0', maxWidth: '680px' }}>
        <div className="skeleton-shimmer" style={{ width: '60%', height: '40px', marginBottom: '20px' }} />
        <div className="skeleton-shimmer" style={{ width: '100%', height: '240px', borderRadius: '16px' }} />
      </div>
    );
  }

  const p = profile || {
    lifestyle_type: "Family-Oriented Professional",
    ai_summary: "Your preferences highlight a balanced urban sanctuary prioritizing short commutes and child-friendly educational infrastructure. You favor low acoustic pollution and pedestrian access to neighborhood green spaces.",
    priority_weights: { commute: 25, budget: 20, schools: 20, noise: 15, parks: 10, amenities: 10 },
    dealbreakers: ["Commute above 30 minutes", "High noise", "Budget above ₹60L"]
  };

  return (
    <div className="page-entrance" style={{ padding: '50px 0 90px 0' }}>
      <div className="container-main" style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            AI Synthesis Complete
          </span>
          <h1 className="font-display" style={{ fontSize: '36px', color: 'var(--ink)', marginTop: '8px', marginBottom: '16px' }}>
            Your Lifestyle Profile
          </h1>

          {/* Lifestyle Type as Large Teal Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--teal-light)', border: '1px solid var(--teal)' }}>
            <Sparkles size={18} color="var(--teal)" />
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--teal)' }}>
              {p.lifestyle_type}
            </span>
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="smartnest-card" style={{ padding: '36px 32px', marginBottom: '32px' }}>
          {/* AI Summary Paragraph */}
          <div style={{ marginBottom: '32px', padding: '20px', backgroundColor: 'var(--mist)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--teal)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
              Lifestyle Synthesis Summary
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--slate)', lineHeight: 1.6 }}>
              {p.ai_summary}
            </p>
          </div>

          {/* Priority Weights Section */}
          <div style={{ marginBottom: '36px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
              What matters most to you
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '20px' }}>
              Relative importance weights calculated from your ranking and tolerance preferences.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(p.priority_weights || {}).map(([key, weight]) => {
                const IconComponent = PRIORITY_ICONS[key] || Sparkles;
                return (
                  <ScoreBreakdownBar
                    key={key}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    score={weight}
                    max={100}
                    icon={IconComponent}
                  />
                );
              })}
            </div>
          </div>

          {/* Dealbreakers Section */}
          {p.dealbreakers && p.dealbreakers.length > 0 && (
            <div style={{ marginBottom: '36px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldAlert size={18} color="var(--rose)" />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
                  Your non-negotiables
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '16px' }}>
                Dealbreakers flag properties that exceed your limits on commute, decibels, or budget.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {p.dealbreakers.map((dealbreaker, idx) => (
                  <span
                    key={idx}
                    className="badge-pill badge-rose"
                    style={{ fontSize: '13px', padding: '6px 14px', fontWeight: 600 }}
                  >
                    ✕ {dealbreaker}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            <Link
              to="/buyer/recommendations"
              className="btn btn-primary"
              style={{ padding: '14px', fontSize: '16px', justifyContent: 'center' }}
            >
              View My Property Matches <ArrowRight size={18} />
            </Link>

            <div style={{ textAlign: 'center' }}>
              <Link
                to="/buyer/quiz"
                style={{ fontSize: '14px', color: 'var(--slate)', textDecoration: 'none', fontWeight: 500 }}
              >
                Edit my preferences
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
