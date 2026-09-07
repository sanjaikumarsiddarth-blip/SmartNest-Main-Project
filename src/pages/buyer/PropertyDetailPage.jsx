import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MatchScoreBadge } from '../../components/shared/MatchScoreBadge';
import { ScoreBreakdownBar } from '../../components/shared/ScoreBreakdownBar';
import { SkeletonCard } from '../../components/shared/SkeletonCard';
import { formatPriceINR } from '../../components/shared/PropertyCard';
import { LiveMapModal } from '../../components/shared/LiveMapModal';
import {
  Heart,
  Scale,
  MessageSquare,
  MapPin,
  Clock,
  Volume2,
  Trees,
  GraduationCap,
  Activity,
  Bus,
  Sparkles,
  X,
  Send,
  Star,
  Compass
} from 'lucide-react';

export const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessionId } = useAuth();
  const { addToast } = useToast();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schools'); // 'schools' | 'hospitals' | 'parks' | 'transport'
  const [lightboxImage, setLightboxImage] = useState(null);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapCategory, setMapCategory] = useState('property');
  const [isSaved, setIsSaved] = useState(false);
  const [sendingEnquiry, setSendingEnquiry] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const data = await api.getProperty(id);
        setProperty(data);
        const saved = await api.getSavedProperties(sessionId);
        setIsSaved(saved.properties.some((p) => p.property_id === id));
      } catch (err) {
        addToast({ type: 'error', message: 'Could not load property details.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, sessionId, addToast]);

  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        await api.removeSavedProperty(id, sessionId);
        setIsSaved(false);
        addToast({ type: 'info', message: 'Removed from saved shortlist.' });
      } else {
        await api.saveProperty(id, sessionId);
        setIsSaved(true);
        addToast({ type: 'success', message: 'Property saved to your shortlist!' });
      }
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to update shortlist.' });
    }
  };

  const handleSendEnquiry = async (e) => {
    e.preventDefault();
    if (!enquiryMessage.trim()) return;

    setSendingEnquiry(true);
    try {
      await api.sendEnquiry(id, enquiryMessage, sessionId);
      addToast({ type: 'success', message: 'Your message has been delivered to the seller.' });
      setEnquiryModalOpen(false);
      setEnquiryMessage('');
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to send enquiry.' });
    } finally {
      setSendingEnquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="container-main" style={{ padding: '60px 0' }}>
        <SkeletonCard />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container-main" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Property not found</h2>
        <button onClick={() => navigate('/buyer/recommendations')} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Matches
        </button>
      </div>
    );
  }

  return (
    <div className="page-entrance" style={{ padding: '40px 0 100px 0' }}>
      <div className="container-main">
        {/* Breadcrumb row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--slate)', marginBottom: '20px' }}>
          <span onClick={() => navigate('/buyer/recommendations')} style={{ cursor: 'pointer', color: 'var(--teal)' }}>
            Matches
          </span>
          <span>/</span>
          <span>{property.city}</span>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{property.title}</span>
        </div>

        {/* ── TWO COLUMN LAYOUT (LEFT 60%, RIGHT 40% STICKY) ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'start'
          }}
        >
          {/* LEFT COLUMN (60%) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Image Gallery: Horizontal scroll strip of 3 images with click to open lightbox */}
            <div>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                  scrollbarWidth: 'thin'
                }}
              >
                {property.images?.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxImage(imgUrl)}
                    style={{
                      minWidth: '280px',
                      height: '240px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'zoom-in',
                      flexShrink: 0,
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <img
                      src={imgUrl}
                      alt={`${property.title} photo ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '6px', display: 'block' }}>
                Tap any photo to expand in high definition lightbox
              </span>
            </div>

            {/* Property Name in DM Serif Display */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className="badge-pill badge-teal">{property.type}</span>
                {property.slightly_over_budget && (
                  <span className="badge-pill badge-amber">⚡ Slightly above budget</span>
                )}
              </div>

              <h1 className="font-display" style={{ fontSize: '36px', color: 'var(--ink)', lineHeight: 1.2, marginBottom: '8px' }}>
                {property.title}
              </h1>

              <p
                onClick={() => { setMapCategory('property'); setMapModalOpen(true); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '15px',
                  color: 'var(--slate)',
                  marginBottom: '16px',
                  cursor: 'pointer',
                  width: 'fit-content'
                }}
                title="Click to view live interactive map"
              >
                <MapPin size={16} color="var(--teal)" />
                <span style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}>{property.location}, {property.city}</span>
                <span className="badge-pill badge-teal" style={{ fontSize: '11px', padding: '2px 8px', marginLeft: '6px' }}>View Live Map</span>
              </p>

              {/* Price & BHK Area Pills */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--ink)' }}>
                  {formatPriceINR(property.price)}
                </span>
                <span className="badge-pill badge-slate" style={{ fontSize: '13px', padding: '6px 14px' }}>
                  {property.bhk} BHK Layout
                </span>
                <span className="badge-pill badge-slate" style={{ fontSize: '13px', padding: '6px 14px' }}>
                  {property.area_sqft} sq.ft Super Built-up
                </span>
              </div>
            </div>

            {/* Description Paragraph */}
            <div className="smartnest-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '10px' }}>
                About this Residence
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--slate)', lineHeight: 1.7 }}>
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="smartnest-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '16px' }}>
                Included Amenities
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {["Gated Security", "Covered Car Park", "Solar Water", "Pre-School On-Premise", "Clubhouse", "24/7 Generator Backup", "EV Charging Station"].map((am) => (
                  <span key={am} className="badge-pill badge-teal" style={{ fontSize: '12px', padding: '6px 14px' }}>
                    ✓ {am}
                  </span>
                ))}
              </div>
            </div>

            {/* Nearby Places Tabs: Schools | Hospitals | Parks | Transport */}
            <div className="smartnest-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                  Neighborhood Infrastructure
                </h3>
                <button
                  type="button"
                  onClick={() => { setMapCategory(activeTab); setMapModalOpen(true); }}
                  className="btn btn-ghost"
                  style={{ fontSize: '12px', padding: '4px 10px', color: 'var(--teal)', border: '1px solid rgba(42, 157, 143, 0.3)' }}
                >
                  <Compass size={13} /> Explore on Live Map
                </button>
              </div>

              {/* Tab navigation */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '18px', overflowX: 'auto' }}>
                {[
                  { id: 'schools', label: 'Schools', icon: GraduationCap },
                  { id: 'hospitals', label: 'Hospitals', icon: Activity },
                  { id: 'parks', label: 'Parks', icon: Trees },
                  { id: 'transport', label: 'Transit', icon: Bus }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`btn ${active ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        padding: '6px 14px',
                        fontSize: '13px',
                        border: active ? 'none' : '1px solid var(--border)'
                      }}
                    >
                      <Icon size={14} /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents */}
              <div>
                {activeTab === 'schools' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {property.nearby?.schools?.map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--mist)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>{s.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--slate)' }}>{s.distance_km} km</span>
                          {s.rating && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: 600, color: '#D97706' }}>
                              <Star size={12} fill="#D97706" /> {s.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'hospitals' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {property.nearby?.hospitals?.map((h, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--mist)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>{h.name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--slate)' }}>{h.distance_km} km</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'parks' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {property.nearby?.parks?.map((pk, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--mist)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>{pk.name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--slate)' }}>{pk.distance_km} km</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'transport' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {property.nearby?.transport?.map((t, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--mist)', borderRadius: 'var(--radius-md)' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>{t.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge-pill badge-slate" style={{ fontSize: '10px' }}>{t.type}</span>
                          <span style={{ fontSize: '12px', color: 'var(--slate)' }}>{t.distance_m} m</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT STICKY COLUMN (40%) */}
          <div
            style={{
              position: 'sticky',
              top: '90px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            {/* Match Score & Explanation Card */}
            <div className="smartnest-card" style={{ padding: '28px' }}>
              {/* Large 120px MatchScoreBadge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                <MatchScoreBadge score={property.match_score} size={120} showLabel={true} />
              </div>

              {/* AI Explanation Box with teal-light background */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--teal-light)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '24px',
                  border: '1px solid rgba(42, 157, 143, 0.2)'
                }}
              >
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Sparkles size={14} /> Your lifestyle match explained
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: 1.5 }}>
                  {property.ai_explanation}
                </p>
              </div>

              {/* ScoreBreakdownBar for each score_breakdown entry */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--slate)', marginBottom: '14px' }}>
                  Score Dimension Breakdown
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {property.score_breakdown && Object.entries(property.score_breakdown).map(([key, obj]) => (
                    <ScoreBreakdownBar
                      key={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      score={obj.score}
                      max={obj.max}
                    />
                  ))}
                </div>
              </div>

              {/* Commute Info Card */}
              <div style={{ padding: '14px', backgroundColor: 'var(--mist)', borderRadius: 'var(--radius-md)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={20} color="var(--teal)" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                    {property.commute_minutes} min to Tidel Park Corridor
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--slate)' }}>
                    Mode: {property.commute_mode}
                  </div>
                </div>
              </div>

              {/* Green Score & Wellness Side by Side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                <div style={{ padding: '12px', backgroundColor: 'var(--mist)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--slate)', fontWeight: 600 }}>Green Score</span>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--teal)' }}>{property.green_score}/100</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--mist)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--slate)', fontWeight: 600 }}>Amenity Index</span>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--teal)' }}>{property.amenity_score}/100</div>
                </div>
              </div>

              {/* Action Buttons Stack */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEnquiryModalOpen(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  <MessageSquare size={16} /> Contact Seller
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleSaveToggle}
                    className="btn btn-secondary"
                    style={{ fontSize: '13px', padding: '10px' }}
                  >
                    <Heart size={15} fill={isSaved ? 'var(--teal)' : 'none'} />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/buyer/compare?ids=${property.property_id}`)}
                    className="btn btn-secondary"
                    style={{ fontSize: '13px', padding: '10px' }}
                  >
                    <Scale size={15} /> Compare
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMapCategory('property');
                    setMapModalOpen(true);
                  }}
                  className="btn btn-ghost"
                  style={{ width: '100%', border: '1px solid var(--border)', fontSize: '13px' }}
                >
                  <MapPin size={15} /> View on Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX MODAL ──────────────────────────────────── */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(13, 27, 42, 0.92)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <button
            onClick={() => setLightboxImage(null)}
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
          >
            <X size={28} />
          </button>
          <img
            src={lightboxImage}
            alt="High-res preview"
            style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: '12px', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* ── ENQUIRY MODAL ───────────────────────────────────── */}
      {enquiryModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(13, 27, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="smartnest-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '28px',
              borderRadius: 'var(--radius-modal)',
              animation: 'fadeUpPage 250ms ease-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
                Message Verified Seller
              </h3>
              <button
                onClick={() => setEnquiryModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--slate)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '16px' }}>
              Inquiring about <strong>{property.title}</strong> ({formatPriceINR(property.price)}).
            </p>

            <form onSubmit={handleSendEnquiry}>
              <div style={{ marginBottom: '20px' }}>
                <label className="smartnest-label" htmlFor="enquiry-text">
                  Your message to the seller
                </label>
                <textarea
                  id="enquiry-text"
                  className="smartnest-input"
                  rows={4}
                  placeholder="Hi, I'm interested in this property based on my SmartNest match score. Is an on-site visit possible this weekend?"
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEnquiryModalOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sendingEnquiry}
                >
                  {sendingEnquiry ? 'Sending...' : 'Send Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── LIVE INTERACTIVE MAP MODAL ── */}
      <LiveMapModal
        property={property}
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        initialCategory={mapCategory}
      />
    </div>
  );
};
