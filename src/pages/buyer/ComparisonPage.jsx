import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
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
  Plus
} from 'lucide-react';

export const ComparisonPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { sessionId } = useAuth();
  const { addToast } = useToast();

  const [properties, setProperties] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);

  // Read IDs from query param or fallback to default P01 & P02
  const idsParam = searchParams.get('ids');
  const selectedIds = idsParam ? idsParam.split(',').filter(Boolean) : ['P01', 'P02', 'P04'];

  useEffect(() => {
    const fetchComparison = async () => {
      setLoading(true);
      try {
        const res = await api.compareProperties(selectedIds);
        setProperties(res.properties);
        setSummary(res.ai_comparison_summary);

        const saved = await api.getSavedProperties(sessionId);
        setSavedIds(saved.properties.map((p) => p.property_id));
      } catch (err) {
        addToast({ type: 'error', message: 'Failed to generate comparison table.' });
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [idsParam, sessionId, addToast]);

  const handleRemove = (propId) => {
    const remaining = selectedIds.filter((id) => id !== propId);
    setSearchParams({ ids: remaining.join(',') });
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
          heading="No properties to compare"
          subtext="Select 2 or 3 properties from your recommended matches to evaluate their lifestyle factors side-by-side."
          actionText="Browse Matches"
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
                        src={p.images?.[0]}
                        alt={p.title}
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
                  return (
                    <td key={p.property_id} style={{ padding: '14px 16px', textAlign: 'center', backgroundColor: isBest ? 'var(--teal-light)' : 'transparent' }}>
                      <MatchScoreBadge score={p.match_score} size={54} showLabel={true} />
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── AI COMPARISON SUMMARY CARD ──────────────────────── */}
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
              AI Comparison Synthesis
            </h3>
          </div>
          <p style={{ fontSize: '15px', color: 'var(--ink)', lineHeight: 1.6 }}>
            {summary}
          </p>
        </div>
      </div>
    </div>
  );
};
