import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { PropertyCard } from '../../components/shared/PropertyCard';
import { UpgradeModal } from '../../components/subscription/UpgradeModal';
import {
  Building,
  Upload,
  Image as ImageIcon,
  Check,
  MapPin,
  Sparkles,
  ArrowLeft,
  Trash2,
  X,
  AlertCircle
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

// Helper to downscale/compress image file to keep localStorage well within quota
const compressImageFile = (file, maxWidth = 900, maxHeight = 700, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export const AddEditPropertyPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { subscription, usage, canCreateProperty } = useSubscription();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [existingProperty, setExistingProperty] = useState(null);

  const [formData, setFormData] = useState({
    title: 'Emerald Palms Executive Suite',
    type: 'Apartment',
    price: 5800000,
    bhk: 2,
    bedrooms: 2,
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
            setExistingProperty(p);
            setFormData({
              title: p.title || '',
              type: p.type || 'Apartment',
              price: p.price || 5000000,
              bhk: p.bhk || 2,
              bedrooms: p.bhk || 2,
              parking: p.parking !== undefined ? Boolean(p.parking) : true,
              address: p.location || p.address || '',
              city: p.city || 'Coimbatore',
              lat: p.coordinates?.lat || 11.016,
              lng: p.coordinates?.lng || 76.955,
              description: p.description || '',
              school_distance_km: p.school_distance_km || 1.5,
              hospital_distance_km: p.hospital_distance_km || 2.0,
              park_distance_km: p.park_distance_km || 0.5,
              noise_level: p.noise_level || 'low',
              green_score: p.green_score || 85,
              amenities: p.amenities || ['Supermarket', 'School', 'Park', 'Parking'],
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

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    const validFiles = [];

    for (const file of fileArray) {
      const isValidType = file.type === 'image/jpeg' || file.type === 'image/png' || file.name?.match(/\.(jpe?g|png)$/i);
      if (!isValidType) {
        addToast({ type: 'error', message: `${file.name} is not a valid JPG or PNG image.` });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        addToast({ type: 'error', message: `${file.name} exceeds the 10MB limit.` });
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const currentImages = formData.images || [];
    const availableSlots = 5 - currentImages.length;

    if (availableSlots <= 0) {
      addToast({ type: 'warning', message: 'Maximum 5 photos allowed. Remove a photo to upload new ones.' });
      return;
    }

    const filesToProcess = validFiles.slice(0, availableSlots);
    if (validFiles.length > availableSlots) {
      addToast({ type: 'warning', message: `Only ${availableSlots} more photo${availableSlots > 1 ? 's' : ''} can be added (max 5 photos).` });
    }

    try {
      const compressedPromises = filesToProcess.map((f) => compressImageFile(f));
      const newImages = await Promise.all(compressedPromises);

      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
      addToast({ type: 'success', message: `Added ${newImages.length} listing photo${newImages.length > 1 ? 's' : ''}.` });
    } catch (err) {
      console.error('Error processing listing photos', err);
      addToast({ type: 'error', message: 'Could not process one or more images.' });
    }
  };

  const handleFileSelect = (e) => {
    handleFiles(e.target.files);
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== indexToRemove)
    }));
    addToast({ type: 'info', message: 'Photo removed.' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!isEdit && !canCreateProperty()) {
      setShowUpgradeModal(true);
      addToast({
        type: 'warning',
        message: `Plan limit reached (${usage?.properties_published || 0}/${usage?.property_limit || 1} properties). Please upgrade to publish more.`
      });
      return;
    }

    if (!formData.title || !formData.title.trim()) {
      addToast({ type: 'error', message: 'Please enter a property title.' });
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      addToast({ type: 'error', message: 'Please enter a valid property price.' });
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        const updatePayload = {
          ...formData,
          ...(existingProperty?.area_sqft !== undefined ? { area_sqft: existingProperty.area_sqft } : {}),
          ...(existingProperty?.bathrooms !== undefined ? { bathrooms: existingProperty.bathrooms } : {})
        };
        await api.updateProperty(id, updatePayload);
        addToast({ type: 'success', message: 'Property listing updated successfully.' });
      } else {
        const realUserId = user?.user_id || user?.id || (typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('smartnest_user') || '{}')?.user_id || JSON.parse(localStorage.getItem('smartnest_user') || '{}')?.id : '') || '';
        const realUserName = user?.name || user?.user_metadata?.full_name || (typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('smartnest_user') || '{}')?.name : '') || 'Seller';
        const realSessionId = user?.session_id || (typeof localStorage !== 'undefined' ? localStorage.getItem('smartnest_session_id') : '') || '';

        const createPayload = {
          ...formData,
          seller_id: realUserId,
          user_id: realUserId,
          seller_name: realUserName,
          user_name: realUserName,
          session_id: realSessionId
        };
        await api.createSellerProperty(createPayload);
        await api.getSellerProperties(realUserId || user?.user_id);
        addToast({ type: 'success', message: 'Property published successfully.' });
      }
      navigate('/seller/properties');
    } catch (err) {
      console.error('Failed to publish/save property:', err);
      if (err.message && err.message.includes('limit')) {
        setShowUpgradeModal(true);
        addToast({ type: 'warning', message: err.message });
      } else {
        addToast({ type: 'error', message: err.message || 'Unable to publish property. Please try again.' });
      }
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
    area_sqft: existingProperty?.area_sqft || undefined,
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

        {/* Property Limit Reached Warning Banner */}
        {!isEdit && !canCreateProperty() && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '16px 20px',
              borderRadius: '12px',
              backgroundColor: '#FEF3C7',
              border: '1px solid #F59E0B',
              color: '#92400E',
              marginBottom: '28px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={24} color="#D97706" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>
                  Property Listing Limit Reached ({usage?.properties_published || 0} / {usage?.property_limit || 1})
                </div>
                <div style={{ fontSize: '13px', color: '#B45309' }}>
                  Your current {subscription?.plan_name || 'Free'} plan allows up to {usage?.property_limit || 1} listing{usage?.property_limit === 1 ? '' : 's'}. Upgrade your subscription to publish additional properties.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowUpgradeModal(true)}
              className="btn btn-primary"
              style={{
                whiteSpace: 'nowrap',
                backgroundColor: '#D97706',
                borderColor: '#D97706',
                padding: '8px 18px',
                fontSize: '13px'
              }}
            >
              Upgrade Plan
            </button>
          </div>
        )}

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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
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
                      onClick={() => setFormData((prev) => ({ ...prev, bhk: n, bedrooms: n }))}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
                  Property Photos
                </h3>
                <span style={{ fontSize: '12px', fontWeight: 600, color: (formData.images?.length || 0) >= 5 ? 'var(--teal)' : 'var(--slate)' }}>
                  {formData.images?.length || 0} / 5 photos
                </span>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                aria-label="Upload property listing photos"
              />

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                  if (e.dataTransfer?.files) {
                    handleFiles(e.dataTransfer.files);
                  }
                }}
                onClick={() => {
                  if ((formData.images?.length || 0) >= 5) {
                    addToast({ type: 'warning', message: 'Maximum 5 photos reached. Remove a photo to upload more.' });
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                style={{
                  border: isDragging ? '2px dashed var(--teal)' : '2px dashed var(--border)',
                  borderRadius: '12px',
                  padding: '32px',
                  textAlign: 'center',
                  cursor: (formData.images?.length || 0) >= 5 ? 'not-allowed' : 'pointer',
                  backgroundColor: isDragging ? 'var(--teal-light)' : 'var(--mist)',
                  transition: 'all var(--transition-fast)'
                }}
                role="button"
                tabIndex={0}
                aria-label="Upload photos area"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if ((formData.images?.length || 0) >= 5) {
                      addToast({ type: 'warning', message: 'Maximum 5 photos reached. Remove a photo to upload more.' });
                    } else {
                      fileInputRef.current?.click();
                    }
                  }
                }}
              >
                {(formData.images?.length || 0) >= 5 ? (
                  <>
                    <Check size={32} color="var(--teal)" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                      Maximum 5 photos uploaded
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '4px' }}>
                      Remove an existing photo below if you want to upload a different one.
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={32} color={isDragging ? 'var(--teal)' : 'var(--slate)'} style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                      {isDragging ? 'Drop photos here' : 'Drag and drop listing photos here, or browse'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '4px' }}>
                      Supports JPG, PNG (Max 5 photos, 10MB per file)
                    </div>
                  </>
                )}
              </div>

              {/* Uploaded Photo Preview Gallery */}
              {formData.images && formData.images.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                      Current Photos ({formData.images.length} / 5)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, images: [] }));
                        addToast({ type: 'info', message: 'All photos removed.' });
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--rose)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={12} /> Clear all
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                      gap: '12px'
                    }}
                  >
                    {formData.images.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: 'relative',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          aspectRatio: '4 / 3',
                          border: idx === 0 ? '2px solid var(--teal)' : '1px solid var(--border)',
                          backgroundColor: 'var(--mist)',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={`Listing photo ${idx + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {idx === 0 && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '6px',
                              left: '6px',
                              backgroundColor: 'var(--teal)',
                              color: '#FFFFFF',
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              lineHeight: 1
                            }}
                          >
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(13, 27, 42, 0.75)',
                            color: '#FFFFFF',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease'
                          }}
                          title="Remove photo"
                          aria-label={`Remove photo ${idx + 1}`}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--rose)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(13, 27, 42, 0.75)'; }}
                        >
                          <X size={14} />
                        </button>
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '4px',
                            right: '6px',
                            backgroundColor: 'rgba(0, 0, 0, 0.55)',
                            color: '#FFFFFF',
                            fontSize: '10px',
                            fontWeight: 600,
                            padding: '1px 5px',
                            borderRadius: '4px'
                          }}
                        >
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
              disabled={submitting}
            >
              {submitting ? (isEdit ? 'Saving Changes...' : 'Publishing Property...') : isEdit ? 'Save Listing Changes' : 'Publish Property'}
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

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          limitType="properties"
          currentPlan={subscription?.plan_id || 'seller_free'}
          userRole="seller"
          usage={usage}
        />
      </div>
    </div>
  );
};
