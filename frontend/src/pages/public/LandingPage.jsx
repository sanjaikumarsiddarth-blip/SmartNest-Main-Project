import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Scale,
  Clock,
  Compass,
  FileText,
  Trees,
  ArrowRight,
  Shield,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { MatchScoreBadge } from '../../components/shared/MatchScoreBadge';

export const LandingPage = () => {
  return (
    <div className="page-entrance">
      {/* ── HERO SECTION ───────────────────────────────────── */}
      <section
        style={{
          padding: '80px 0 60px 0',
          backgroundColor: 'var(--mist)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="container-main">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '48px',
              alignItems: 'center'
            }}
          >
            {/* Left Content */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  backgroundColor: 'var(--teal-light)',
                  color: 'var(--teal)',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '20px'
                }}
              >
                <Sparkles size={16} /> Next-Generation PropTech AI
              </div>

              {/* Headline in DM Serif Display 64px */}
              <h1
                className="font-display"
                style={{
                  fontSize: 'clamp(40px, 5vw, 64px)',
                  lineHeight: 1.15,
                  color: 'var(--ink)',
                  marginBottom: '20px'
                }}
              >
                Find a home that fits your life.
              </h1>

              {/* Body text: 20px Inter, 2 lines max */}
              <p
                style={{
                  fontSize: '20px',
                  color: 'var(--slate)',
                  lineHeight: 1.5,
                  maxWidth: '540px',
                  marginBottom: '32px'
                }}
              >
                Match homes based on your daily commute, family education priorities, acoustic serenity, and wellness goals.
              </p>

              {/* Primary & Secondary CTAs */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
                <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
                  Find My Perfect Home
                </Link>
                <Link to="/buyer/recommendations" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '15px' }}>
                  Explore Properties
                </Link>
              </div>

              {/* Three Stat Pills */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--white)',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <CheckCircle2 size={15} color="var(--teal)" /> 10K+ Properties
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--white)',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <Sparkles size={15} color="var(--teal)" /> AI Lifestyle Matching
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--white)',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <HeartHandshake size={15} color="var(--teal)" /> Personalized for You
                </div>
              </div>
            </div>

            {/* Right Side: Large Property Image with Floating Card Overlay */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '100%',
                  height: '460px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(13, 27, 42, 0.15)',
                  position: 'relative'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
                  alt="Modern architectural home"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Floating Card Overlay on the image (decorative only with glassmorphism) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '20px',
                  right: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  boxShadow: '0 12px 32px rgba(13, 27, 42, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--teal-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <MatchScoreBadge score={94} size={42} showLabel={false} />
                  </div>

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                      94% Lifestyle Match · ₹55L · 2 BHK
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--slate)' }}>
                      Peelamedu, Coimbatore · 18 min commute · Low noise
                    </div>
                  </div>
                </div>

                <span className="badge-pill badge-teal" style={{ fontWeight: 600 }}>
                  Top Recommendation
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '80px 0', backgroundColor: 'var(--white)' }}>
        <div className="container-main">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 56px auto' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Simple & Transparent
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', marginTop: '8px', marginBottom: '12px' }}>
              How SmartNest AI Works
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--slate)' }}>
              From personal lifestyle habits to your dream keys in four intelligent steps.
            </p>
          </div>

          {/* 4 Steps connected by dashed line */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '32px',
              position: 'relative'
            }}
          >
            {/* Step 1 */}
            <div
              className="smartnest-card"
              style={{
                padding: '32px 24px',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--teal)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 700,
                  marginBottom: '16px'
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                Tell us your lifestyle
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.5 }}>
                Share your daily commute routes, family needs, quietness preference, and key amenities.
              </p>
            </div>

            {/* Step 2 */}
            <div
              className="smartnest-card"
              style={{
                padding: '32px 24px',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--teal)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 700,
                  marginBottom: '16px'
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                AI understands your priorities
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.5 }}>
                Our neural models synthesize your preferences into non-negotiable dealbreakers and weighted indices.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className="smartnest-card"
              style={{
                padding: '32px 24px',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--teal)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 700,
                  marginBottom: '16px'
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                SmartNest matches properties
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.5 }}>
                Live properties are scored against your commute times, green canopy, and acoustic profile.
              </p>
            </div>

            {/* Step 4 */}
            <div
              className="smartnest-card"
              style={{
                padding: '32px 24px',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--teal)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 700,
                  marginBottom: '16px'
                }}
              >
                4
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                Compare and choose
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.5 }}>
                Evaluate contenders side-by-side with transparent score breakdowns and connect with verified sellers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE GRID (6 CARDS, 3x2 DESKTOP) ─────────────── */}
      <section id="features" style={{ padding: '80px 0', backgroundColor: 'var(--mist)' }}>
        <div className="container-main">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 56px auto' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Advanced PropTech Capabilities
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)', marginTop: '8px', marginBottom: '12px' }}>
              Engineered for Modern Home Seekers
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--slate)' }}>
              Built specifically to eliminate real-estate guesswork through transparent intelligence.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}
          >
            {/* Feature 1 */}
            <div className="smartnest-card smartnest-card-hover" style={{ padding: '32px 28px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--teal-light)',
                  color: 'var(--teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                AI Lifestyle Matching
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.6 }}>
                Replaces rigid square footage queries with multi-dimensional lifestyle compatibility indexing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="smartnest-card smartnest-card-hover" style={{ padding: '32px 28px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--teal-light)',
                  color: 'var(--teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                <Scale size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                Smart Comparison
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.6 }}>
                Side-by-side factor matrix with dynamic highlights identifying optimal commute and budget tradeoffs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="smartnest-card smartnest-card-hover" style={{ padding: '32px 28px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--teal-light)',
                  color: 'var(--teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                Commute Intelligence
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.6 }}>
                Real-world peak transit time calculations for metro, road corridors, and pedestrian walkability.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="smartnest-card smartnest-card-hover" style={{ padding: '32px 28px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--teal-light)',
                  color: 'var(--teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                <Compass size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                Neighborhood Insights
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.6 }}>
                Comprehensive verified radius scans of prominent schools, specialty healthcare, and transit hubs.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="smartnest-card smartnest-card-hover" style={{ padding: '32px 28px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--teal-light)',
                  color: 'var(--teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                <FileText size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                Explainable Scores
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.6 }}>
                No black boxes. Every match percentage is broken down into budget, schools, noise, and amenities.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="smartnest-card smartnest-card-hover" style={{ padding: '32px 28px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--teal-light)',
                  color: 'var(--teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                <Trees size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                Wellness & Green Scores
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--slate)', lineHeight: 1.6 }}>
                Audited indices measuring tree canopy density, ambient decibels, air cleanliness, and park access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────── */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--ink)', color: '#FFFFFF', textAlign: 'center' }}>
        <div className="container-main" style={{ maxWidth: '680px' }}>
          <h2 className="font-display" style={{ fontSize: '42px', color: '#FFFFFF', marginBottom: '16px' }}>
            Ready to find the home that truly fits?
          </h2>
          <p style={{ fontSize: '17px', color: '#94A3B8', marginBottom: '32px', lineHeight: 1.6 }}>
            Join thousands of homeowners and verified developers experiencing intelligent PropTech matching.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '15px' }}>
              Start With Lifestyle Quiz
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '15px', color: '#FFFFFF', borderColor: '#FFFFFF' }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
