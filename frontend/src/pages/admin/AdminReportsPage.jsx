import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SkeletonTable } from '../../components/shared/SkeletonCard';
import { AlertTriangle, CheckCircle2, ShieldAlert, X, ExternalLink } from 'lucide-react';

export const AdminReportsPage = () => {
  const { addToast } = useToast();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports();
      setReports(data);
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to fetch reports.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolveAction = async (reportId, action) => {
    try {
      await api.resolveReport(reportId, action);
      setReports((prev) =>
        prev.map((r) => (r.report_id === reportId ? { ...r, status: 'resolved', action_taken: action } : r))
      );
      addToast({ type: 'success', message: `Report resolved: ${action}` });
      setSelectedReport(null);
    } catch (e) {
      addToast({ type: 'error', message: 'Failed to resolve report.' });
    }
  };

  return (
    <div className="page-entrance" style={{ padding: '36px 0 100px 0', backgroundColor: '#F1F5F9', minHeight: '90vh' }}>
      <div className="container-main">
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--ink)' }}>
            Reported Listings & Compliance Flags
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--slate)' }}>
            Investigate community flags concerning acoustic discrepancies, misleading photos, or pricing accuracy
          </p>
        </div>

        {loading ? (
          <SkeletonTable rows={4} />
        ) : reports.length > 0 ? (
          <div className="smartnest-card" style={{ padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Property</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Reported By</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Reason / Flag</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Date</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.report_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>
                      {r.property_title}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--ink)' }}>{r.reported_by}</div>
                      <div style={{ fontSize: '11px', color: 'var(--slate)' }}>{r.reporter_email}</div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--slate)', maxWidth: '300px' }}>
                      "{r.reason}"
                    </td>
                    <td style={{ padding: '16px', fontSize: '12px', color: 'var(--slate)' }}>
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span
                        className={`badge-pill ${r.status === 'pending' ? 'badge-rose' : 'badge-teal'}`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedReport(r)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        Review Flag
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="smartnest-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--slate)' }}>
            No listing compliance reports currently open.
          </div>
        )}
      </div>

      {/* ── DETAIL REVIEW MODAL ─────────────────────────────── */}
      {selectedReport && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(13, 27, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="smartnest-card"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '28px',
              borderRadius: 'var(--radius-modal)',
              animation: 'fadeUpPage 250ms ease-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} color="var(--rose)" />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>
                  Listing Dispute Review
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                style={{ background: 'none', border: 'none', color: 'var(--slate)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--mist)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--slate)' }}>Target Property:</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>{selectedReport.property_title}</div>
              <div style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '8px' }}>Reporter:</div>
              <div style={{ fontSize: '13px', color: 'var(--ink)' }}>{selectedReport.reported_by} ({selectedReport.reporter_email})</div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="smartnest-label">Reported Claim:</label>
              <div style={{ padding: '12px', backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--ink)', lineHeight: 1.5 }}>
                "{selectedReport.reason}"
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => handleResolveAction(selectedReport.report_id, 'Approved listing as accurate')}
                  className="btn btn-secondary"
                  style={{ fontSize: '13px' }}
                >
                  Approve Listing
                </button>
                <button
                  onClick={() => handleResolveAction(selectedReport.report_id, 'Removed listing due to violation')}
                  className="btn btn-destructive"
                  style={{ fontSize: '13px' }}
                >
                  Remove Listing
                </button>
              </div>

              <button
                onClick={() => {
                  addToast({ type: 'info', message: 'Seller notified for documentation request.' });
                  handleResolveAction(selectedReport.report_id, 'Requested audit docs from developer');
                }}
                className="btn btn-ghost"
                style={{ border: '1px solid var(--border)', fontSize: '13px' }}
              >
                Contact Seller for Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
