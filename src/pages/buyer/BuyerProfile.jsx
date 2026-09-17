import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
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
  Coffee,
  CheckCircle2,
  Edit2,
  Save,
  RotateCcw,
  Send
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
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [webhookResult, setWebhookResult] = useState(() => {
    return api.getLifestyleWebhookResult ? api.getLifestyleWebhookResult() : null;
  });
  const TARGET_WEBHOOK_URL = 'http://localhost:5173/api/sns-webhook/webhook/ed98ebe4-d99d-4370-8a64-7f61b70ff52f';
  const [currentWebhookUrl, setCurrentWebhookUrl] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('smartnest_lifestyle_webhook_url', TARGET_WEBHOOK_URL);
    }
    if (api.setLifestyleWebhookUrl) {
      api.setLifestyleWebhookUrl(TARGET_WEBHOOK_URL);
    }
    return TARGET_WEBHOOK_URL;
  });
  const [isEditingWebhook, setIsEditingWebhook] = useState(false);
  const [inputWebhookUrl, setInputWebhookUrl] = useState(TARGET_WEBHOOK_URL);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.getRecommendations();
        setProfile(res.profile);
        if (res.profile?.webhook_trigger) {
          setWebhookResult(res.profile.webhook_trigger);
        } else if (api.getLifestyleWebhookResult) {
          const stored = api.getLifestyleWebhookResult();
          if (stored) setWebhookResult(stored);
        }
      } catch (e) {
        console.error('Failed to load lifestyle profile', e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [sessionId]);

  const handleSaveWebhookUrl = () => {
    if (!inputWebhookUrl || !inputWebhookUrl.trim()) {
      addToast({ type: 'error', message: 'Please enter a valid webhook URL.' });
      return;
    }
    const cleanUrl = inputWebhookUrl.trim();
    if (api.setLifestyleWebhookUrl) {
      api.setLifestyleWebhookUrl(cleanUrl);
    }
    setCurrentWebhookUrl(cleanUrl);
    setIsEditingWebhook(false);
    addToast({ type: 'success', message: 'Current webhook link replaced successfully!' });
  };

  const handleResetWebhookUrl = () => {
    const defaultUrl = 'http://localhost:5173/api/sns-webhook/webhook/ed98ebe4-d99d-4370-8a64-7f61b70ff52f';
    if (api.setLifestyleWebhookUrl) {
      api.setLifestyleWebhookUrl(defaultUrl);
    }
    setInputWebhookUrl(defaultUrl);
    setCurrentWebhookUrl(defaultUrl);
    setIsEditingWebhook(false);
    addToast({ type: 'info', message: 'Webhook link reset to default.' });
  };

  const handleTestTrigger = async () => {
    setIsTestingWebhook(true);
    try {
      const result = await api.triggerLifestyleWebhook({
        user_id: 'usr_buyer_01',
        city: 'Coimbatore',
        budget: 5500000,
        bhk: 2,
        household_type: 'family',
        test_trigger: true
      }, profile);
      setWebhookResult(result);
      addToast({ type: 'success', message: 'Webhook triggered & response stored successfully!' });
    } catch (err) {
      addToast({ type: 'error', message: 'Webhook trigger test completed with fallback.' });
    } finally {
      setIsTestingWebhook(false);
    }
  };

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
          <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: 'var(--mist)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--teal)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
              Lifestyle Synthesis Summary
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--slate)', lineHeight: 1.6 }}>
              {p.ai_summary}
            </p>
          </div>

          {/* AI Agent Webhook Trigger & Management Card */}
          <div style={{
            marginBottom: '32px',
            padding: '20px',
            backgroundColor: '#F0FDF4',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #BBF7D0',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#16A34A" />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#15803D' }}>
                  AI Agent Webhook Integration
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  backgroundColor: '#DCFCE7',
                  color: '#166534',
                  fontFamily: 'monospace'
                }}>
                  HTTP {webhookResult?.status || 200} OK
                </span>
                {!isEditingWebhook && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputWebhookUrl(currentWebhookUrl);
                      setIsEditingWebhook(true);
                    }}
                    style={{
                      background: 'none',
                      border: '1px solid #86EFAC',
                      borderRadius: '6px',
                      padding: '3px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#15803D',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Edit2 size={12} /> Replace Link
                  </button>
                )}
              </div>
            </div>

            {isEditingWebhook ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px', backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '8px', border: '1px solid #86EFAC' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#15803D' }}>
                  Current Webhook Link:
                </label>
                <input
                  type="url"
                  value={inputWebhookUrl}
                  onChange={(e) => setInputWebhookUrl(e.target.value)}
                  placeholder="http://localhost:5173/api/sns-webhook/webhook/..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    border: '1px solid #86EFAC',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    color: '#064E3B'
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleSaveWebhookUrl}
                    className="btn btn-primary"
                    style={{ padding: '6px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Save size={13} /> Save & Replace Link
                  </button>
                  <button
                    type="button"
                    onClick={handleResetWebhookUrl}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: 'transparent',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      color: '#4B5563',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RotateCcw size={13} /> Reset Default
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingWebhook(false)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#6B7280',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '12px', color: '#166534', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600 }}>Active Webhook URL:</span>
                  <code style={{ fontSize: '11px', backgroundColor: '#DCFCE7', padding: '3px 8px', borderRadius: '4px', color: '#14532D', fontFamily: 'monospace' }}>
                    {currentWebhookUrl}
                  </code>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
                  <div style={{ fontSize: '11px', color: '#15803D', opacity: 0.85 }}>
                    {webhookResult?.triggered_at
                      ? `Dispatched & Persisted: ${new Date(webhookResult.triggered_at).toLocaleString()}`
                      : 'Triggered when you click "Analyze My Lifestyle" in the quiz.'}
                  </div>
                  <button
                    type="button"
                    onClick={handleTestTrigger}
                    disabled={isTestingWebhook}
                    style={{
                      background: '#15803D',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: isTestingWebhook ? 'wait' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      opacity: isTestingWebhook ? 0.7 : 1
                    }}
                  >
                    <Send size={11} /> {isTestingWebhook ? 'Testing...' : 'Test Trigger Now'}
                  </button>
                </div>
              </>
            )}
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
