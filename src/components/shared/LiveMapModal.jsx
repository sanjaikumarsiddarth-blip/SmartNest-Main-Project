import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  X,
  ExternalLink,
  Navigation,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  GraduationCap,
  Activity,
  Trees,
  Bus,
  Home,
  Star
} from 'lucide-react';

export const LiveMapModal = ({ property, isOpen, onClose, initialCategory = 'property' }) => {
  if (!isOpen || !property) return null;

  const [category, setCategory] = useState(initialCategory); // 'property' | 'schools' | 'hospitals' | 'parks' | 'transport'
  const [viewMode, setViewMode] = useState('roadmap'); // 'roadmap' | 'satellite'
  const [provider, setProvider] = useState('google'); // 'google' | 'osm'
  const [zoom, setZoom] = useState(15);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCategory(initialCategory);
    setSelectedPoi(null);
    setMapLoaded(false);
  }, [initialCategory, isOpen, property]);

  // Coordinates fallback
  const lat = property.coordinates?.lat || 11.0168;
  const lng = property.coordinates?.lng || 76.9558;

  // Determine active query
  let activeQuery = `${property.location}, ${property.city || 'Coimbatore'}`;
  if (selectedPoi) {
    activeQuery = `${selectedPoi.name}, ${property.location}, ${property.city || 'Coimbatore'}`;
  } else if (category === 'schools') {
    activeQuery = `Schools near ${property.location}, ${property.city || 'Coimbatore'}`;
  } else if (category === 'hospitals') {
    activeQuery = `Hospitals near ${property.location}, ${property.city || 'Coimbatore'}`;
  } else if (category === 'parks') {
    activeQuery = `Parks near ${property.location}, ${property.city || 'Coimbatore'}`;
  } else if (category === 'transport') {
    activeQuery = `Transit stations near ${property.location}, ${property.city || 'Coimbatore'}`;
  }

  // Google Maps embed URL
  const tParam = viewMode === 'satellite' ? 'k' : 'm';
  const googleMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(activeQuery)}&t=${tParam}&z=${zoom}&ie=UTF8&iwloc=&output=embed`;

  // OpenStreetMap embed URL
  const osmDelta = zoom >= 17 ? 0.005 : zoom >= 15 ? 0.012 : 0.024;
  const osmMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - osmDelta}%2C${lat - osmDelta}%2C${lng + osmDelta}%2C${lat + osmDelta}&layer=mapnik&marker=${lat}%2C${lng}`;

  const currentMapUrl = provider === 'osm' ? osmMapUrl : googleMapUrl;

  const handleCopyLocation = () => {
    const text = `${property.title}\n${property.location}, ${property.city}\nCoordinates: ${lat}, ${lng}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectCategory = (cat) => {
    setCategory(cat);
    setSelectedPoi(null);
    setMapLoaded(false);
  };

  const handleSelectPoi = (poi) => {
    setSelectedPoi(poi);
    setZoom(16);
    setMapLoaded(false);
  };

  const currentPoiList = property.nearby?.[category] || [];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(13, 27, 42, 0.78)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="smartnest-card"
        style={{
          width: '100%',
          maxWidth: '880px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-modal)',
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 24px 56px rgba(13, 27, 42, 0.45)'
        }}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--white)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--teal-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Compass size={20} color="var(--teal)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                  Live Location & Neighborhood Map
                </h3>
                <span className="badge-pill badge-teal" style={{ fontSize: '10px', fontWeight: 600 }}>
                  LIVE MAP
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} color="var(--teal)" />
                <span>{property.title} · {property.location}, {property.city}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ padding: '6px', borderRadius: '50%', color: 'var(--slate)' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── TOOLBAR: Category Layer Chips & Map View Modes ── */}
        <div
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--mist)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          {/* Category Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleSelectCategory('property')}
              className={`btn ${category === 'property' && !selectedPoi ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                borderRadius: 'var(--radius-pill)',
                border: category === 'property' && !selectedPoi ? '1px solid var(--teal)' : '1px solid var(--border)'
              }}
            >
              <Home size={13} /> Property Center
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory('schools')}
              className={`btn ${category === 'schools' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                borderRadius: 'var(--radius-pill)',
                border: category === 'schools' ? '1px solid var(--teal)' : '1px solid var(--border)'
              }}
            >
              <GraduationCap size={13} /> Schools ({property.nearby?.schools?.length || 0})
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory('hospitals')}
              className={`btn ${category === 'hospitals' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                borderRadius: 'var(--radius-pill)',
                border: category === 'hospitals' ? '1px solid var(--teal)' : '1px solid var(--border)'
              }}
            >
              <Activity size={13} /> Hospitals ({property.nearby?.hospitals?.length || 0})
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory('parks')}
              className={`btn ${category === 'parks' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                borderRadius: 'var(--radius-pill)',
                border: category === 'parks' ? '1px solid var(--teal)' : '1px solid var(--border)'
              }}
            >
              <Trees size={13} /> Parks ({property.nearby?.parks?.length || 0})
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory('transport')}
              className={`btn ${category === 'transport' ? 'btn-primary' : 'btn-ghost'}`}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                borderRadius: 'var(--radius-pill)',
                border: category === 'transport' ? '1px solid var(--teal)' : '1px solid var(--border)'
              }}
            >
              <Bus size={13} /> Transit ({property.nearby?.transport?.length || 0})
            </button>
          </div>

          {/* Map Controls: Provider, Satellite Toggle, Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Satellite / Road toggle */}
            {provider === 'google' && (
              <div
                style={{
                  display: 'flex',
                  backgroundColor: 'var(--white)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  padding: '2px'
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewMode('roadmap')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'roadmap' ? 'var(--teal)' : 'transparent',
                    color: viewMode === 'roadmap' ? '#FFFFFF' : 'var(--slate)'
                  }}
                >
                  Map
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('satellite')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'satellite' ? 'var(--teal)' : 'transparent',
                    color: viewMode === 'satellite' ? '#FFFFFF' : 'var(--slate)'
                  }}
                >
                  Satellite
                </button>
              </div>
            )}

            {/* Provider toggle */}
            <div
              style={{
                display: 'flex',
                backgroundColor: 'var(--white)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                padding: '2px'
              }}
            >
              <button
                type="button"
                onClick={() => setProvider('google')}
                title="Google Maps live data"
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: provider === 'google' ? 'var(--ink)' : 'transparent',
                  color: provider === 'google' ? '#FFFFFF' : 'var(--slate)'
                }}
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => setProvider('osm')}
                title="OpenStreetMap vector data"
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundColor: provider === 'osm' ? 'var(--ink)' : 'transparent',
                  color: provider === 'osm' ? '#FFFFFF' : 'var(--slate)'
                }}
              >
                OSM
              </button>
            </div>

            {/* Zoom +/- */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--white)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
              }}
            >
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(z + 1, 19))}
                title="Zoom in"
                style={{
                  padding: '4px 8px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--slate)'
                }}
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(z - 1, 12))}
                title="Zoom out"
                style={{
                  padding: '4px 8px',
                  border: 'none',
                  borderLeft: '1px solid var(--border)',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--slate)'
                }}
              >
                <ZoomOut size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── LIVE INTERACTIVE MAP IFRAME ── */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '420px',
            backgroundColor: '#E2E8F0',
            overflow: 'hidden'
          }}
        >
          {/* Skeleton loading overlay */}
          {!mapLoaded && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                gap: '12px'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid var(--border)',
                  borderTopColor: 'var(--teal)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              />
              <span style={{ fontSize: '13px', color: 'var(--slate)', fontWeight: 500 }}>
                Loading live street & transit map of {property.location}...
              </span>
            </div>
          )}

          <iframe
            key={`${currentMapUrl}-${zoom}-${viewMode}`}
            title={`Live Map of ${property.title}`}
            src={currentMapUrl}
            width="100%"
            height="100%"
            style={{
              border: 0,
              width: '100%',
              height: '100%',
              display: 'block'
            }}
            onLoad={() => setMapLoaded(true)}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Floating badge for active query indicator */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--ink)',
              zIndex: 3
            }}
          >
            <MapPin size={13} color="var(--teal)" />
            <span>Viewing: {selectedPoi ? selectedPoi.name : category === 'property' ? property.title : `${category.toUpperCase()} around ${property.location}`}</span>
          </div>
        </div>

        {/* ── NEARBY PLACES QUICK-SELECT STRIP (if schools/hospitals/parks/transport selected) ── */}
        {currentPoiList.length > 0 && category !== 'property' && (
          <div
            style={{
              padding: '10px 24px',
              backgroundColor: 'var(--white)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Focus Point:
            </span>
            {currentPoiList.map((poi, idx) => {
              const isSelected = selectedPoi?.name === poi.name;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPoi(poi)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: isSelected ? '1px solid var(--teal)' : '1px solid var(--border)',
                    backgroundColor: isSelected ? 'var(--teal-light)' : 'var(--mist)',
                    color: isSelected ? 'var(--teal)' : 'var(--ink)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{poi.name}</span>
                  <span style={{ fontSize: '10px', color: 'var(--slate)' }}>
                    {poi.distance_km ? `${poi.distance_km}km` : `${poi.distance_m}m`}
                  </span>
                  {poi.rating && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#D97706', fontSize: '11px', fontWeight: 600 }}>
                      <Star size={10} fill="#D97706" /> {poi.rating}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── FOOTER: Actions & Live Metadata ── */}
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: 'var(--white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Commute & Infrastructure quick badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--slate)' }}>
              <Bus size={14} color="var(--teal)" />
              <span><strong>{property.commute_minutes} mins</strong> to tech hub ({property.commute_mode})</span>
            </div>
            <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--slate)' }}>
              <Trees size={14} color="var(--teal)" />
              <span>Green canopy: <strong>{property.green_score}/100</strong></span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Copy Coordinates */}
            <button
              type="button"
              onClick={handleCopyLocation}
              className="btn btn-ghost"
              style={{ fontSize: '12px', padding: '6px 12px' }}
              title="Copy GPS coordinates and address"
            >
              {copied ? <Check size={14} color="var(--teal)" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy GPS'}</span>
            </button>

            {/* Directions on Google Maps */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(property.location + ', ' + (property.city || 'Coimbatore'))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--teal)', border: '1px solid var(--teal)' }}
            >
              <Navigation size={14} /> Get Directions
            </a>

            {/* Open Full Google Maps in new tab */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              <ExternalLink size={14} /> Open Full Map
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
