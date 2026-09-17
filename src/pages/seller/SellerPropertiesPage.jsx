import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { formatPriceINR } from '../../components/shared/PropertyCard';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { SkeletonTable } from '../../components/shared/SkeletonCard';
import { UpgradeModal } from '../../components/subscription/UpgradeModal';
import {
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  AlertCircle,
  Tag,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';

export const SellerPropertiesPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { subscription, usage, canCreateProperty } = useSubscription();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all'); // all | active | pending | sold | rejected
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalProperty, setDeleteModalProperty] = useState(null);
  const [priceModalProperty, setPriceModalProperty] = useState(null);
  const [newPriceInput, setNewPriceInput] = useState('');
  const [updatingPrice, setUpdatingPrice] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
    const handleUpdated = () => fetchProperties();
    window.addEventListener('smartnest_properties_updated', handleUpdated);
    return () => window.removeEventListener('smartnest_properties_updated', handleUpdated);
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

  const handlePriceUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!priceModalProperty || !newPriceInput) return;
    setUpdatingPrice(true);
    try {
      const res = await api.updatePropertyPrice(priceModalProperty.property_id, Number(newPriceInput), user?.user_id);
      addToast({
        type: 'success',
        message: `Price updated to ${formatPriceINR(Number(newPriceInput))}! ${res.notifications?.length || 0} wishlist alerts created.`
      });
      setPriceModalProperty(null);
      setNewPriceInput('');
      fetchProperties();
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to update property price.' });
    } finally {
      setUpdatingPrice(false);
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)' }}>
              My Property Listings
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--slate)' }}>
              Manage active listings, inspect status approvals, and view buyer match intelligence
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/seller/plans" className="btn btn-secondary" style={{ fontSize: '13px' }}>
              Manage Plan
            </Link>
            {canCreateProperty() ? (
              <Link to="/seller/add" className="btn btn-primary">
                <PlusCircle size={16} /> Add Property
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="btn btn-primary"
                title="Listing limit reached. Upgrade plan to add more."
              >
                <PlusCircle size={16} /> Add Property
              </button>
            )}
          </div>
        </div>

        {/* Subscription Usage Strip */}
        <div
          className="smartnest-card"
          style={{
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            backgroundColor: 'var(--white)',
            borderLeft: `4px solid ${usage?.is_limit_reached ? '#F59E0B' : 'var(--teal)'}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: usage?.is_limit_reached ? '#FEF3C7' : '#E6F4F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={22} color={usage?.is_limit_reached ? '#D97706' : 'var(--teal)'} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                  {subscription?.plan_name || 'Free Plan'}
                </span>
                <span
                  className="badge-pill"
                  style={{
                    fontSize: '11px',
                    backgroundColor: usage?.is_limit_reached ? '#FEE2E2' : '#E6F4F1',
                    color: usage?.is_limit_reached ? '#DC2626' : 'var(--teal)'
                  }}
                >
                  {usage?.properties_published || 0} / {usage?.property_limit || 1} Listings Used
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '2px' }}>
                {usage?.is_limit_reached
                  ? 'You have reached your listing quota. Upgrade to unlock more property slots.'
                  : `${usage?.remaining_slots ?? (usage?.property_limit ? usage.property_limit - (usage.properties_published || 0) : 0)} listing slot${(usage?.property_limit ? usage.property_limit - (usage.properties_published || 0) : 0) === 1 ? '' : 's'} remaining on this plan.`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '120px', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.min(100, (((usage?.properties_published || 0) / (usage?.property_limit || 1)) * 100))}%`,
                  height: '100%',
                  backgroundColor: usage?.is_limit_reached ? '#F59E0B' : 'var(--teal)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <Link
              to="/seller/plans"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--teal)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none'
              }}
            >
              Upgrade Plan <ArrowUpRight size={14} />
            </Link>
          </div>
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
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80'}
                          alt={p.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
                          }}
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
                        <button
                          type="button"
                          onClick={() => {
                            setPriceModalProperty(p);
                            setNewPriceInput(String(p.price));
                          }}
                          className="btn btn-ghost"
                          style={{ padding: '6px 10px', fontSize: '12px', border: '1px solid var(--border)', color: 'var(--teal)' }}
                          title="Update Price & trigger wishlist alerts"
                        >
                          <Tag size={13} /> Price
                        </button>
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

      {/* Quick Price Update Modal */}
      {priceModalProperty && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(13, 27, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            className="smartnest-card"
            style={{
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginBottom: '8px' }}>
              Update Listing Price
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '18px', lineHeight: 1.5 }}>
              Updating <strong>{priceModalProperty.title}</strong> will record an immutable price history record and trigger automated SNS Wishlist alerts for matched buyers.
            </p>

            <form onSubmit={handlePriceUpdateSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--slate)', marginBottom: '6px' }}>
                  Current Listed Price
                </label>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
                  {formatPriceINR(priceModalProperty.price)}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--slate)', marginBottom: '6px' }}>
                  New Price (in INR)
                </label>
                <input
                  type="number"
                  value={newPriceInput}
                  onChange={(e) => setNewPriceInput(e.target.value)}
                  placeholder="e.g. 7400000"
                  className="input-field"
                  style={{ width: '100%', padding: '10px 12px', fontSize: '14px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPriceModalProperty(null)}
                  className="btn btn-ghost"
                  disabled={updatingPrice}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updatingPrice}
                >
                  {updatingPrice ? 'Updating & Alerting...' : 'Update & Dispatch Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* Upgrade Subscription Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        limitType="properties"
        currentPlan={subscription?.plan_id || 'seller_free'}
        userRole="seller"
        usage={usage}
      />
    </div>
  );
};
