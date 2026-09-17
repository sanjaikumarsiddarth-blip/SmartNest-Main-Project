import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { SkeletonTable } from '../../components/shared/SkeletonCard';
import { formatPriceINR } from '../../components/shared/PropertyCard';
import { Check, X, Trash2, Eye, AlertTriangle } from 'lucide-react';

export const AdminPropertiesPage = () => {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('all'); // all | pending | active | rejected | reported
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal state
  const [rejectModalProperty, setRejectModalProperty] = useState(null);

  // Remove modal state
  const [removeModalProperty, setRemoveModalProperty] = useState(null);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await api.getProperties();
      setProperties(data);
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to load property listings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleApprove = async (propId) => {
    try {
      await api.approveProperty(propId);
      setProperties((prev) =>
        prev.map((p) => (p.property_id === propId ? { ...p, status: 'active' } : p))
      );
      addToast({ type: 'success', message: 'Property approved and published.' });
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to approve property.' });
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectModalProperty) return;
    try {
      await api.rejectProperty(rejectModalProperty.property_id, reason);
      setProperties((prev) =>
        prev.map((p) =>
          p.property_id === rejectModalProperty.property_id
            ? { ...p, status: 'rejected', rejection_reason: reason }
            : p
        )
      );
      addToast({ type: 'warning', message: 'Property rejected with feedback to seller.' });
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to reject property.' });
    } finally {
      setRejectModalProperty(null);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!removeModalProperty) return;
    try {
      await api.removeProperty(removeModalProperty.property_id);
      setProperties((prev) => prev.filter((p) => p.property_id !== removeModalProperty.property_id));
      addToast({ type: 'info', message: 'Property removed from platform.' });
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to remove property.' });
    } finally {
      setRemoveModalProperty(null);
    }
  };

  const filtered = properties.filter((p) => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  return (
    <div className="page-entrance" style={{ padding: '36px 0 100px 0', backgroundColor: '#F1F5F9', minHeight: '90vh' }}>
      <div className="container-main">
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--ink)' }}>
            Property Moderation Queue
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--slate)' }}>
            Review developer submissions, audit environmental specifications, and manage listing statuses
          </p>
        </div>

        {/* Tabs: All | Pending | Active | Rejected | Reported */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '24px', overflowX: 'auto' }}>
          {['all', 'pending', 'active', 'rejected', 'reported'].map((tab) => {
            const count = tab === 'all' ? properties.length : properties.filter((p) => p.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: activeTab === tab ? 600 : 500,
                  color: activeTab === tab ? 'var(--teal)' : 'var(--slate)',
                  borderBottom: activeTab === tab ? '2.5px solid var(--teal)' : '2.5px solid transparent',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab} ({count})
              </button>
            );
          })}
        </div>

        {/* ── PROPERTIES TABLE ─────────────────────────────────── */}
        {loading ? (
          <SkeletonTable rows={6} />
        ) : filtered.length > 0 ? (
          <div className="smartnest-card" style={{ padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '860px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>ID</th>
                  <th style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Property</th>
                  <th style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Location</th>
                  <th style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Price</th>
                  <th style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>BHK</th>
                  <th style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Status</th>
                  <th style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.property_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px', fontSize: '12px', fontFamily: 'monospace', color: 'var(--slate)' }}>
                      {p.property_id}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                          alt={p.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
                          }}
                          style={{ width: '48px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{p.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--slate)' }}>Seller ID: {p.seller_id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px', fontSize: '13px', color: 'var(--slate)' }}>
                      {p.location}, {p.city}
                    </td>
                    <td style={{ padding: '14px', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                      {formatPriceINR(p.price)}
                    </td>
                    <td style={{ padding: '14px', fontSize: '13px', color: 'var(--ink)' }}>
                      {p.bhk} BHK
                    </td>
                    <td style={{ padding: '14px' }}>
                      <span
                        className={`badge-pill ${
                          p.status === 'active'
                            ? 'badge-teal'
                            : p.status === 'pending'
                            ? 'badge-amber'
                            : p.status === 'rejected'
                            ? 'badge-rose'
                            : 'badge-slate'
                        }`}
                        title={p.status === 'rejected' ? p.rejection_reason : ''}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <Link
                          to={`/buyer/property/${p.property_id}`}
                          className="btn btn-ghost"
                          style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid var(--border)' }}
                        >
                          <Eye size={13} /> View
                        </Link>

                        {/* Pending Tab Actions */}
                        {p.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(p.property_id)}
                              className="btn btn-primary"
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button
                              onClick={() => setRejectModalProperty(p)}
                              className="btn btn-destructive"
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                            >
                              <X size={13} /> Reject
                            </button>
                          </>
                        )}

                        {/* Active Tab Actions */}
                        {p.status === 'active' && (
                          <button
                            onClick={() => setRemoveModalProperty(p)}
                            className="btn btn-ghost"
                            style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--rose)', border: '1px solid var(--border)' }}
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="smartnest-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--slate)' }}>
            No properties found matching status: <strong>{activeTab}</strong>.
          </div>
        )}
      </div>

      {/* Reject Modal with Reason Textarea */}
      <ConfirmModal
        isOpen={Boolean(rejectModalProperty)}
        title="Reject Listing Submission"
        message={`Provide a compliance reason for rejecting "${rejectModalProperty?.title}". The seller will see this feedback in their developer portal.`}
        confirmText="Reject Property"
        cancelText="Cancel"
        isDestructive={true}
        requiresReason={true}
        reasonPlaceholder="e.g., Price quoted exceeds local registry benchmarks or acoustic decibel readings need re-verification."
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectModalProperty(null)}
      />

      {/* Remove Property Modal */}
      <ConfirmModal
        isOpen={Boolean(removeModalProperty)}
        title="Remove Live Property?"
        message={`Are you sure you want to remove "${removeModalProperty?.title}"? This listing will immediately disappear from buyer search results and matching queues.`}
        confirmText="Remove Listing"
        cancelText="Keep Listing"
        isDestructive={true}
        onConfirm={handleRemoveConfirm}
        onCancel={() => setRemoveModalProperty(null)}
      />
    </div>
  );
};
