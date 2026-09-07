import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PropertyCard, formatPriceINR } from '../../components/shared/PropertyCard';
import { SkeletonCard } from '../../components/shared/SkeletonCard';
import { EmptyState } from '../../components/shared/EmptyState';
import {
  SlidersHorizontal,
  X,
  Scale,
  Sparkles,
  ArrowUpDown,
  Filter,
  Check
} from 'lucide-react';

export const RecommendationsPage = () => {
  const { sessionId } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [totalMatched, setTotalMatched] = useState(0);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Filter & Sort State (sent to backend API)
  const [sortBy, setSortBy] = useState('match'); // 'match' | 'price_asc' | 'price_desc' | 'commute'
  const [filters, setFilters] = useState({
    max_price: 10000000, // ₹1 Cr
    bhk: [], // [1, 2, 3, 4]
    noise: 'all', // 'all' | 'low' | 'medium' | 'high'
    min_green_score: 0,
    max_commute: 90
  });

  const [savedIds, setSavedIds] = useState([]);
  const [compareList, setCompareList] = useState([]); // Array of property objects for compare bar

  // Zero business logic in frontend: getRecommendations handles filtering & ranking on backend
  const fetchRecommendations = useCallback(async (currentFilters, currentSort) => {
    setLoading(true);
    try {
      const res = await api.getRecommendations({
        ...currentFilters,
        sort_by: currentSort
      });
      setProperties(res.properties);
      setTotalMatched(res.total_matched);
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to fetch recommendations.' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchRecommendations(filters, sortBy);
  }, [fetchRecommendations, filters, sortBy]);

  // Load saved shortlist on mount
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const saved = await api.getSavedProperties(sessionId);
        setSavedIds(saved.properties.map((p) => p.property_id));
      } catch (e) {}
    };
    loadSaved();
  }, [sessionId]);

  const handleSaveToggle = async (propId) => {
    try {
      if (savedIds.includes(propId)) {
        await api.removeSavedProperty(propId, sessionId);
        setSavedIds((prev) => prev.filter((id) => id !== propId));
        addToast({ type: 'info', message: 'Removed from saved shortlist.' });
      } else {
        await api.saveProperty(propId, sessionId);
        setSavedIds((prev) => [...prev, propId]);
        addToast({ type: 'success', message: 'Property saved to your shortlist!' });
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Error saving property.' });
    }
  };

  const handleCompareToggle = (propId) => {
    const isAlready = compareList.some((p) => p.property_id === propId);
    if (isAlready) {
      setCompareList((prev) => prev.filter((p) => p.property_id !== propId));
      addToast({ type: 'info', message: 'Removed from comparison list.' });
    } else {
      if (compareList.length >= 3) {
        addToast({ type: 'warning', message: 'You can compare up to 3 properties.' });
        return;
      }
      const propToAdd = properties.find((p) => p.property_id === propId);
      if (propToAdd) {
        setCompareList((prev) => [...prev, propToAdd]);
        addToast({ type: 'success', message: 'Added to comparison list.' });
      }
    }
  };

  const toggleBhkFilter = (bhkVal) => {
    setFilters((prev) => {
      const exists = prev.bhk.includes(bhkVal);
      return {
        ...prev,
        bhk: exists ? prev.bhk.filter((b) => b !== bhkVal) : [...prev.bhk, bhkVal]
      };
    });
  };

  // Recovery Buttons for Empty State
  const recoveryActions = [
    {
      label: "Increase Budget by 10%",
      onClick: () => {
        setFilters((prev) => ({ ...prev, max_price: Math.round(prev.max_price * 1.1) }));
        addToast({ type: 'info', message: 'Adjusted budget ceiling +10%.' });
      }
    },
    {
      label: "Expand Location",
      onClick: () => {
        setFilters((prev) => ({ ...prev, noise: 'all' }));
        addToast({ type: 'info', message: 'Relaxed acoustic and neighborhood criteria.' });
      }
    },
    {
      label: "Increase Commute Limit",
      onClick: () => {
        setFilters((prev) => ({ ...prev, max_commute: Math.min(90, prev.max_commute + 15) }));
        addToast({ type: 'info', message: 'Extended maximum commute threshold.' });
      }
    },
    {
      label: "Show Closest Matches",
      onClick: () => {
        setFilters({
          max_price: 10000000,
          bhk: [],
          noise: 'all',
          min_green_score: 0,
          max_commute: 90
        });
        addToast({ type: 'info', message: 'Reset all active filters.' });
      }
    }
  ];

  return (
    <div className="page-entrance" style={{ padding: '40px 0 100px 0' }}>
      <div className="container-main">
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <h1 className="font-display" style={{ fontSize: '32px', color: 'var(--ink)', marginBottom: '6px' }}>
              Your SmartNest Matches
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--slate)' }}>
              {totalMatched} properties matched to your lifestyle priorities
            </p>
          </div>

          {/* Toolbar: Sort + Filter Trigger */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <ArrowUpDown size={15} color="var(--slate)" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="smartnest-input"
                style={{ paddingLeft: '34px', width: '200px', cursor: 'pointer' }}
                aria-label="Sort properties"
              >
                <option value="match">Sort: Best Match</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="commute">Shortest Commute</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setFilterDrawerOpen(true)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>
        </div>

        {/* ── 3-COLUMN PROPERTY GRID ──────────────────────────── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : properties.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            {properties.map((prop) => (
              <PropertyCard
                key={prop.property_id}
                property={prop}
                showCompare={true}
                showSave={true}
                isComparing={compareList.some((p) => p.property_id === prop.property_id)}
                isSaved={savedIds.includes(prop.property_id)}
                onCompare={handleCompareToggle}
                onSave={handleSaveToggle}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Filter}
            heading="No properties match your active criteria"
            subtext="Your current budget, commute, or layout constraints returned 0 listings. Use the automated recovery options below to broaden your match scope:"
            recoveryButtons={recoveryActions}
          />
        )}
      </div>

      {/* ── STICKY BOTTOM COMPARE BAR ───────────────────────── */}
      {compareList.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--ink)',
            color: '#FFFFFF',
            padding: '14px 24px',
            borderRadius: 'var(--radius-pill)',
            boxShadow: '0 12px 36px rgba(13, 27, 42, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            zIndex: 9000,
            animation: 'fadeUpPage 250ms ease-out',
            maxWidth: '90vw'
          }}
        >
          {/* Thumbnails of selected */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {compareList.map((item) => (
              <div
                key={item.property_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)'
                }}
              >
                <img
                  src={item.images?.[0]}
                  alt={item.title}
                  style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFFFFF', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title}
                </span>
                <button
                  type="button"
                  onClick={() => handleCompareToggle(item.property_id)}
                  style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer', padding: 0 }}
                  aria-label="Remove item"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          <span style={{ fontSize: '13px', color: '#94A3B8' }}>
            {compareList.length}/3 selected
          </span>

          <button
            type="button"
            onClick={() => navigate(`/buyer/compare?ids=${compareList.map((p) => p.property_id).join(',')}`)}
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: '13px' }}
          >
            Compare Now
          </button>
        </div>
      )}

      {/* ── FILTER DRAWER (RIGHT SIDEBAR) ────────────────────── */}
      {filterDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9500,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          {/* Backdrop overlay */}
          <div
            onClick={() => setFilterDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(13, 27, 42, 0.5)',
              backdropFilter: 'blur(2px)'
            }}
          />

          {/* Drawer Panel */}
          <div
            className="smartnest-card"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '380px',
              height: '100%',
              borderRadius: 0,
              borderLeft: '1px solid var(--border)',
              padding: '28px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9600,
              animation: 'fadeUpPage 250ms ease-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
                Filter Properties
              </h3>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)' }}
                aria-label="Close filter drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Price Ceiling Slider */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="smartnest-label" style={{ margin: 0 }}>Max Budget</label>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--teal)' }}>
                  {formatPriceINR(filters.max_price)}
                </span>
              </div>
              <input
                type="range"
                min="3000000"
                max="10000000"
                step="500000"
                value={filters.max_price}
                onChange={(e) => setFilters({ ...filters, max_price: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--teal)' }}
              />
            </div>

            {/* BHK Checkboxes */}
            <div style={{ marginBottom: '24px' }}>
              <label className="smartnest-label">Bedrooms (BHK)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4].map((n) => {
                  const active = filters.bhk.includes(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggleBhkFilter(n)}
                      className={`btn ${active ? 'btn-primary' : 'btn-ghost'}`}
                      style={{
                        border: active ? '1px solid var(--teal)' : '1px solid var(--border)',
                        flex: 1,
                        padding: '8px 0'
                      }}
                    >
                      {n === 4 ? '4+' : `${n} BHK`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Noise Level Select */}
            <div style={{ marginBottom: '24px' }}>
              <label className="smartnest-label">Acoustic Noise Level</label>
              <select
                className="smartnest-input"
                value={filters.noise}
                onChange={(e) => setFilters({ ...filters, noise: e.target.value })}
              >
                <option value="all">All Sound Levels</option>
                <option value="low">Quiet Zone (Low Decibels)</option>
                <option value="medium">Moderate Residential</option>
                <option value="high">Active Commercial</option>
              </select>
            </div>

            {/* Min Green Score */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="smartnest-label" style={{ margin: 0 }}>Minimum Green Score</label>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--teal)' }}>
                  {filters.min_green_score}+
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={filters.min_green_score}
                onChange={(e) => setFilters({ ...filters, min_green_score: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--teal)' }}
              />
            </div>

            {/* Max Commute Slider */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label className="smartnest-label" style={{ margin: 0 }}>Max Commute Time</label>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--teal)' }}>
                  {filters.max_commute} min
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={filters.max_commute}
                onChange={(e) => setFilters({ ...filters, max_commute: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--teal)' }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ flex: 1 }}
                onClick={() => {
                  setFilters({
                    max_price: 10000000,
                    bhk: [],
                    noise: 'all',
                    min_green_score: 0,
                    max_commute: 90
                  });
                }}
              >
                Reset
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={() => setFilterDrawerOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
