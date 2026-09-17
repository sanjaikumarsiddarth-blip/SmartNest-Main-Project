import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const CompareContext = createContext(null);

const COMPARE_STORAGE_KEY = 'smartnest_compare_ids';

const loadSavedCompareIds = () => {
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((id) => typeof id === 'string' && id.trim().length > 0).slice(0, 3);
      }
    }
  } catch (e) {
    console.error('Failed to parse compare IDs from storage', e);
  }
  return [];
};

export const CompareProvider = ({ children }) => {
  const { addToast } = useToast() || {};
  const [selectedPropertyIds, setSelectedPropertyIds] = useState(loadSavedCompareIds);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  // In-memory cache for rich property metadata (images, live match score, etc.)
  const propertyCacheRef = useRef(new Map());

  // Save selected IDs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(selectedPropertyIds));
    } catch (e) {
      console.error('Failed to persist compare IDs to storage', e);
    }
  }, [selectedPropertyIds]);

  // Synchronize and hydrate full property details whenever selectedPropertyIds changes
  useEffect(() => {
    if (selectedPropertyIds.length === 0) {
      setSelectedProperties([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res = await api.compareProperties(selectedPropertyIds);
        if (isMounted) {
          const resolved = (res.properties || []).map((prop) => {
            const cached = propertyCacheRef.current.get(prop.property_id);
            return cached ? { ...cached, ...prop } : prop;
          });
          setSelectedProperties(resolved);
        }
      } catch (err) {
        console.error('Failed to hydrate comparison properties', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProperties();

    return () => {
      isMounted = false;
    };
  }, [selectedPropertyIds]);

  const isInCompare = useCallback(
    (propertyId) => {
      if (!propertyId) return false;
      return selectedPropertyIds.includes(propertyId);
    },
    [selectedPropertyIds]
  );

  const addToCompare = useCallback(
    (propertyOrId) => {
      const id =
        typeof propertyOrId === 'object' && propertyOrId !== null
          ? propertyOrId.property_id
          : propertyOrId;

      if (!id) return false;

      // Cache the full property object if passed
      if (typeof propertyOrId === 'object' && propertyOrId !== null) {
        propertyCacheRef.current.set(id, propertyOrId);
      }

      if (selectedPropertyIds.includes(id)) {
        return false; // Already present, prevent duplicates
      }

      if (selectedPropertyIds.length >= 3) {
        addToast?.({
          type: 'warning',
          message: 'Compare up to 3 properties at a time.'
        });
        return false;
      }

      setSelectedPropertyIds((prev) => {
        if (prev.includes(id)) return prev;
        if (prev.length >= 3) return prev;
        return [...prev, id];
      });

      addToast?.({
        type: 'success',
        message: 'Added to comparison list.'
      });
      return true;
    },
    [selectedPropertyIds, addToast]
  );

  const removeFromCompare = useCallback(
    (propertyId) => {
      if (!propertyId) return;

      setSelectedPropertyIds((prev) => prev.filter((id) => id !== propertyId));
      propertyCacheRef.current.delete(propertyId);

      addToast?.({
        type: 'info',
        message: 'Removed from comparison list.'
      });
    },
    [addToast]
  );

  const toggleCompare = useCallback(
    (propertyOrId) => {
      const id =
        typeof propertyOrId === 'object' && propertyOrId !== null
          ? propertyOrId.property_id
          : propertyOrId;

      if (!id) return;

      if (selectedPropertyIds.includes(id)) {
        removeFromCompare(id);
      } else {
        addToCompare(propertyOrId);
      }
    },
    [selectedPropertyIds, addToCompare, removeFromCompare]
  );

  const clearCompare = useCallback(() => {
    setSelectedPropertyIds([]);
    setSelectedProperties([]);
    propertyCacheRef.current.clear();
    try {
      localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify([]));
    } catch (e) {}
  }, []);

  const setCompareIds = useCallback((ids) => {
    if (!Array.isArray(ids)) return;
    const clean = ids
      .filter((id) => typeof id === 'string' && id.trim().length > 0)
      .slice(0, 3);
    setSelectedPropertyIds(clean);
  }, []);

  return (
    <CompareContext.Provider
      value={{
        selectedPropertyIds,
        selectedProperties,
        loading,
        isInCompare,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        setCompareIds,
        compareCount: selectedPropertyIds.length
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
