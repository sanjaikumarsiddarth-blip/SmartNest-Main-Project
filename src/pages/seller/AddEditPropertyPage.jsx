import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PropertyCard } from '../../components/shared/PropertyCard';
import {
  Building,
  Upload,
  Image as ImageIcon,
  Check,
  MapPin,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

const AMENITIES_OPTIONS = [
  "Supermarket",
  "Hospital",
  "School",
  "Park",
  "Gym",
  "Metro/Bus Stop",
  "Restaurant",
  "Bank/ATM",
  "EV Charging",
  "Parking",
  "Swimming Pool",
  "Pharmacy"
];

export const AddEditPropertyPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: 'Emerald Palms Executive Suite',
    type: 'Apartment',
    price: 5800000,
    bhk: 2,
    area_sqft: 1250,
    bedrooms: 2,
    bathrooms: 2,
    parking: true,
    address: 'Near Tidel Park, Civil Aerodrome Post',
    city: 'Coimbatore',
    lat: 11.028,
    lng: 77.027,
    description: 'Sophisticated contemporary home located adjacent to prime technology centers. Crafted with Italian vitrified tiles, acoustic double-pane balcony glazing, and uninterrupted mountain view corridors.',
    school_distance_km: 1.5,
    hospital_distance_km: 2.0,
    park_distance_km: 0.8,
    noise_level: 'low',
    green_score: 88,
    amenities: ['Supermarket', 'School', 'Park', 'Gym', 'Parking'],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ]
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const loadProp = async () => {
        try {
          const p = await api.getProperty(id);
          if (p) {
            setFormData({
              title: p.title || '',
              type: p.type || 'Apartment',
              price: p.price || 5000000,
              bhk: p.bhk || 2,
              area_sqft: p.area_sqft || 1100,
              bedrooms: p.bhk || 2,
              bathrooms: 2,
              parking: true,
              address: p.location || '',
              city: p.city || 'Coimbatore',
              lat: 11.016,
              lng: 76.955,
              description: p.description || '',
              school_distance_km: p.school_distance_km || 1.5,
              hospital_distance_km: p.hospital_distance_km || 2.0,
              park_distance_km: p.park_distance_km || 0.5,
              noise_level: p.noise_level || 'low',
              green_score: p.green_score || 85,
              amenities: ['Supermarket', 'School', 'Park', 'Parking'],
              images: p.images || []
            });
          }
        } catch (e) {
          addToast({ type: 'error', message: 'Could not load existing listing.' });
        }
      };
      loadProp();
    }
  }, [id, isEdit, addToast]);

  const toggleAmenity = (name) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(name);
      return {
        ...prev,
        amenities: exists ? prev.amenities.filter((a) => a !== name) : [...prev.amenities, name]
      };
    });
  };

  const handleImageMockDrop = (e) => {
    e.preventDefault();
    addToast({ type: 'info', message: 'Sample architectural imagery loaded for listing.' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.updateProperty(id, formData);
        addToast({ type: 'success', message: 'Property listing updated successfully.' });
      } else {
        await api.createProperty({ ...formData, seller_id: user?.user_id });
        addToast({ type: 'success', message: 'Property submitted for admin approval.' });
      }
      navigate('/seller/properties');
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to submit property.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Preview object synced in real-time
  const previewProperty = {
    property_id: isEdit ? id : 'PREVIEW',
    title: formData.title || 'Untitled Property',
    type: formData.type,
    price: formData.price,
    bhk: formData.bhk,
    area_sqft: formData.area_sqft,
    location: formData.address || 'Address',
    city: formData.city || 'City',
    commute_minutes: 20,
    commute_mode: 'Car / Transit',
    noise_level: formData.noise_level,
    green_score: formData.green_score,
    match_score: 91,
    slightly_over_budget: false,
    images: formData.images
  };

  return (
    <div className="page-entrance" style={{ padding: '40px 0 100px 0' }}>
      <div className="container-main">
        {/* Header with Back button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => navigate('/seller/properties')}
            className="btn btn-ghost"
            style={{ padding: '6px 10px' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)' }}>
              {isEdit ? 'Edit Property Listing' : 'Add New Property Listing'}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--slate)' }}>
              Publish listing specifications and acoustic neighborhood metrics
            </p>
          </div>
        </div>

        {/* ── TWO-COLUMN FORM LAYOUT (FIELDS LEFT, PREVIEW RIGHT) ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '40px',
            alignItems: 'start'
          }}
        >
          {/* LEFT FORM FIELDS */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Section 1: Property Details */}
            <div className="smartnest-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '16px' }}>
                Property Details
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <label className="smartnest-label">Listing Title</label>
                <input
                  type="text"
                  className="smartnest-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="smartnest-label">Property Type</label>
                  <select
                    className="smartnest-input"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Villa">Villa</option>
                    <option value="Independent House">Independent House</option>
                    <option value="Plot">Plot</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="smartnest-label">Price (INR)</label>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--teal)' }}>
                      ₹{Math.round(formData.price / 100000)} Lakhs
                    </span>
                  </div>
                  <input
                    type="number"
                    className="smartnest-input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="smartnest-label">Bedrooms (BHK)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFormData({ ...formData, bhk: n, bedrooms: n })}
                      className={`btn ${formData.bhk === n ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        border: formData.bhk === n ? '1px solid var(--teal)' : '1px solid var(--border)',
                        flex: 1,
                        padding: '8px 0'
                      }}
                    >
                      {n === 4 ? '4+' : `${n} BHK`}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="smartnest-label">Area (sq.ft)</label>
                  <input
                    type="number"
                    className="smartnest-input"
                    value={formData.area_sqft}
                    onChange={(e) => setFormData({ ...formData, area_sqft: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="smartnest-label">Bathrooms</label>
                  <input
                    type="number"
                    className="smartnest-input"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="smartnest-label">Covered Parking</label>
                  <select
                    className="smartnest-input"
                    value={formData.parking ? 'yes' : 'no'}
                    onChange={(e) => setFormData({ ...formData, parking: e.target.value === 'yes' })}
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Location */}
            <div className="smartnest-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '16px' }}>
                Location & Coordinates
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <label className="smartnest-label">Street / Area Address</label>
                <input
                  type="text"
                  className="smartnest-input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="smartnest-label">City</label>
                  <input
                    type="text"
                    className="smartnest-input"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="smartnest-label">Latitude (Map)</label>
                  <input
                    type="number"
                    step="0.001"
                    className="smartnest-input"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="smartnest-label">Longitude (Map)</label>
                  <input
                    type="number"
                    step="0.001"
                    className="smartnest-input"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Description */}
            <div className="smartnest-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                  Description
                </h3>
                <span style={{ fontSize: '12px', color: formData.description.length >= 200 ? 'var(--teal)' : 'var(--amber)' }}>
                  {formData.description.length}/200 characters min
                </span>
              </div>
              <textarea
                className="smartnest-input"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            {/* Section 4: Neighbourhood Data */}
            <div className="smartnest-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '16px' }}>
                Neighbourhood & Environmental Data
              </h3>

              {/* School distance slider */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label className="smartnest-label" style={{ margin: 0 }}>School Distance</label>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--teal)' }}>{formData.school_distance_km} km</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="25"
                  step="0.5"
                  value={formData.school_distance_km}
                  onChange={(e) => setFormData({ ...formData, school_distance_km: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--teal)' }}
                />
              </div>

              {/* Hospital distance slider */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label className="smartnest-label" style={{ margin: 0 }}>Hospital Distance</label>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--teal)' }}>{formData.hospital_distance_km} km</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={formData.hospital_distance_km}
                  onChange={(e) => setFormData({ ...formData, hospital_distance_km: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--teal)' }}
                />
              </div>

              {/* Noise Level Toggle: Low / Medium / High */}
              <div style={{ marginBottom: '16px' }}>
                <label className="smartnest-label">Ambient Noise Level</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['low', 'medium', 'high'].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFormData({ ...formData, noise_level: n })}
                      className={`btn ${formData.noise_level === n ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        border: formData.noise_level === n ? '1px solid var(--teal)' : '1px solid var(--border)',
                        flex: 1,
                        textTransform: 'capitalize'
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Green Score Slider (0-100) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <label className="smartnest-label" style={{ margin: 0 }}>Green & Tree Canopy Score</label>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--teal)' }}>{formData.green_score}/100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.green_score}
                  onChange={(e) => setFormData({ ...formData, green_score: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--teal)' }}
                />
              </div>
            </div>

            {/* Section 5: Amenities */}
            <div className="smartnest-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '16px' }}>
                Included Amenities
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
                {AMENITIES_OPTIONS.map((am) => {
                  const active = formData.amenities.includes(am);
                  return (
                    <button
                      key={am}
                      type="button"
                      onClick={() => toggleAmenity(am)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-pill)',
                        border: `1px solid ${active ? 'var(--teal)' : 'var(--border)'}`,
                        backgroundColor: active ? 'var(--teal-light)' : 'var(--white)',
                        color: active ? 'var(--teal)' : 'var(--ink)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <span>{am}</span>
                      {active && <Check size={12} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 6: Image Upload Area */}
            <div className="smartnest-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', marginBottom: '16px' }}>
                Property Photos
              </h3>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleImageMockDrop}
                onClick={handleImageMockDrop}
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: '12px',
                  padding: '32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--mist)'
                }}
              >
                <Upload size={32} color="var(--slate)" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                  Drag and drop listing photos here, or browse
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '4px' }}>
                  Supports JPG, PNG (Max 5 photos, 10MB per file)
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : isEdit ? 'Save Listing Changes' : 'Publish Property'}
            </button>
          </form>

          {/* RIGHT LIVE CARD PREVIEW (STICKY) */}
          <div
            style={{
              position: 'sticky',
              top: '90px'
            }}
          >
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="var(--teal)" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>
                Live Buyer Preview
              </span>
            </div>

            <PropertyCard
              property={previewProperty}
              showCompare={false}
              showSave={false}
            />

            <div style={{ marginTop: '16px', padding: '12px 16px', backgroundColor: 'var(--white)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px', color: 'var(--slate)' }}>
              💡 This preview shows exactly how prospective buyers will see your listing card across lifestyle search rankings.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
