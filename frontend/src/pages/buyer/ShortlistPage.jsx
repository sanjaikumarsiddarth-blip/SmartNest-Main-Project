import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useCompare } from '../../context/CompareContext';
import { PropertyCard } from '../../components/shared/PropertyCard';
import { EmptyState } from '../../components/shared/EmptyState';
import { SkeletonCard } from '../../components/shared/SkeletonCard';
import { Heart, Scale } from 'lucide-react';

export const ShortlistPage = () => {
  const { sessionId } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { selectedPropertyIds, toggleCompare, isInCompare } = useCompare();

  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await api.getSavedProperties(sessionId);
      setSavedProperties(res.properties);
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to fetch saved properties.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [sessionId]);

  const handleRemove = async (propId) => {
    try {
      await api.removeSavedProperty(propId, sessionId);
      setSavedProperties((prev) => prev.filter((p) => p.property_id !== propId));
      addToast({ type: 'info', message: 'Property removed from shortlist.' });
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to remove property.' });
    }
  };

  return (
    <div className="page-entrance" style={{ padding: '40px 0 100px 0' }}>
      <div className="container-main">
        <div style={{ marginBottom: '32px' }}>
          <h1 className="font-display" style={{ fontSize: '32px', color: 'var(--ink)', marginBottom: '6px' }}>
            Saved Properties
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--slate)' }}>
            Your curated collection of high-affinity lifestyle matches
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : savedProperties.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
            {savedProperties.map((prop) => (
              <PropertyCard
                key={prop.property_id}
                property={prop}
                showCompare={true}
                showSave={true}
                isComparing={isInCompare(prop.property_id)}
                isSaved={true}
                onCompare={() => toggleCompare(prop)}
                onSave={handleRemove}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            heading="No saved properties yet"
            subtext="When exploring recommended homes, tap the heart icon on any listing to build your private shortlist."
            actionText="Find My Home"
            onAction={() => navigate('/buyer/recommendations')}
          />
        )}
      </div>

      {/* Sticky Compare Bar when properties are selected */}
      {selectedPropertyIds.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--ink)',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: 'var(--radius-pill)',
            boxShadow: '0 10px 30px rgba(13, 27, 42, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            zIndex: 9000
          }}
        >
          <Scale size={16} color="var(--teal)" />
          <span style={{ fontSize: '14px', fontWeight: 600 }}>
            {selectedPropertyIds.length} properties selected
          </span>
          <button
            onClick={() => navigate(`/buyer/compare?ids=${selectedPropertyIds.join(',')}`)}
            className="btn btn-primary"
            style={{ padding: '6px 18px', fontSize: '13px' }}
          >
            Compare Selected
          </button>
        </div>
      )}
    </div>
  );
};
