import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCompare } from '../../context/CompareContext';
import { MatchScoreBadge } from '../../components/shared/MatchScoreBadge';
import { formatPriceINR } from '../../components/shared/PropertyCard';
import { EmptyState } from '../../components/shared/EmptyState';
import {
  Scale,
  X,
  Heart,
  Sparkles,
  Check,
  Building,
  Plus,
  CheckCircle2,
  AlertCircle,
  Award
} from 'lucide-react';

export const ComparisonPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { sessionId } = useAuth();
  const { addToast } = useToast();
  const { selectedPropertyIds, removeFromCompare, setCompareIds } = useCompare();

  const [properties, setProperties] = useState([]);
  const [summary, setSummary] = useState('');
  const [aiComparison, setAiComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);

  // URL query parameter synchronization
  const idsParam = searchParams.get('ids');
  const hasInitializedFromUrl = React.useRef(false);

  // If page was directly opened with ?ids=... (e.g. shared link or bookmark) and context is empty, initialize from URL once
  useEffect(() => {
    if (!hasInitializedFromUrl.current) {
      hasInitializedFromUrl.current = true;
      if (idsParam) {
        const urlIds = idsParam.split(',').filter(Boolean).slice(0, 3);
        if (urlIds.length > 0) {
          setCompareIds(urlIds);
        }
      }
    }
  }, [idsParam, setCompareIds]);

  // Keep URL query string in sync with shared selectedPropertyIds
  useEffect(() => {
    if (selectedPropertyIds.length > 0) {
      setSearchParams({ ids: selectedPropertyIds.join(',') }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [selectedPropertyIds, setSearchParams]);

  // Fetch comparison properties based on the shared selectedPropertyIds
  useEffect(() => {
    if (selectedPropertyIds.length === 0) {
      setProperties([]);
      setSummary('');
      setAiComparison(null);
      setLoading(false);
      return;
    }

    const fetchComparison = async () => {
      setLoading(true);
      try {
        const res = await api.compareProperties(selectedPropertyIds);
        setProperties(res.properties || []);
        setSummary(res.ai_comparison_summary || '');
        setAiComparison(res.ai_comparison || null);

        const saved = await api.getSavedProperties(sessionId);
        setSavedIds((saved.properties || []).map((p) => p.property_id));
      } catch (err) {
        addToast({ type: 'error', message: 'Failed to generate comparison table.' });
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [selectedPropertyIds, sessionId, addToast]);

  const handleRemove = (propId) => {
    removeFromCompare(propId);
  };

  const handleSaveToggle = async (propId) => {
    try {
      if (savedIds.includes(propId)) {
        await api.removeSavedProperty(propId, sessionId);
        setSavedIds((prev) => prev.filter((id) => id !== propId));
        addToast({ type: 'info', message: 'Removed from shortlist.' });
      } else {
        await api.saveProperty(propId, sessionId);
        setSavedIds((prev) => [...prev, propId]);
        addToast({ type: 'success', message: 'Saved to shortlist!' });
      }
    } catch (e) {
      addToast({ type: 'error', message: 'Error saving property.' });
    }
  };

  if (loading) {
    return (
      <div className="container-main" style={{ padding: '60px 0' }}>
        <div className="skeleton-shimmer" style={{ width: '100%', height: '400px', borderRadius: '16px' }} />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="container-main" style={{ padding: '80px 0' }}>
        <EmptyState
          icon={Scale}
          heading="Compare properties"
          subtext="Select up to 3 properties from your matches to compare them side by side."
          actionText="Explore Matches"
          onAction={() => navigate('/buyer/recommendations')}
        />
      </div>
    );
  }

  // Row Highlights Calculations
  const minPrice = Math.min(...properties.map((p) => p.price));
  const minCommute = Math.min(...properties.map((p) => p.commute_minutes));
  const minSchool = Math.min(...properties.map((p) => p.school_distance_km));
  const minHospital = Math.min(...properties.map((p) => p.hospital_distance_km));
  const minPark = Math.min(...properties.map((p) => p.park_distance_km));

  const maxGreen = Math.max(...properties.map((p) => p.green_score));
  const maxAmenity = Math.max(...properties.map((p) => p.amenity_score));
  const maxMatch = Math.max(...properties.map((p) => p.match_score));

  return (
    <div className="page-entrance" style={{ padding: '40px 0 100px 0' }}>
      <div className="container-main">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <span className="badge-pill badge-teal" style={{ marginBottom: '8px' }}>
            Multi-Property Matrix
          </span>
          <h1 className="font-display" style={{ fontSize: '32px', color: 'var(--ink)', marginTop: '4px' }}>
            Side-by-Side Comparison
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--slate)' }}>
            Teal highlighted cells represent optimal values for each respective lifestyle factor.
          </p>
        </div>

        {/* ── COMPARISON TABLE ─────────────────────────────────── */}
        <div
          className="smartnest-card"
          style={{
            overflowX: 'auto',
            padding: '24px',
            marginBottom: '32px'
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: '680px',
              borderCollapse: 'separate',
              borderSpacing: '0'
            }}
          >
            <thead>
              <tr>
                {/* Sticky Left Column: Factor Label Header */}
                <th
                  style={{
                    position: 'sticky',
                    left: 0,
                    backgroundColor: 'var(--white)',
                    zIndex: 10,
                    width: '180px',
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--slate)',
                    borderBottom: '2px solid var(--border)'
                  }}
                >
                  Factor
                </th>

                {/* Property Columns */}
                {properties.map((p) => (
                  <th
                    key={p.property_id}
                    style={{
                      padding: '16px',
                      textAlign: 'center',
                      verticalAlign: 'top',
                      width: `${100 / (properties.length + 1)}%`,
                      borderBottom: '2px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(p.property_id)}
                        style={{
                          alignSelf: 'flex-end',
                          background: 'none',
                          border: 'none',
                          color: 'var(--slate)',
                          cursor: 'pointer'
                        }}
                        title="Remove from compare"
                        aria-label="Remove property from comparison"
                      >
                        <X size={16} />
                      </button>

                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                        alt={p.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
                        }}
                        style={{ width: '100%', height: '120px', borderRadius: '12px', objectFit: 'cover' }}
                      />

                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                        {p.title}
                      </h4>

                      {/* Save to Shortlist Button */}
                      <button
                        type="button"
                        onClick={() => handleSaveToggle(p.property_id)}
                        className="btn btn-ghost"
                        style={{ fontSize: '12px', padding: '4px 10px', border: '1px solid var(--border)' }}
                      >
                        <Heart size={13} fill={savedIds.includes(p.property_id) ? 'var(--rose)' : 'none'} color={savedIds.includes(p.property_id) ? 'var(--rose)' : 'var(--slate)'} />
                        {savedIds.includes(p.property_id) ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* 1. Price */}
              <tr>
                <td style={{ position: 'sticky', left: 0, backgroundColor: 'var(--white)', zIndex: 5, padding: '14px 16px', fontWeight: 600, fontSize: '13px', color: 'var(--slate)', borderBottom: '1px solid var(--border)' }}>
                  Price
                </td>
                {properties.map((p) => {
                  const isBest = p.price === minPrice;
                  return (
                    <td key={p.property_id} style={{ padding: '14px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)', backgroundColor: isBest ? 'var(--teal-light)' : 'transparent', fontWeight: isBest ? 700 : 500, color: isBest ? 'var(--teal)' : 'var(--ink)' }}>
                      {formatPriceINR(p.price)}
                    </td>
                  );
                })}
              </tr>

              {/* 2. BHK */}
              <tr>
                <td style={{ position: 'sticky', left: 0, backgroundColor: 'var(--white)', zIndex: 5, padding: '14px 16px', fontWeight: 600, fontSize: '13px', color: 'var(--slate)', borderBottom: '1px solid var(--border)' }}>
                  BHK
                </td>
                {properties.map((p) => {
                  const isPref = p.bhk === 2; // Preferred
                  return (
                    <td key={p.property_id} style={{ padding: '14px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)', backgroundColor: isPref ? 'var(--teal-light)' : 'transparent', fontWeight: isPref ? 700 : 500, color: isPref ? 'var(--teal)' : 'var(--ink)' }}>
                      {p.bhk} BHK
                    </td>
                  );
                })}
              </tr>

              {/* 3. Area */}
              <tr>
                <td style={{ position: 'sticky', left: 0, backgroundColor: 'var(--white)', zIndex: 5, padding: '14px 16px', fontWeight: 600, fontSize: '13px', color: 'var(--slate)', borderBottom: '1px solid var(--border)' }}>
                  Area
                </td>
                {properties.map((p) => (
                  <td key={p.property_id} style={{ padding: '14px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                    {p.area_sqft} sq.ft
                  </td>
                ))}
              </tr>

              {/* 4. Location */}
              <tr>
                <td style={{ position: 'sticky', left: 0, backgroundColor: 'var(--white)', zIndex: 5, padding: '14px 16px', fontWeight: 600, fontSize: '13px', color: 'var(--slate)', borderBottom: '1px solid var(--border)' }}>
                  Location
                </td>
                {properties.map((p) => (
                  <td key={p.property_id} style={{ padding: '14px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
                    {p.location}
                  </td>
                ))}
              </tr>

              {/* 5. Commute */}
              <tr>
                <td style={{ position: 'sticky', left: 0, backgroundColor: 'var(--white)', zIndex: 5, padding: '14px 16px', fontWeight: 600, fontSize: '13px', color: 'var(--slate)', borderBottom: '1px solid var(--border)' }}>
                  Commute
                </td>
                {properties.map((p) => {
                  const isBest = p.commute_minutes === minCommute;
                  return (
                    <td key={p.property_id} style={{ padding: '14px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)', backgroundColor: isBest ? 'var(--teal-light)' : 'transparent', fontWeight: isBest ? 700 : 500, color: isBest ? 'var(--teal)' : 'var(--ink)' }}>
                      {p.commute_minutes} min ({p.commute_mode})
                    </td>
                  );
                })}
              </tr>

              {/* 6. School Distance */}
              <tr>
                <td style={{ position: 'sticky', left: 0, backgroundColor: 'var(--white)', zIndex: 5, padding: '14px 16px', fontWeight: 600, fontSize: '13px', color: 'var(--slate)', borderBottom: '1px solid var(--border)' }}>
                  School Distance
                </td>
                {properties.map((p) => {
                  const isBest = p.school_distance_km === minSchool;
                  return (
                    <td key={p.property_id} style={{ padding: '14px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)', backgroundColor: isBest ? 'var(--teal-light)' : 'transparent', fontWeight: isBest ? 700 : 500, color: isBest ? 'var(--teal)' : 'var(--ink)' }}>
                      {p.school_distance_km} km
                    </td>
                  );
                })}
              </tr>

              {/* 7. Hospital Distance */}
              <tr>
                <td style={{ position: 'sticky', left: 0, backgroundColor: 'var(--white)', zIndex: 5, padding: '14px 16px', fontWeight: 600, fontSize: '13px', color: 'var(--slate)', borderBottom: '1px solid var(--border)' }}>
                  Hospital Distance
                </td>
                {properties.map((p) => {
                  const isBest = p.hospital_distance_km === minHospital;
                  return (
                    <td key={p.property_id} style={{ padding: '14px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)', backgroundColor: isBest ? 'var(--teal-light)' : 'transparent', fontWeight: isBest ? 700 : 500, color: isBest ? 'var(--teal)' : 'var(--ink)' }}>
                      {p.hospital_distance_km} km
                    </td>
                  );
                })}
              </tr>

              {/* 8. Park Distance */}
              <tr>
                <td style={{ position: 'sticky', left: 0, backgroundColor: 'var(--white)', zIndex: 5, padding: '14px 16px', fontWeight: 600, fontSize: '13px', color: 'var(--slate)', borderBottom: '1px solid var(--border)' }}>
                  Park Distance
                </td>
                {properties.map((p) => {
                  const isBest = p.park_distance_km === minPark;
                  return (
                    <td key={p.property_id} style={{ padding: '14px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)', backgroundColor: isBest ? 'var(--teal-light)' : 'transparent', fontWeight: isBest ? 700 : 500, color: isBest ? 'var(--teal)' : 'var(--ink)' }}>
                      {p.park_distance_km} km
                    </td>
                  );
                })}
              </tr>

              {/* 9. Noise Level */}
              <tr>
                <td style={{ position: 'sticky', left: 0, backgroundColor: 'var(--white)', zIndex: 5, padding: '14px 16px', fontWeight: 600, fontSize: '13px', color: 'var(--slate)', borderBottom: '1px solid var(--border)' }}>
                  Noise Level
                </td>
                {properties.map((p) => {
                  const isBest = p.noise_level === 'low';
                  return (
                    <td key={p.property_id} style={{ padding: '14px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)', backgroundColor: isBest ? 'var(--teal-light)' : 'transparent', fontWeight: isBest ? 700 : 500, color: isBest ? 'var(--teal)' : 'var(--ink)', textTransform: 'capitalize' }}>
                      {p.noise_level}
                    </td>
                  );
                })}
              </tr>

              {/* 10. Green Score */}
              <tr>
                <td style={{ position: 'sticky', left: 0, backgroundColor: 'var(--white)', zIndex: 5, padding: '14px 16px', fontWeight: 600, fontSize: '13px', color: 'var(--slate)', borderBottom: '1px solid var(--border)' }}>
                  Green Score
                </td>
                {properties.map((p) => {
                  const isBest = p.green_score === maxGreen;
                  return (
                    <td key={p.property_id} style={{ padding: '14px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)', backgroundColor: isBest ? 'var(--teal-light)' : 'transparent', fontWeight: isBest ? 700 : 500, color: isBest ? 'var(--teal)' : 'var(--ink)' }}>
                      {p.green_score}/100
                    </td>
                  );
                })}
              </tr>

              {/* 11. Amenity Score */}
              <tr>
                <td style={{ position: 'sticky', left: 0, backgroundColor: 'var(--white)', zIndex: 5, padding: '14px 16px', fontWeight: 600, fontSize: '13px', color: 'var(--slate)', borderBottom: '1px solid var(--border)' }}>
                  Amenity Score
                </td>
                {properties.map((p) => {
                  const isBest = p.amenity_score === maxAmenity;
                  return (
                    <td key={p.property_id} style={{ padding: '14px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)', backgroundColor: isBest ? 'var(--teal-light)' : 'transparent', fontWeight: isBest ? 700 : 500, color: isBest ? 'var(--teal)' : 'var(--ink)' }}>
                      {p.amenity_score}/100
                    </td>
                  );
                })}
              </tr>

              {/* 12. Lifestyle Match Score */}
              <tr>
                <td style={{ position: 'sticky', left: 0, backgroundColor: 'var(--white)', zIndex: 5, padding: '14px 16px', fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                  Overall Match Score
                </td>
                {properties.map((p) => {
                  const isBest = p.match_score === maxMatch;
                  const isWinner = aiComparison?.winner_property_id === p.property_id;
                  return (
                    <td key={p.property_id} style={{ padding: '14px 16px', textAlign: 'center', backgroundColor: isBest ? 'var(--teal-light)' : 'transparent' }}>
                      <MatchScoreBadge
                        score={p.match_score}
                        size={54}
                        showLabel={true}
                      />
                      {isWinner && (
                        <div style={{ marginTop: '6px' }}>
                          <span className="badge-pill badge-teal" style={{ fontSize: '10px', padding: '2px 8px', fontWeight: 700 }}>
                            ★ Recommended
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── AI COMPARISON INTELLIGENCE CARD (When 2 or 3 properties selected) ── */}
        {properties.length >= 2 ? (
          <div
            className="smartnest-card"
            style={{
              padding: '28px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--teal)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={22} color="var(--teal)" />
                <div>
                  <span className="badge-pill badge-teal" style={{ marginBottom: '4px', display: 'inline-block' }}>
                    AI Comparison Intelligence
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                    {aiComparison?.winner_property_title
                      ? `Recommended Choice: ${aiComparison.winner_property_title}`
                      : 'Multi-Property Decision Synthesis'}
                  </h3>
                </div>
              </div>

              {aiComparison?.compatibility_difference && (
                <span className="badge-pill badge-teal" style={{ fontSize: '12px', padding: '4px 12px', fontWeight: 700 }}>
                  {aiComparison.compatibility_difference}
                </span>
              )}
            </div>

            {/* Rationale & Trade-offs 2-column layout */}
            {aiComparison && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Why Recommended */}
                <div style={{ padding: '16px', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    <CheckCircle2 size={15} color="#16A34A" /> Why This Property Leads
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {aiComparison.reasons?.map((reason, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#14532D' }}>
                        <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trade-offs */}
                <div style={{ padding: '16px', backgroundColor: '#FFFBEB', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#92400E', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    <AlertCircle size={15} color="#D97706" /> Key Trade-offs
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {aiComparison.tradeoffs?.map((tradeoff, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#78350F' }}>
                        <span style={{ color: '#D97706', fontWeight: 700 }}>⚠</span>
                        <span>{tradeoff}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Narrative Synthesis */}
            <div style={{ padding: '16px', backgroundColor: 'var(--teal-light)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(42, 157, 143, 0.2)' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Concise Recommendation Summary
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--ink)', lineHeight: 1.6, margin: 0 }}>
                {summary}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="smartnest-card"
            style={{
              padding: '24px',
              backgroundColor: '#FFFFFF',
              border: '1px dashed var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Scale size={20} color="var(--teal)" />
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                  Add at least one more property to compare
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--slate)', margin: '4px 0 0 0' }}>
                  Select 2 or 3 properties to unlock automated AI trade-off evaluations and winner recommendations.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/buyer/recommendations')}
              className="btn btn-secondary"
              style={{ fontSize: '13px' }}
            >
              Add Properties
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
