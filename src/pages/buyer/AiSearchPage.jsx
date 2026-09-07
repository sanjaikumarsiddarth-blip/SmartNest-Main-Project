import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PropertyCard } from '../../components/shared/PropertyCard';
import { LoadingStages } from '../../components/shared/LoadingStages';
import { EmptyState } from '../../components/shared/EmptyState';
import { Sparkles, Search, Clock } from 'lucide-react';

const SHORT_STAGES = [
  "Parsing natural language query...",
  "Semantic indexing against neighborhood parameters...",
  "Synthesizing matching properties..."
];

export const AiSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { sessionId } = useAuth();
  const { addToast } = useToast();

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const hist = await api.getSearchHistory(sessionId);
        setRecentSearches(hist.slice(0, 5));
        const saved = await api.getSavedProperties(sessionId);
        setSavedIds(saved.properties.map((p) => p.property_id));
      } catch (e) {}
    };
    loadRecent();

    if (initialQuery) {
      executeSearch(initialQuery);
    }
  }, [sessionId, initialQuery]);

  const executeSearch = async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await api.aiSearch(text, sessionId);
      setResults(res.properties);
    } catch (err) {
      addToast({ type: 'error', message: 'AI Search failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query.trim() });
    executeSearch(query.trim());
  };

  const handleChipClick = (str) => {
    setQuery(str);
    setSearchParams({ q: str });
    executeSearch(str);
  };

  const handleSaveToggle = async (propId) => {
    try {
      if (savedIds.includes(propId)) {
        await api.removeSavedProperty(propId, sessionId);
        setSavedIds((prev) => prev.filter((id) => id !== propId));
        addToast({ type: 'info', message: 'Removed from shortlist.' });
      } else {
        await api.saveProperty(propId, sessionId);
        setSavedIds((prev) => [...prev, propId]);
        addToast({ type: 'success', message: 'Saved to shortlist!' });
      }
    } catch (e) {
      addToast({ type: 'error', message: 'Error updating saved state.' });
    }
  };

  return (
    <div className="page-entrance" style={{ padding: '50px 0 100px 0' }}>
      {/* 3-Stage LoadingStages Overlay */}
      {loading && (
        <LoadingStages
          title="Synthesizing Semantic Search"
          stages={SHORT_STAGES}
        />
      )}

      <div className="container-main">
        {/* Header and Centered 60ch Search Box */}
        <div style={{ maxWidth: '60ch', margin: '0 auto 48px auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--teal-light)', color: 'var(--teal)', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            <Sparkles size={16} /> Natural Language Query Engine
          </div>

          <h1 className="font-display" style={{ fontSize: '36px', color: 'var(--ink)', marginBottom: '12px' }}>
            Describe your ideal home
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--slate)', marginBottom: '28px' }}>
            Type freely in plain words without messing with rigid dropdowns or checklists.
          </p>

          <form onSubmit={handleSubmit} style={{ position: 'relative', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  className="smartnest-input"
                  style={{
                    padding: '16px 20px 16px 44px',
                    fontSize: '16px',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: 'var(--shadow-card)'
                  }}
                  placeholder="Describe your ideal home in plain words..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                />
                <Search size={20} color="var(--teal)" style={{ position: 'absolute', left: '16px', top: '18px' }} />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0 28px', borderRadius: 'var(--radius-card)', fontSize: '15px' }}
              >
                Search
              </button>
            </div>
          </form>

          {/* Hint text */}
          <div style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '24px' }}>
            Hint: "A quiet 2BHK near Tidel Park under ₹60L" or "Spacious independent villa with high green canopy"
          </div>

          {/* Recent Searches (max 5 clickable chips) */}
          {recentSearches.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--slate)', fontWeight: 500 }}>Recent:</span>
              {recentSearches.map((item) => (
                <button
                  key={item.history_id}
                  type="button"
                  onClick={() => handleChipClick(item.summary)}
                  className="badge-pill badge-slate"
                  style={{ cursor: 'pointer', background: 'var(--white)', border: '1px solid var(--border)', fontSize: '12px' }}
                >
                  <Clock size={11} color="var(--slate)" />
                  {item.summary.length > 30 ? item.summary.substring(0, 30) + '...' : item.summary}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── SEARCH RESULTS GRID ─────────────────────────────── */}
        {hasSearched && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
                AI found {results.length} properties for your search
              </h2>
            </div>

            {results.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
                {results.map((prop) => (
                  <PropertyCard
                    key={prop.property_id}
                    property={prop}
                    showCompare={true}
                    showSave={true}
                    isSaved={savedIds.includes(prop.property_id)}
                    onSave={handleSaveToggle}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Sparkles}
                heading="No properties match your natural language description"
                subtext="Try mentioning broader criteria like '2BHK in Coimbatore' or 'Quiet apartment under ₹60L'."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
