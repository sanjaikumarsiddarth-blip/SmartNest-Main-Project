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
  GripVertical,
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

const INITIAL_PRIORITIES = [
  { id: "commute", label: "Commute Time" },
  { id: "budget", label: "Budget Ceiling" },
  { id: "schools", label: "School Proximity" },
  { id: "healthcare", label: "Healthcare Facilities" },
  { id: "noise", label: "Acoustic Serenity (Low Noise)" },
  { id: "safety", label: "Neighborhood Safety" },
  { id: "parks", label: "Green Space & Parks" },
  { id: "amenities", label: "Clubhouse & Lifestyle Amenities" }
];

export const LifestyleQuiz = () => {
  const navigate = useNavigate();
  const { sessionId } = useAuth();
  const { addToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Basic Requirements
    budget: 5500000, // ₹55L
    city: "Coimbatore",
    property_type: "Apartment", // Apartment | Villa | Independent House | Plot
    bhk: 2, // 1 | 2 | 3 | 4
    family_size: 3,

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
    amenities: ["Supermarket", "School", "Park", "Metro/Bus Stop", "Gym"],

    // Step 6: Lifestyle Priorities (Ordered list)
    priorities: INITIAL_PRIORITIES,

    // Step 7: Dealbreakers (5 toggle cards)
    dealbreakers: {
      commute_toggle: true,
      commute_limit: 30,
      budget_toggle: true,
      budget_limit: 60, // in Lakhs
      bhk_toggle: true,
      bhk_min: 2,
      noise_low: true,
      school_toggle: true,
      school_dist: 2.5
    }
  });

  // Keyboard Navigation: Enter advances, Esc goes back
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && currentStep > 1) {
        setCurrentStep((prev) => prev - 1);
      } else if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        // Prevent default form submit on Enter
        e.preventDefault();
        if (currentStep < 7) {
          setCurrentStep((prev) => prev + 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  // Drag and Drop Ranking handlers for Step 6
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (idx) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;

    const items = [...formData.priorities];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(idx, 0, draggedItem);
    setDraggedIndex(idx);
    setFormData((prev) => ({ ...prev, priorities: items }));
  };

  const handleMoveRank = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= formData.priorities.length) return;
    const items = [...formData.priorities];
    const temp = items[idx];
    items[idx] = items[targetIdx];
    items[targetIdx] = temp;
    setFormData((prev) => ({ ...prev, priorities: items }));
  };

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

  // Final Submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Call analyzeLifestyle then getRecommendations as per prompt
      const profile = await api.analyzeLifestyle({
        ...formData,
        priorities: formData.priorities.map((p) => p.id),
        session_id: sessionId
      });

      await api.getRecommendations({
        max_price: formData.budget,
        bhk: [formData.bhk],
        max_commute: formData.max_commute
      });

      addToast({
        type: 'success',
        message: 'Your lifestyle profile has been synthesized!'
      });

      // Navigate to /buyer/profile on success
      navigate('/buyer/profile');
    } catch (err) {
      addToast({
        type: 'error',
        message: err.message || 'Analysis could not be completed.'
      });
      setIsSubmitting(false);
    }
  };

  const progressPct = (currentStep / 7) * 100;

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
            Step {currentStep} of 7
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
                  {["Apartment", "Villa", "Independent House", "Plot"].map((type) => (
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

              {/* Family Size Stepper (1-10) */}
              <div>
                <label className="smartnest-label">Family Size (Occupants)</label>
                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, family_size: Math.max(1, formData.family_size - 1) })}
                    style={{ padding: '8px 16px', background: 'var(--mist)', border: 'none', cursor: 'pointer' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ padding: '8px 24px', fontWeight: 600, fontSize: '15px' }}>
                    {formData.family_size}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, family_size: Math.min(10, formData.family_size + 1) })}
                    style={{ padding: '8px 16px', background: 'var(--mist)', border: 'none', cursor: 'pointer' }}
                  >
                    <Plus size={14} />
                  </button>
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
            </div>
          )}

          {/* STEP 6: Lifestyle Priorities (Drag-and-drop ranked list) */}
          {currentStep === 6 && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <span className="badge-pill badge-teal" style={{ marginBottom: '8px' }}>Step 6: Priority Hierarchy</span>
                <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--ink)' }}>
                  Lifestyle Priorities
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--slate)', marginTop: '4px' }}>
                  Drag to rank — most important at the top. (Or use the arrow controls on the right).
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {formData.priorities.map((item, idx) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: idx === 0 ? 'var(--teal-light)' : 'var(--white)',
                      border: `1px solid ${idx === 0 ? 'var(--teal)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-sm)',
                      cursor: 'grab'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <GripVertical size={18} color="var(--slate)" />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                        {item.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Keyboard / accessible shift buttons */}
                      <button
                        type="button"
                        onClick={() => handleMoveRank(idx, -1)}
                        disabled={idx === 0}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: idx === 0 ? 0.3 : 1 }}
                        aria-label="Move item up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveRank(idx, 1)}
                        disabled={idx === formData.priorities.length - 1}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: idx === formData.priorities.length - 1 ? 0.3 : 1 }}
                        aria-label="Move item down"
                      >
                        ↓
                      </button>

                      {/* Rank Number Badge */}
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: idx === 0 ? 'var(--teal)' : 'var(--mist)',
                          color: idx === 0 ? '#FFFFFF' : 'var(--slate)',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        #{idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: Dealbreakers (5 toggle cards) */}
          {currentStep === 7 && (
            <div>
              <div style={{ marginBottom: '28px' }}>
                <span className="badge-pill badge-rose" style={{ marginBottom: '8px' }}>Step 7: Non-Negotiables</span>
                <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--ink)' }}>
                  Dealbreakers
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--slate)', marginTop: '4px' }}>
                  Properties violating these conditions will be flagged with dealbreaker alerts or filtered out.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. Commute under X min */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: formData.dealbreakers.commute_toggle ? '#FFFDF8' : 'var(--white)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={formData.dealbreakers.commute_toggle}
                        onChange={(e) => setFormData({
                          ...formData,
                          dealbreakers: { ...formData.dealbreakers, commute_toggle: e.target.checked }
                        })}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--rose)' }}
                      />
                      Commute must be strictly under:
                    </label>

                    {formData.dealbreakers.commute_toggle && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          className="smartnest-input"
                          style={{ width: '80px', padding: '6px 8px' }}
                          value={formData.dealbreakers.commute_limit}
                          onChange={(e) => setFormData({
                            ...formData,
                            dealbreakers: { ...formData.dealbreakers, commute_limit: Number(e.target.value) }
                          })}
                        />
                        <span style={{ fontSize: '13px', color: 'var(--slate)' }}>minutes</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Budget cannot exceed ₹X Lakhs */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: formData.dealbreakers.budget_toggle ? '#FFFDF8' : 'var(--white)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={formData.dealbreakers.budget_toggle}
                        onChange={(e) => setFormData({
                          ...formData,
                          dealbreakers: { ...formData.dealbreakers, budget_toggle: e.target.checked }
                        })}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--rose)' }}
                      />
                      Budget cannot exceed:
                    </label>

                    {formData.dealbreakers.budget_toggle && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--slate)' }}>₹</span>
                        <input
                          type="number"
                          className="smartnest-input"
                          style={{ width: '90px', padding: '6px 8px' }}
                          value={formData.dealbreakers.budget_limit}
                          onChange={(e) => setFormData({
                            ...formData,
                            dealbreakers: { ...formData.dealbreakers, budget_limit: Number(e.target.value) }
                          })}
                        />
                        <span style={{ fontSize: '13px', color: 'var(--slate)' }}>Lakhs</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Must have at least X BHK */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: formData.dealbreakers.bhk_toggle ? '#FFFDF8' : 'var(--white)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={formData.dealbreakers.bhk_toggle}
                        onChange={(e) => setFormData({
                          ...formData,
                          dealbreakers: { ...formData.dealbreakers, bhk_toggle: e.target.checked }
                        })}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--rose)' }}
                      />
                      Must have at least:
                    </label>

                    {formData.dealbreakers.bhk_toggle && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          className="smartnest-input"
                          style={{ width: '70px', padding: '6px 8px' }}
                          value={formData.dealbreakers.bhk_min}
                          onChange={(e) => setFormData({
                            ...formData,
                            dealbreakers: { ...formData.dealbreakers, bhk_min: Number(e.target.value) }
                          })}
                        />
                        <span style={{ fontSize: '13px', color: 'var(--slate)' }}>BHK</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Noise level must be low (toggle only) */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: formData.dealbreakers.noise_low ? '#FFFDF8' : 'var(--white)'
                  }}
                >
                  <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={formData.dealbreakers.noise_low}
                      onChange={(e) => setFormData({
                        ...formData,
                        dealbreakers: { ...formData.dealbreakers, noise_low: e.target.checked }
                      })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--rose)' }}
                    />
                    Noise level must be strictly low (No commercial thoroughfares)
                  </label>
                </div>

                {/* 5. School must be within X km */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    backgroundColor: formData.dealbreakers.school_toggle ? '#FFFDF8' : 'var(--white)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={formData.dealbreakers.school_toggle}
                        onChange={(e) => setFormData({
                          ...formData,
                          dealbreakers: { ...formData.dealbreakers, school_toggle: e.target.checked }
                        })}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--rose)' }}
                      />
                      Accredited school must be within:
                    </label>

                    {formData.dealbreakers.school_toggle && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          step="0.5"
                          className="smartnest-input"
                          style={{ width: '80px', padding: '6px 8px' }}
                          value={formData.dealbreakers.school_dist}
                          onChange={(e) => setFormData({
                            ...formData,
                            dealbreakers: { ...formData.dealbreakers, school_dist: Number(e.target.value) }
                          })}
                        />
                        <span style={{ fontSize: '13px', color: 'var(--slate)' }}>km</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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

            {currentStep < 7 ? (
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
                className="btn btn-primary"
                style={{ padding: '12px 32px', fontSize: '15px' }}
              >
                Analyze My Lifestyle
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
