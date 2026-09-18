import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCompare } from '../../context/CompareContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { MatchScoreBadge } from '../../components/shared/MatchScoreBadge';
import { ScoreBreakdownBar } from '../../components/shared/ScoreBreakdownBar';
import { SkeletonCard } from '../../components/shared/SkeletonCard';
import { formatPriceINR } from '../../components/shared/PropertyCard';
import { LiveMapModal } from '../../components/shared/LiveMapModal';
import { UpgradeModal } from '../../components/subscription/UpgradeModal';
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
  Compass,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Phone,
  Mail
} from 'lucide-react';

export const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sessionId } = useAuth();
  const { addToast } = useToast();
  const { addToCompare, isInCompare } = useCompare();
  const { subscription, usage, canContactSeller } = useSubscription();

  const [property, setProperty] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schools'); // 'schools' | 'hospitals' | 'parks' | 'transport'
  const [lightboxImage, setLightboxImage] = useState(null);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapCategory, setMapCategory] = useState('property');
  const [isSaved, setIsSaved] = useState(false);
  const [sendingEnquiry, setSendingEnquiry] = useState(false);

  const modalContentRef = useRef(null);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const data = await api.getProperty(id);
        setProperty(data);
        if (data?.seller_id) {
          const sellerData = await api.getSellerDetails(data.seller_id);
          setSeller(sellerData);
        }
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

  // Lock body scroll when enquiry modal is open & reset modal scroll to top
  useEffect(() => {
    if (enquiryModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Reset modal content scroll to top
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }

      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [enquiryModalOpen]);

  // Keyboard accessibility: Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && enquiryModalOpen) {
        setEnquiryModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enquiryModalOpen]);

  const handleOpenEnquiryModal = async () => {
    // Check if buyer has an existing conversation with this property or seller
    try {
      const convos = await api.getConversations(sessionId || 'usr_buyer_01');
      const hasExistingConvo = convos && convos.some(
        (c) => c.property_id === id || (property?.seller_id && c.seller_id === property.seller_id)
      );

      // If no existing conversation and contact allowance is exhausted, block and prompt upgrade
      if (!hasExistingConvo && !canContactSeller()) {
        setShowUpgradeModal(true);
        addToast({
          type: 'warning',
          message: `You have exhausted your contact quota (${usage?.contacts_used || 0}/${usage?.contact_limit || 15} contacts). Upgrade your plan to connect with more sellers.`
        });
        return;
      }
    } catch (err) {
      console.error('Error verifying contact allowance:', err);
    }

    if (!enquiryMessage && property) {
      setEnquiryMessage(
        `Hi, I am interested in ${property.title} located at ${property.location}. Please share more details, floor plan, and schedule a site visit.`
      );
    }
    setEnquiryModalOpen(true);
    requestAnimationFrame(() => {
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
    });
  };

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
      const res = await api.sendEnquiry(id, enquiryMessage, sessionId);
      const targetSellerName = res?.seller_name || seller?.seller_name || 'Verified Seller';
      addToast({
        type: 'success',
        message: `Enquiry sent to ${targetSellerName} — Your conversation is now available in Message Box.`
      });
      setEnquiryModalOpen(false);
      setEnquiryMessage('');
    } catch (err) {
      if (err.message && err.message.includes('limit')) {
        setEnquiryModalOpen(false);
        setShowUpgradeModal(true);
        addToast({ type: 'warning', message: err.message });
      } else {
        addToast({ type: 'error', message: 'Failed to send enquiry.' });
      }
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
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
                      }}
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
                <MatchScoreBadge
                  score={property.match_score}
                  size={120}
                  showLabel={true}
                />
              </div>

              {/* AI Explanation Box: WHY THIS PROPERTY? */}
              <div
                style={{
                  padding: '16px 18px',
                  backgroundColor: 'var(--teal-light)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  border: '1px solid rgba(42, 157, 143, 0.25)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Sparkles size={14} /> Why This Property?
                  </h4>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: 1.55, margin: 0 }}>
                  {property.ai_explanation}
                </p>
              </div>

              {/* WHAT YOU GAIN & WHAT YOU SACRIFICE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {/* What You Gain */}
                <div
                  style={{
                    padding: '14px 16px',
                    backgroundColor: '#F0FDF4',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #BBF7D0'
                  }}
                >
                  <h5 style={{ fontSize: '12px', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    <CheckCircle2 size={14} color="#16A34A" /> What You Gain
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(property.what_you_gain || [
                      "Within preferred budget limit",
                      "Target BHK family layout",
                      "Comfortable commute threshold",
                      "Pedestrian access to park"
                    ]).map((gain, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#14532D', lineHeight: 1.4 }}>
                        <span style={{ color: '#16A34A', fontWeight: 700, lineHeight: 1 }}>✓</span>
                        <span>{gain}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What You Sacrifice */}
                <div
                  style={{
                    padding: '14px 16px',
                    backgroundColor: '#FFFBEB',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #FDE68A'
                  }}
                >
                  <h5 style={{ fontSize: '12px', fontWeight: 700, color: '#92400E', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    <AlertTriangle size={14} color="#D97706" /> What You Sacrifice
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(property.what_you_sacrifice || [
                      "Schools require moderate transit",
                      "Floor layout is moderately compact"
                    ]).map((sac, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#78350F', lineHeight: 1.4 }}>
                        <span style={{ color: '#D97706', fontWeight: 700, lineHeight: 1 }}>⚠</span>
                        <span>{sac}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ScoreBreakdownBar for each score_breakdown entry */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--slate)', margin: 0 }}>
                    Score Dimension Breakdown
                  </h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {property.score_breakdown && Object.entries(property.score_breakdown).map(([key, val]) => (
                    <ScoreBreakdownBar
                      key={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      score={val}
                      max={100}
                      isPercentage={true}
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
                  onClick={handleOpenEnquiryModal}
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
                    onClick={() => {
                      if (property) {
                        if (!isInCompare(property.property_id)) {
                          addToCompare(property);
                        }
                        navigate('/buyer/compare');
                      }
                    }}
                    className="btn btn-secondary"
                    style={{ fontSize: '13px', padding: '10px' }}
                  >
                    <Scale size={15} /> {isInCompare(property?.property_id) ? 'In Compare' : 'Compare'}
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

      {/* ── UPGRADED VERIFIED SELLER ENQUIRY MODAL (PORTAL) ─────────── */}
      {enquiryModalOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="enquiry-modal-title"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(13, 27, 42, 0.65)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              boxSizing: 'border-box'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setEnquiryModalOpen(false);
            }}
          >
            <div
              className="smartnest-card"
              style={{
                width: '100%',
                maxWidth: '720px',
                height: 'auto',
                maxHeight: 'calc(100vh - 48px)',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                boxShadow: '0 25px 50px -12px rgba(13, 27, 42, 0.35)',
                overflow: 'hidden',
                padding: 0,
                boxSizing: 'border-box'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '20px 24px 16px 24px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  backgroundColor: '#FFFFFF',
                  flexShrink: 0
                }}
              >
                <div>
                  <h3
                    id="enquiry-modal-title"
                    style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: 'var(--ink)',
                      lineHeight: 1.3,
                      margin: 0
                    }}
                  >
                    Message Verified Seller
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--slate)',
                      margin: '4px 0 0 0'
                    }}
                  >
                    You're contacting the verified seller for this property.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEnquiryModalOpen(false)}
                  aria-label="Close"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--slate)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Scrollable Body Form */}
              <form
                onSubmit={handleSendEnquiry}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 auto',
                  minHeight: 0,
                  overflow: 'hidden',
                  margin: 0
                }}
              >
                <div
                  ref={modalContentRef}
                  style={{
                    flex: '1 1 auto',
                    minHeight: 0,
                    overflowY: 'auto',
                    overscrollBehavior: 'contain',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#CBD5E1 transparent',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                  }}
                >
                  {/* 1. Verified Seller Card */}
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '18px 20px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      {/* Seller Initials / Avatar */}
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #0D1B2A 0%, #1F3A52 100%)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '18px',
                          flexShrink: 0
                        }}
                      >
                        {seller?.seller_name ? seller.seller_name.charAt(0) : 'S'}
                      </div>

                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '17px',
                              fontWeight: 700,
                              color: 'var(--ink)'
                            }}
                          >
                            {seller?.seller_name || 'Prestige Developers'}
                          </span>
                          {seller?.verified && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#166534',
                                backgroundColor: '#DCFCE7',
                                padding: '2px 8px',
                                borderRadius: '9999px',
                                border: '1px solid #BBF7D0'
                              }}
                            >
                              <CheckCircle2 size={12} /> Verified Seller
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '2px' }}>
                          {seller?.seller_type || 'Real Estate Developer'} · {seller?.experience_years || '8+ Years'} in Coimbatore
                        </div>
                      </div>
                    </div>

                    {/* 3-Column Contact Details Grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                        gap: '12px',
                        marginTop: '14px',
                        paddingTop: '14px',
                        borderTop: '1px solid #E2E8F0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(42, 157, 143, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--teal)',
                            flexShrink: 0
                          }}
                        >
                          <Phone size={14} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '10.5px', color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>
                            Call / WhatsApp
                          </div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {seller?.phone || '+91 98765 43210'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(42, 157, 143, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--teal)',
                            flexShrink: 0
                          }}
                        >
                          <Mail size={14} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '10.5px', color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>
                            Email
                          </div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {seller?.email || 'sales@developer.in'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(42, 157, 143, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--teal)',
                            flexShrink: 0
                          }}
                        >
                          <MapPin size={14} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '10.5px', color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>
                            Office Location
                          </div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                            {seller?.location || 'Coimbatore'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Credibility Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
                      <span
                        className="badge-pill"
                        style={{
                          backgroundColor: '#FEF3C7',
                          color: '#92400E',
                          border: '1px solid #FDE68A',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11.5px',
                          padding: '4px 10px'
                        }}
                      >
                        <Star size={12} fill="#D97706" color="#D97706" /> {seller?.rating || 4.6}/5 · {seller?.review_count || 128} reviews
                      </span>
                      <span
                        className="badge-pill badge-slate"
                        style={{
                          fontSize: '11.5px',
                          padding: '4px 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Building2 size={12} /> {seller?.properties_count || '50+'} Properties
                      </span>
                      {seller?.rera_registered && (
                        <span
                          className="badge-pill badge-teal"
                          style={{
                            fontSize: '11.5px',
                            padding: '4px 10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <ShieldCheck size={12} /> RERA Registered
                        </span>
                      )}
                      {seller?.trusted_developer && (
                        <span
                          className="badge-pill"
                          style={{
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8',
                            border: '1px solid #BFDBFE',
                            fontSize: '11.5px',
                            padding: '4px 10px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CheckCircle2 size={12} /> Trusted Developer
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2. Property Preview Card */}
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px'
                    }}
                  >
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
                        }}
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          flexShrink: 0
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '8px',
                          backgroundColor: '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--slate)',
                          flexShrink: 0
                        }}
                      >
                        <Building2 size={24} />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: 700,
                          color: 'var(--ink)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {property.title}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          color: 'var(--slate)',
                          marginTop: '2px'
                        }}
                      >
                        <MapPin size={12} color="var(--teal)" />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {property.location}, {property.city}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--teal)',
                          marginTop: '4px'
                        }}
                      >
                        {formatPriceINR(property.price)} | {property.bhk} BHK | {property.area_sqft} sq.ft
                      </div>
                    </div>
                  </div>

                  {/* 3. Buyer Message Section */}
                  <div>
                    <label
                      className="smartnest-label"
                      htmlFor="enquiry-text"
                      style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px', display: 'block' }}
                    >
                      Your message to the seller
                    </label>
                    <textarea
                      id="enquiry-text"
                      className="smartnest-input"
                      rows={4}
                      placeholder="Type your message here..."
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      style={{ resize: 'vertical', minHeight: '90px' }}
                      required
                    />
                  </div>

                  {/* 4. Trust / Verification Note */}
                  <div
                    style={{
                      backgroundColor: 'rgba(42, 157, 143, 0.06)',
                      border: '1px solid rgba(42, 157, 143, 0.2)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px'
                    }}
                  >
                    <ShieldCheck size={18} color="var(--teal)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ fontSize: '12px', color: 'var(--ink)', lineHeight: 1.5 }}>
                      <strong>Verified SmartNest Partner:</strong> SmartNest verifies developer credentials, RERA registrations, and contact authenticity before listing. All site visits and price negotiations are conducted directly with the verified developer.
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions (Sticky at bottom, flexShrink: 0) */}
                <div
                  style={{
                    padding: '16px 24px',
                    borderTop: '1px solid var(--border)',
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '12px',
                    flexShrink: 0
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setEnquiryModalOpen(false)}
                    className="btn btn-ghost"
                    style={{ fontSize: '13px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sendingEnquiry}
                    style={{ fontSize: '13px', padding: '10px 20px' }}
                  >
                    {sendingEnquiry ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send size={14} /> Send Enquiry
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* ── LIVE INTERACTIVE MAP MODAL ── */}
      <LiveMapModal
        property={property}
        isOpen={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        initialCategory={mapCategory}
      />

      {/* ── UPGRADE SUBSCRIPTION MODAL ── */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType="contacts"
        currentPlan={subscription?.plan_id || 'buyer_connect'}
        userRole="buyer"
        usage={usage}
      />
    </div>
  );
};
