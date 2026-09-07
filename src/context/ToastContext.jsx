import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    const newToast = {
      id,
      type: toast.type || 'info', // success, warning, error, info
      message: toast.message || '',
      duration: toast.duration || 3000
    };

    setToasts((prev) => {
      const updated = [...prev, newToast];
      if (updated.length > 3) {
        return updated.slice(updated.length - 3); // Keep maximum 3 stacked
      }
      return updated;
    });

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Stacking Container - Fixed Bottom Right */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none'
        }}
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minWidth: '300px',
              maxWidth: '420px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: '#FFFFFF',
              border: `1px solid ${
                t.type === 'success'
                  ? 'var(--teal)'
                  : t.type === 'warning'
                  ? 'var(--amber)'
                  : t.type === 'error'
                  ? 'var(--rose)'
                  : 'var(--slate)'
              }`,
              boxShadow: '0 8px 24px rgba(13, 27, 42, 0.12)',
              animation: 'fadeUpPage 250ms ease-out',
              color: 'var(--ink)'
            }}
          >
            {t.type === 'success' && <CheckCircle2 size={18} color="var(--teal)" />}
            {t.type === 'warning' && <AlertTriangle size={18} color="var(--amber)" />}
            {t.type === 'error' && <AlertCircle size={18} color="var(--rose)" />}
            {t.type === 'info' && <Info size={18} color="var(--slate)" />}

            <span style={{ fontSize: '14px', flex: 1, fontWeight: 500 }}>
              {t.message}
            </span>

            <button
              onClick={() => removeToast(t.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--slate)',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
