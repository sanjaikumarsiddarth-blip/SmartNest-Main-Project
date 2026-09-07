import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SkeletonTable } from '../../components/shared/SkeletonCard';
import { Building, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export const AdminSellersPage = () => {
  const { addToast } = useToast();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const data = await api.getSellers();
      setSellers(data);
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to fetch sellers.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleUpdateStatus = async (sellerId, status) => {
    try {
      await api.updateSellerStatus(sellerId, status);
      setSellers((prev) =>
        prev.map((s) => (s.user_id === sellerId ? { ...s, status } : s))
      );
      addToast({ type: 'success', message: `Seller status set to ${status}.` });
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to update status.' });
    }
  };

  return (
    <div className="page-entrance" style={{ padding: '36px 0 100px 0', backgroundColor: '#F1F5F9', minHeight: '90vh' }}>
      <div className="container-main">
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--ink)' }}>
            Registered Property Developers & Sellers
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--slate)' }}>
            Audit builder credentials, track listing volumes, and control developer portal access
          </p>
        </div>

        {loading ? (
          <SkeletonTable rows={4} />
        ) : (
          <div className="smartnest-card" style={{ padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Seller Entity</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Listings</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Total Views</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Enquiries</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((s) => (
                  <tr key={s.user_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--teal-light)', color: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{s.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--slate)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                      {s.properties_count || 3}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--slate)' }}>
                      {(s.total_views || 1120).toLocaleString()}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--slate)' }}>
                      {s.total_enquiries || 24}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span
                        className={`badge-pill ${
                          s.status === 'active'
                            ? 'badge-teal'
                            : s.status === 'suspended'
                            ? 'badge-amber'
                            : 'badge-rose'
                        }`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        {s.status !== 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(s.user_id, 'active')}
                            className="btn btn-primary"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                          >
                            Approve
                          </button>
                        )}
                        {s.status === 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(s.user_id, 'suspended')}
                            className="btn btn-ghost"
                            style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid var(--border)' }}
                          >
                            Suspend
                          </button>
                        )}
                        {s.status !== 'inactive' && (
                          <button
                            onClick={() => handleUpdateStatus(s.user_id, 'inactive')}
                            className="btn btn-ghost"
                            style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--rose)', border: '1px solid var(--border)' }}
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
