import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { formatPriceINR } from '../../components/shared/PropertyCard';
import {
  Building,
  ShieldCheck,
  CheckCircle2,
  Star,
  Award,
  MapPin,
  Phone,
  Mail,
  Clock,
  PlusCircle,
  ArrowRight,
  FileCheck,
  Check,
  ExternalLink,
  MessageSquare,
  BarChart3,
  Edit3
} from 'lucide-react';

export const SellerProfilePage = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSellerData = async () => {
      setLoading(true);
      try {
        const sellerId = user?.user_id || 'S001';
        const [sellerData, props] = await Promise.all([
          api.getSellerDetails(sellerId),
          api.getSellerProperties(sellerId)
        ]);
        setSeller(sellerData);
        setProperties(props || []);
      } catch (err) {
        console.error('Failed to load seller profile', err);
      } finally {
        setLoading(false);
      }
    };

    loadSellerData();
  }, [user]);

  if (loading) {
    return (
      <div className="container-main" style={{ padding: '60px 0', maxWidth: '1000px' }}>
        <div className="skeleton-shimmer" style={{ width: '40%', height: '36px', marginBottom: '20px', borderRadius: '8px' }} />
        <div className="skeleton-shimmer" style={{ width: '100%', height: '260px', borderRadius: '16px', marginBottom: '24px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-shimmer" style={{ height: '100px', borderRadius: '12px' }} />
          ))}
        </div>
      </div>
    );
  }

  const s = seller || {
    seller_id: 'S001',
    user_id: 'usr_seller_01',
    seller_name: user?.name || 'Prestige Developers',
    seller_type: 'Real Estate Developer',
    phone: '+91 98765 43210',
    email: 'sales@prestigedevelopers.in',
    location: 'Peelamedu, Coimbatore',
    experience_years: '8+ Years',
    rating: 4.6,
    review_count: 128,
    properties_count: '50+',
    rera_registered: true,
    trusted_developer: true,
    verified: true
  };

  const initials = s.seller_name
    ? s.seller_name.split(' ').map((n) => n[0]).slice(0, 2).join('')
    : 'PD';

  const activePropertiesCount = properties.length > 0 ? properties.length : (parseInt(s.properties_count) || 50);

  return (
    <div className="page-entrance" style={{ padding: '40px 0 80px 0' }}>
      <div className="container-main" style={{ maxWidth: '1100px' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--slate)', marginBottom: '24px' }}>
          <Link to="/seller/dashboard" style={{ color: 'var(--slate)', textDecoration: 'none' }}>
            Dashboard
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Seller Profile</span>
        </div>

        {/* Hero Card */}
        <div
          className="smartnest-card"
          style={{
            padding: '36px',
            marginBottom: '28px',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #FFFFFF 0%, var(--mist) 100%)',
            border: '1px solid var(--border)'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px'
            }}
          >
            {/* Left: Avatar + Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--ink)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  boxShadow: '0 8px 24px rgba(13, 27, 42, 0.18)',
                  position: 'relative',
                  flexShrink: 0
                }}
              >
                {initials}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--teal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #FFFFFF'
                  }}
                  title="Verified Seller Account"
                >
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <h1 className="font-display" style={{ fontSize: '28px', color: 'var(--ink)', margin: 0, fontWeight: 700 }}>
                    {s.seller_name}
                  </h1>
                  {subscription?.plan_id === 'relax' ? (
                    <span
                      className="badge-pill badge-teal"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700 }}
                      title="Admin-Approved Verified Seller (Relax Plan Feature)"
                    >
                      <ShieldCheck size={13} /> Admin-Approved Verified Seller
                    </span>
                  ) : (
                    <Link
                      to="/seller/plans"
                      className="badge-pill"
                      style={{
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                        border: '1px solid #FDE68A',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 600
                      }}
                      title="Only Relax subscribers receive the Admin-approved Verified Seller badge"
                    >
                      <ShieldCheck size={13} /> Upgrade to Relax for Verified Badge
                    </Link>
                  )}
                  {s.rera_registered && (
                    <span
                      className="badge-pill badge-amber"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700 }}
                    >
                      <CheckCircle2 size={13} /> RERA Registered
                    </span>
                  )}
                  {s.trusted_developer && (
                    <span
                      className="badge-pill"
                      style={{
                        backgroundColor: '#EBF8FF',
                        color: '#2B6CB0',
                        border: '1px solid #BEE3F8',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      <Award size={13} /> Trusted Partner
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', color: 'var(--slate)', fontSize: '14px' }}>
                  <span>{s.seller_type}</span>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="var(--teal)" /> {s.location}
                  </span>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} color="var(--slate)" /> {s.experience_years} in Coimbatore
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/seller/add" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <PlusCircle size={16} /> Add Property
              </Link>
              <Link to="/seller/properties" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Building size={16} /> Manage Listings
              </Link>
              <Link to="/seller/enquiries" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={16} /> Enquiries
              </Link>
            </div>
          </div>
        </div>

        {/* 4-Stat Highlights Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}
        >
          {/* Rating */}
          <div className="smartnest-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Buyer Rating</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={16} color="var(--amber)" fill="var(--amber)" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)' }}>{s.rating || 4.6}</span>
              <span style={{ fontSize: '13px', color: 'var(--slate)' }}>/ 5.0</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '4px' }}>
              Based on {s.review_count || 128} verified buyer ratings
            </div>
          </div>

          {/* Experience */}
          <div className="smartnest-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Market Standing</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} color="var(--teal)" />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)' }}>
              {s.experience_years || '8+ Years'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '4px' }}>
              Active real-estate developer in Coimbatore
            </div>
          </div>

          {/* Active Listings */}
          <div className="smartnest-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Active Listings</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(66, 153, 225, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building size={16} color="#3182CE" />
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--ink)' }}>
              {activePropertiesCount}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '4px' }}>
              Live and verified on SmartNest AI
            </div>
          </div>

          {/* RERA Status */}
          <div className="smartnest-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>RERA Status</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileCheck size={16} color="var(--teal)" />
              </div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--teal)' }}>
              Compliant
            </div>
            <div style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '4px' }}>
              TN/RERA/2021/0492 • Verified
            </div>
          </div>
        </div>

        {/* Two-Column Details: Contact & Credibility + Verification Standard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '36px' }}>
          {/* Left Column: Official Contact & Credentials */}
          <div className="smartnest-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={18} color="var(--teal)" /> Official Business Credentials
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={15} color="var(--slate)" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Official Email</div>
                  <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 600 }}>{s.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={15} color="var(--slate)" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Contact Number</div>
                  <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 600 }}>{s.phone}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={15} color="var(--slate)" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Registered Office</div>
                  <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 600 }}>{s.location}, Tamil Nadu, India</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={15} color="var(--slate)" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Operational Hours</div>
                  <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 600 }}>Mon – Sat: 9:00 AM – 7:00 PM (IST)</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileCheck size={15} color="var(--slate)" />
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>RERA Registration Number</div>
                  <div style={{ fontSize: '14px', color: 'var(--ink)', fontWeight: 600 }}>TN/RERA/2021/0492</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Platform Trust & Verification Audit */}
          <div className="smartnest-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ink)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--teal)" /> SmartNest Trust Standards
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', backgroundColor: 'var(--mist)', borderRadius: '8px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 600 }}>
                  Developer Identity & Business Registration Verified
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', backgroundColor: 'var(--mist)', borderRadius: '8px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 600 }}>
                  Title Deeds & Clear Encumbrance Certificates Audited
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', backgroundColor: 'var(--mist)', borderRadius: '8px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 600 }}>
                  On-site Physical Inspection & Acoustic Level Verified
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', backgroundColor: 'var(--mist)', borderRadius: '8px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 600 }}>
                  Average Enquiry Response SLA: Under 2 Hours
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', backgroundColor: 'var(--mist)', borderRadius: '8px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                </div>
                <div style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 600 }}>
                  Zero Brokerage & Transparent Direct Pricing Commitment
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Managed Properties Portfolio */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 className="font-display" style={{ fontSize: '22px', color: 'var(--ink)', margin: 0 }}>
                Properties Managed by {s.seller_name}
              </h2>
              <div style={{ fontSize: '13px', color: 'var(--slate)', marginTop: '4px' }}>
                Currently active listings showcased to matched lifestyle buyers
              </div>
            </div>
            <Link to="/seller/properties" className="btn btn-secondary" style={{ fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              View All in Table <ArrowRight size={14} />
            </Link>
          </div>

          {properties.length === 0 ? (
            <div className="smartnest-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--slate)' }}>
              <Building size={40} color="var(--slate)" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px' }}>
                No active listings found
              </div>
              <div style={{ fontSize: '13px', marginBottom: '20px' }}>
                Publish a property listing to showcase your portfolio.
              </div>
              <Link to="/seller/add" className="btn btn-primary">
                <PlusCircle size={15} /> Add First Property
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}
            >
              {properties.slice(0, 6).map((prop) => (
                <div
                  key={prop.property_id || prop.id}
                  className="smartnest-card"
                  style={{
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
                  }}
                >
                  {/* Property Image */}
                  <div style={{ position: 'relative', height: '180px', backgroundColor: 'var(--mist)' }}>
                    <img
                      src={prop.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                      alt={prop.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        backgroundColor: prop.status === 'active' ? 'var(--teal)' : 'var(--amber)',
                        color: '#FFFFFF',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {prop.status || 'Active'}
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(13, 27, 42, 0.85)',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: '6px'
                      }}
                    >
                      {formatPriceINR(prop.price)}
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                      {prop.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--slate)', marginBottom: '12px' }}>
                      <MapPin size={13} color="var(--teal)" />
                      <span>{prop.location || prop.address}, {prop.city}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--slate)', marginBottom: '16px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                      <span>{prop.bhk} BHK</span>
                      <span>•</span>
                      <span>{prop.area_sqft} sq.ft</span>
                      <span>•</span>
                      <span>{prop.type || 'Apartment'}</span>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                      <Link
                        to={`/seller/edit/${prop.property_id || prop.id}`}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '8px', fontSize: '12px', justifyContent: 'center' }}
                      >
                        <Edit3 size={13} /> Edit
                      </Link>
                      <Link
                        to={`/buyer/property/${prop.property_id || prop.id}`}
                        className="btn btn-ghost"
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                        title="View Live Listing"
                      >
                        <ExternalLink size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
