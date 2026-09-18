import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Scale, Clock, Volume2, Trees, Sparkles, MapPin } from 'lucide-react';
import { MatchScoreBadge } from './MatchScoreBadge';
import { LiveMapModal } from './LiveMapModal';

export const formatPriceINR = (price) => {
  if (!price && price !== 0) return '';
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(0)} Lakhs`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
};

export const PropertyCard = ({
  property,
  showCompare = false,
  showSave = false,
  isComparing = false,
  isSaved = false,
  onCompare,
  onSave
}) => {
  if (!property) return null;

  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div
      className="smartnest-card smartnest-card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        height: '100%'
      }}
    >
      {/* Card Image and Overlay Badges */}
      <div style={{ position: 'relative', width: '100%', height: '210px', backgroundColor: '#E2E8F0' }}>
        <img
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
          alt={property.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Top Badges Row */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            pointerEvents: 'none'
          }}
        >
          {/* Slightly Over Budget Amber Label */}
          {property.slightly_over_budget ? (
            <span
              className="badge-pill badge-amber"
              style={{
                pointerEvents: 'auto',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                fontWeight: 600
              }}
              title="Slightly above preferred budget, but strong lifestyle fit"
            >
              ⚡ Slightly above budget
            </span>
          ) : (
            <span
              className="badge-pill badge-teal"
              style={{
                pointerEvents: 'auto',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                fontWeight: 600
              }}
            >
              {property.type}
            </span>
          )}

          {/* Action buttons (Save & Compare) */}
          <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
            {showCompare && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCompare?.(property.property_id);
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: isComparing ? 'var(--teal)' : 'rgba(255, 255, 255, 0.95)',
                  color: isComparing ? '#FFFFFF' : 'var(--slate)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  transition: 'transform var(--transition-fast)'
                }}
                title={isComparing ? "Remove from comparison" : "Add to compare"}
                aria-label="Toggle comparison"
              >
                <Scale size={16} />
              </button>
            )}

            {showSave && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSave?.(property.property_id);
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: isSaved ? 'var(--rose)' : 'rgba(255, 255, 255, 0.95)',
                  color: isSaved ? '#FFFFFF' : 'var(--slate)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                  transition: 'transform var(--transition-fast)'
                }}
                title={isSaved ? "Saved to shortlist" : "Save property"}
                aria-label="Toggle shortlist save"
              >
                <Heart size={16} fill={isSaved ? '#FFFFFF' : 'none'} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Floating Match Score Badge on Image */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: '#FFFFFF',
            padding: '4px 8px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.12)'
          }}
        >
          <MatchScoreBadge
            score={property.match_score}
            size={48}
            showLabel={false}
          />
        </div>
      </div>

      {/* Card Content Details */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Price & BHK */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
          <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>
            {formatPriceINR(property.price)}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>
            {property.bhk} BHK{property.area_sqft ? ` · ${property.area_sqft} sq.ft` : ''}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--ink)', marginBottom: '6px', lineHeight: 1.3 }}>
          <Link
            to={`/buyer/property/${property.property_id}`}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {property.title}
          </Link>
        </h3>

        {/* Location with Live Map Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--slate)', margin: 0 }}>
            <MapPin size={14} color="var(--teal)" />
            <span>{property.location}, {property.city}</span>
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMapOpen(true);
            }}
            className="btn btn-ghost"
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              color: 'var(--teal)',
              fontWeight: 600,
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(42, 157, 143, 0.3)',
              backgroundColor: 'var(--teal-light)'
            }}
            title="View original live map"
          >
            Map
          </button>
        </div>

        {/* Key Lifestyle Metrics Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            padding: '12px',
            backgroundColor: 'var(--mist)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink)' }}>
            <Clock size={14} color="var(--slate)" />
            <span>{property.commute_minutes} min commute</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ink)' }}>
            <Volume2 size={14} color="var(--slate)" />
            <span style={{ textTransform: 'capitalize' }}>{property.noise_level} noise</span>
          </div>
        </div>

        {/* Green Score Mini-Bar */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--slate)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
              <Trees size={12} color="var(--teal)" /> Wellness & Green Score
            </span>
            <span style={{ fontWeight: 600, color: 'var(--teal)' }}>{property.green_score}/100</span>
          </div>
          <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--teal-light)', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${property.green_score}%`,
                height: '100%',
                backgroundColor: 'var(--teal)',
                borderRadius: '999px'
              }}
            />
          </div>
        </div>

        {/* Detail Link CTA */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--slate)' }}>
            ID: {property.property_id}
          </span>
          <Link
            to={`/buyer/property/${property.property_id}`}
            className="btn btn-ghost"
            style={{ padding: '4px 12px', fontSize: '13px', color: 'var(--teal)', fontWeight: 600 }}
          >
            View Details
          </Link>
        </div>
      </div>

      {/* ── LIVE INTERACTIVE MAP MODAL ── */}
      <LiveMapModal
        property={property}
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        initialCategory="property"
      />
    </div>
  );
};
