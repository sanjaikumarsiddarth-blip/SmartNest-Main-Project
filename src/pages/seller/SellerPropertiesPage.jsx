import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatPriceINR } from '../../components/shared/PropertyCard';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { SkeletonTable } from '../../components/shared/SkeletonCard';
import {
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const SellerPropertiesPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all'); // all | active | pending | sold | rejected
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalProperty, setDeleteModalProperty] = useState(null);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await api.getSellerProperties(user?.user_id);
      setProperties(data);
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to fetch your properties.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [user]);

  const handleDeleteConfirm = async () => {
    if (!deleteModalProperty) return;
    try {
      await api.deleteProperty(deleteModalProperty.property_id);
      setProperties((prev) => prev.filter((p) => p.property_id !== deleteModalProperty.property_id));
      addToast({ type: 'info', message: 'Property deleted successfully.' });
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to delete property.' });
    } finally {
      setDeleteModalProperty(null);
    }
  };

  const filteredProperties = properties.filter((p) => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  return (
    <div className="page-entrance" style={{ padding: '40px 0 100px 0', backgroundColor: '#F8FAFC', minHeight: '90vh' }}>
      <div className="container-main">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)' }}>
              My Property Listings
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--slate)' }}>
              Manage active listings, inspect status approvals, and view buyer match intelligence
            </p>
          </div>

          <Link to="/seller/add" className="btn btn-primary">
            <PlusCircle size={16} /> Add Property
          </Link>
        </div>

        {/* Tabs: All | Active | Pending | Sold | Rejected */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '24px', overflowX: 'auto' }}>
          {['all', 'active', 'pending', 'sold', 'rejected'].map((tab) => (
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
              {tab} ({tab === 'all' ? properties.length : properties.filter((p) => p.status === tab).length})
            </button>
          ))}
        </div>

        {/* ── PROPERTY TABLE PER TAB ──────────────────────────── */}
        {loading ? (
          <SkeletonTable rows={5} />
        ) : filteredProperties.length > 0 ? (
          <div className="smartnest-card" style={{ padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Image + Title</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Location</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Price</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>BHK</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Views</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((p) => (
                  <tr key={p.property_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={p.images?.[0]}
                          alt={p.title}
                          style={{ width: '56px', height: '42px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{p.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--slate)' }}>ID: {p.property_id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--slate)' }}>
                      {p.location}, {p.city}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                      {formatPriceINR(p.price)}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--ink)' }}>
                      {p.bhk} BHK
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--slate)' }}>
                      {p.views || 240}
                    </td>
                    <td style={{ padding: '16px' }}>
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
                        title={p.status === 'rejected' ? p.rejection_reason || 'Rejected by moderator' : ''}
                        style={{ textTransform: 'capitalize', cursor: p.status === 'rejected' ? 'help' : 'default' }}
                      >
                        {p.status}
                        {p.status === 'rejected' && <AlertCircle size={12} />}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <Link
                          to={`/buyer/property/${p.property_id}`}
                          className="btn btn-ghost"
                          style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid var(--border)' }}
                          title="View live buyer detail page"
                        >
                          <Eye size={13} /> View
                        </Link>
                        <Link
                          to={`/seller/insights/${p.property_id}`}
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <Sparkles size={13} /> Insights
                        </Link>
                        <Link
                          to={`/seller/edit/${p.property_id}`}
                          className="btn btn-ghost"
                          style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid var(--border)' }}
                        >
                          <Edit size={13} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteModalProperty(p)}
                          className="btn btn-ghost"
                          style={{ padding: '6px 10px', fontSize: '12px', color: 'var(--rose)', border: '1px solid var(--border)' }}
                          title="Delete listing"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="smartnest-card" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', color: 'var(--slate)', marginBottom: '16px' }}>
              No properties in the <strong>{activeTab}</strong> tab.
            </p>
            <Link to="/seller/add" className="btn btn-primary">
              Create a Listing
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteModalProperty)}
        title="Delete this property?"
        message="Are you sure you want to delete this listing? This will permanently remove all associated analytics and enquiries and cannot be undone."
        confirmText="Delete Property"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModalProperty(null)}
      />
    </div>
  );
};
