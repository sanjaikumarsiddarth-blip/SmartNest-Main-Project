import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingStages } from '../../components/shared/LoadingStages';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Check,
  Building,
  Car,
  Volume2,
  GraduationCap,
  Trees,
  CheckCircle2,
  Plus,
  Minus
} from 'lucide-react';

const AMENITIES_LIST = [
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

export const LifestyleQuiz = () => {
  const navigate = useNavigate();
  const { sessionId } = useAuth();
  const { addToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Form State - Exactly 5 Steps
  const [formData, setFormData] = useState({
    // Step 1: Basic Requirements
    budget: 5500000, // ₹55L
    city: "Coimbatore",
    property_type: "Apartment", // Apartment | Villa | Independent House
    bhk: 2, // 1 | 2 | 3 | 4
    household_type: "family", // bachelor | couple | family

    // Step 2: Daily Life
    workplace: "Tidel Park / Peelamedu Tech Corridor",
    max_commute: 30, // 10 to 90 min
    commute_mode: "Car", // Car | Metro | Bus | Walk | Bike

    // Step 3: Family & Education
    school_importance: "high", // low | medium | high
    max_school_distance: 2.0, // 0.5 to 25 km
    hospital_importance: "high", // low | medium | high
    family_friendly: true,

    // Step 4: Environment & Wellness
    noise_pref: "quiet", // quiet | moderate | busy
    pollution_sensitivity: "high", // low | medium | high
    green_pref: "high", // low | medium | high
    park_walking: true,

    // Step 5: Amenities
    amenities: ["Supermarket", "School", "Park", "Metro/Bus Stop", "Gym"]
  });

  // Keyboard Navigation: Enter advances, Esc goes back
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && currentStep > 1) {
        setCurrentStep((prev) => prev - 1);
      } else if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        // Prevent default form submit on Enter
        e.preventDefault();
        if (currentStep < 5) {
          setCurrentStep((prev) => prev + 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  // Toggle amenity chip
  const toggleAmenity = (name) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(name);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== name)
          : [...prev.amenities, name]
      };
    });
  };

  // Final Submission from Step 5
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Call analyzeLifestyle then getRecommendations
      await api.analyzeLifestyle({
        ...formData,
        session_id: sessionId
      });

      await api.getRecommendations({
        max_price: formData.budget,
        bhk: [formData.bhk],
        max_commute: formData.max_commute
      });

      addToast({
        type: 'success',
        message: 'Your lifestyle profile has been synthesized and AI agent webhook recorded!'
      });

      // Navigate to /buyer/profile on success
      navigate('/buyer/profile');
    } catch (err) {
      console.error('Quiz submission error:', err);
      const friendlyMsg = err.message || 'Unable to analyze your lifestyle right now.';
      setSubmitError(friendlyMsg);
      addToast({
        type: 'error',
        message: friendlyMsg
      });
      setIsSubmitting(false);
    }
  };

  const progressPct = (currentStep / 5) * 100;

  return (
    <div className="page-entrance" style={{ minHeight: '90vh', paddingBottom: '80px' }}>
      {/* Full-Screen LoadingStages Overlay when processing */}
      {isSubmitting && (
        <LoadingStages
          title="Analyzing Lifestyle Parameters"
          stages={[
            "Understanding your lifestyle...",
            "Analyzing neighborhoods...",
            "Matching properties...",
            "Calculating scores...",
            "Preparing results..."
          ]}
        />
      )}

      {/* Sticky Progress Bar at top */}
      <div
        style={{
          position: 'sticky',
          top: '72px',
          zIndex: 800,
          backgroundColor: 'var(--white)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div className="container-main" style={{ padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--teal)' }}>
              SmartNest Lifestyle Assessment
            </span>
            <span style={{ fontSize: '11px', color: 'var(--slate)' }}>
              (Use Enter ↵ to advance, Esc to go back)
            </span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>
            Step {currentStep} of 5
          </span>
        </div>

        {/* Thin Teal Line Filling Left to Right */}
        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--teal-light)' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPct}%`,
              backgroundColor: 'var(--teal)',
              transition: 'width 300ms ease'
            }}
          />
        </div>
      </div>

      {/* Main Quiz Card Container */}
      <div className="container-main" style={{ maxWidth: '720px', marginTop: '36px' }}>
        <div
          className="smartnest-card"
          style={{
            padding: '40px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* STEP 1: Basic Requirements */}
          {currentStep === 1 && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <span className="badge-pill badge-teal" style={{ marginBottom: '8px' }}>Step 1: Core Foundation</span>
                <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--ink)' }}>
                  Basic Requirements
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--slate)', marginTop: '4px' }}>
                  Let's begin with your target investment size, desired layout, and home typology.
                </p>
              </div>

              {/* Budget: Dual element (Range slider ₹10L to ₹2Cr, step ₹5L + text input synced) */}
              <div style={{ marginBottom: '28px', padding: '20px', backgroundColor: 'var(--mist)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="smartnest-label" style={{ margin: 0, fontWeight: 600 }}>
                    Target Budget
                  </label>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--teal)' }}>
                    ₹{Math.round(formData.budget / 100000)} Lakhs
                  </span>
                </div>

                <input
                  type="range"
                  min="1000000"
                  max="20000000"
                  step="500000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--teal)', cursor: 'pointer', marginBottom: '12px' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--slate)' }}>Manual Input (INR):</span>
                  <input
                    type="number"
                    className="smartnest-input"
                    style={{ width: '160px', padding: '6px 10px', fontSize: '13px' }}
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* City Input */}
              <div style={{ marginBottom: '24px' }}>
                <label className="smartnest-label">City</label>
                <input
                  type="text"
                  className="smartnest-input"
                  placeholder="e.g., Coimbatore"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              {/* Property Type Button Group */}
              <div style={{ marginBottom: '24px' }}>
                <label className="smartnest-label">Property Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  {["Apartment", "Villa", "Independent House"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, property_type: type })}
                      className={`btn ${formData.property_type === type ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        border: formData.property_type === type ? '1px solid var(--teal)' : '1px solid var(--border)',
                        padding: '10px 14px',
                        fontSize: '13px'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* BHK Button Group */}
              <div style={{ marginBottom: '24px' }}>
                <label className="smartnest-label">Bedrooms (BHK)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[1, 2, 3, 4].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setFormData({ ...formData, bhk: n })}
                      className={`btn ${formData.bhk === n ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        border: formData.bhk === n ? '1px solid var(--teal)' : '1px solid var(--border)',
                        width: '60px',
                        padding: '10px 0'
                      }}
                    >
                      {n === 4 ? '4+' : n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Who will be living here? (Bachelor, Couple, Family) */}
              <div>
                <label className="smartnest-label">Who will be living here?</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'bachelor', label: 'Bachelor' },
                    { id: 'couple', label: 'Couple' },
                    { id: 'family', label: 'Family' }
                  ].map((item) => {
                    const isSelected = formData.household_type === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, household_type: item.id })}
                        className={`btn ${isSelected ? 'btn-primary' : 'btn-ghost'}`}
                        style={{
                          border: isSelected ? '1px solid var(--teal)' : '1px solid var(--border)',
                          padding: '10px 20px',
                          fontSize: '14px',
                          fontWeight: isSelected ? 600 : 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {item.label}
                        {isSelected && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Daily Life */}
          {currentStep === 2 && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <span className="badge-pill badge-teal" style={{ marginBottom: '8px' }}>Step 2: Transit & Work</span>
                <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--ink)' }}>
                  Daily Life & Commute
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--slate)', marginTop: '4px' }}>
                  SmartNest calculates real peak-hour transit routes so you never lose hours in traffic.
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="smartnest-label">Primary Workplace or Destination</label>
                <input
                  type="text"
                  className="smartnest-input"
                  placeholder="e.g. Tidel Park, Peelamedu"
                  value={formData.workplace}
                  onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                />
              </div>

              {/* Max Commute Slider (10-90 min) */}
              <div style={{ marginBottom: '28px', padding: '20px', backgroundColor: 'var(--mist)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label className="smartnest-label" style={{ margin: 0, fontWeight: 600 }}>
                    Maximum Tolerable One-Way Commute
                  </label>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--teal)' }}>
                    {formData.max_commute} minutes
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={formData.max_commute}
                  onChange={(e) => setFormData({ ...formData, max_commute: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--teal)', cursor: 'pointer' }}
                />
              </div>

              {/* Commute Mode */}
              <div style={{ marginBottom: '8px' }}>
                <label className="smartnest-label">Preferred Mode of Commute</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '10px' }}>
                  {["Car", "Metro", "Bus", "Walk", "Bike"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFormData({ ...formData, commute_mode: mode })}
                      className={`btn ${formData.commute_mode === mode ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        border: formData.commute_mode === mode ? '1px solid var(--teal)' : '1px solid var(--border)',
                        padding: '10px 8px',
                        fontSize: '13px'
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Family & Education */}
          {currentStep === 3 && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <span className="badge-pill badge-teal" style={{ marginBottom: '8px' }}>Step 3: Family & Education</span>
                <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--ink)' }}>
                  Family & Healthcare Infrastructure
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--slate)', marginTop: '4px' }}>
                  Prioritize proximity to top-tier schools and multi-specialty medical centers.
                </p>
              </div>

              {/* School Importance Toggle */}
              <div style={{ marginBottom: '24px' }}>
                <label className="smartnest-label">School Proximity Importance</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {["low", "medium", "high"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFormData({ ...formData, school_importance: lvl })}
                      className={`btn ${formData.school_importance === lvl ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        border: formData.school_importance === lvl ? '1px solid var(--teal)' : '1px solid var(--border)',
                        flex: 1,
                        textTransform: 'capitalize'
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max School Distance */}
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--mist)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="smartnest-label" style={{ margin: 0 }}>Max Distance to School</label>
                  <span style={{ fontWeight: 600, color: 'var(--teal)' }}>{formData.max_school_distance} km</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="25.0"
                  step="0.5"
                  value={formData.max_school_distance}
                  onChange={(e) => setFormData({ ...formData, max_school_distance: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--teal)', cursor: 'pointer' }}
                />
              </div>

              {/* Hospital Importance Toggle */}
              <div style={{ marginBottom: '24px' }}>
                <label className="smartnest-label">Hospital & Specialty Clinic Importance</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {["low", "medium", "high"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFormData({ ...formData, hospital_importance: lvl })}
                      className={`btn ${formData.hospital_importance === lvl ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        border: formData.hospital_importance === lvl ? '1px solid var(--teal)' : '1px solid var(--border)',
                        flex: 1,
                        textTransform: 'capitalize'
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Family Friendly Neighborhood Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>Family-Friendly Neighborhood Requirement</div>
                  <div style={{ fontSize: '12px', color: 'var(--slate)' }}>Prefers secured gates, play areas, and low traffic cul-de-sacs.</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.family_friendly}
                  onChange={(e) => setFormData({ ...formData, family_friendly: e.target.checked })}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--teal)', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {/* STEP 4: Environment & Wellness */}
          {currentStep === 4 && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <span className="badge-pill badge-teal" style={{ marginBottom: '8px' }}>Step 4: Wellness & Acoustics</span>
                <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--ink)' }}>
                  Environment & Wellness
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--slate)', marginTop: '4px' }}>
                  SmartNest evaluates ambient decibels and air canopy metrics for long-term health.
                </p>
              </div>

              {/* Noise Preference 3-way toggle Quiet | Moderate | Busy */}
              <div style={{ marginBottom: '24px' }}>
                <label className="smartnest-label">Acoustic Noise Preference</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {["quiet", "moderate", "busy"].map((noise) => (
                    <button
                      key={noise}
                      type="button"
                      onClick={() => setFormData({ ...formData, noise_pref: noise })}
                      className={`btn ${formData.noise_pref === noise ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        border: formData.noise_pref === noise ? '1px solid var(--teal)' : '1px solid var(--border)',
                        flex: 1,
                        textTransform: 'capitalize'
                      }}
                    >
                      {noise === 'quiet' ? 'Quiet Zone' : noise === 'moderate' ? 'Moderate' : 'Busy Corridor'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pollution Sensitivity */}
              <div style={{ marginBottom: '24px' }}>
                <label className="smartnest-label">Pollution & Dust Sensitivity</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {["low", "medium", "high"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFormData({ ...formData, pollution_sensitivity: lvl })}
                      className={`btn ${formData.pollution_sensitivity === lvl ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        border: formData.pollution_sensitivity === lvl ? '1px solid var(--teal)' : '1px solid var(--border)',
                        flex: 1,
                        textTransform: 'capitalize'
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Green Space Preference */}
              <div style={{ marginBottom: '24px' }}>
                <label className="smartnest-label">Green Space & Tree Canopy Preference</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {["low", "medium", "high"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFormData({ ...formData, green_pref: lvl })}
                      className={`btn ${formData.green_pref === lvl ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        border: formData.green_pref === lvl ? '1px solid var(--teal)' : '1px solid var(--border)',
                        flex: 1,
                        textTransform: 'capitalize'
                      }}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Park within walking distance Yes/No */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--ink)' }}>Public Park within 500m Walking Distance</div>
                  <div style={{ fontSize: '12px', color: 'var(--slate)' }}>Prioritizes properties with pedestrian morning walking track access.</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.park_walking}
                  onChange={(e) => setFormData({ ...formData, park_walking: e.target.checked })}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--teal)', cursor: 'pointer' }}
                />
              </div>
            </div>
          )}

          {/* STEP 5: Amenities (12-item chip grid) */}
          {currentStep === 5 && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <span className="badge-pill badge-teal" style={{ marginBottom: '8px' }}>Step 5: Daily Convenience</span>
                <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--ink)' }}>
                  Essential Amenities
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--slate)', marginTop: '4px' }}>
                  Tap the amenities you expect either on-premise or within direct walking reach.
                </p>
              </div>

              {/* 12-item chip grid (multi-select, teal when selected) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                  gap: '12px'
                }}
              >
                {AMENITIES_LIST.map((item) => {
                  const selected = formData.amenities.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleAmenity(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-pill)',
                        border: `1.5px solid ${selected ? 'var(--teal)' : 'var(--border)'}`,
                        backgroundColor: selected ? 'var(--teal-light)' : 'var(--white)',
                        color: selected ? 'var(--teal)' : 'var(--ink)',
                        fontSize: '13px',
                        fontWeight: selected ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <span>{item}</span>
                      {selected && <Check size={16} strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>

              {submitError && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '14px 18px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: '#991B1B' }}>
                      Workflow Request Notice
                    </div>
                    <div style={{ fontSize: '12px', color: '#B91C1C', marginTop: '2px' }}>
                      {submitError}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn btn-sm btn-primary"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls Footer */}
          <div
            style={{
              marginTop: '40px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="btn btn-ghost"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 28px' }}
              >
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{
                  padding: '12px 32px',
                  fontSize: '15px',
                  opacity: isSubmitting ? 0.75 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Analyzing & Triggering Agent...' : 'Analyze My Lifestyle'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
