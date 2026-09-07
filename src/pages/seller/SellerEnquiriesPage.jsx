import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SkeletonTable } from '../../components/shared/SkeletonCard';
import {
  Mail,
  X,
  Send,
  UserCheck,
  Building,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const SellerEnquiriesPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const data = await api.getEnquiries(user?.user_id);
      setEnquiries(data);
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to load enquiries.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [user]);

  const handleOpenRespond = (enq) => {
    setSelectedEnquiry(enq);
    setResponseMessage(enq.response || '');
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!responseMessage.trim() || !selectedEnquiry) return;

    setSubmittingResponse(true);
    try {
      await api.respondToEnquiry(selectedEnquiry.enquiry_id, responseMessage);
      setEnquiries((prev) =>
        prev.map((item) =>
          item.enquiry_id === selectedEnquiry.enquiry_id
            ? { ...item, status: 'responded', response: responseMessage }
            : item
        )
      );
      addToast({ type: 'success', message: 'Response sent to buyer successfully.' });
      setSelectedEnquiry(null);
      setResponseMessage('');
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to send response.' });
    } finally {
      setSubmittingResponse(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="page-entrance" style={{ padding: '40px 0 100px 0', backgroundColor: '#F8FAFC', minHeight: '90vh' }}>
      <div className="container-main">
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--ink)' }}>
            Buyer Enquiries Inbox
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--slate)' }}>
            Communicate directly with high-affinity matched buyers seeking property inspections
          </p>
        </div>

        {/* ── ENQUIRIES TABLE ─────────────────────────────────── */}
        {loading ? (
          <SkeletonTable rows={4} />
        ) : enquiries.length > 0 ? (
          <div className="smartnest-card" style={{ padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Buyer</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Target Property</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Message Preview</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Date</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enq) => (
                  <tr key={enq.enquiry_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{enq.buyer_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--slate)' }}>{enq.buyer_email}</div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--ink)', fontWeight: 500 }}>
                      {enq.property_title}
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--slate)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      "{enq.message}"
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: 'var(--slate)' }}>
                      {formatDate(enq.date)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span
                        className={`badge-pill ${
                          enq.status === 'new'
                            ? 'badge-rose'
                            : enq.status === 'responded'
                            ? 'badge-teal'
                            : 'badge-slate'
                        }`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {enq.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenRespond(enq)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        View & Respond
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="smartnest-card" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', color: 'var(--slate)' }}>No buyer enquiries received yet.</p>
          </div>
        )}
      </div>

      {/* ── SIDE PANEL (SLIDES FROM RIGHT) ─────────────────── */}
      {selectedEnquiry && (
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
            onClick={() => setSelectedEnquiry(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(13, 27, 42, 0.5)',
              backdropFilter: 'blur(2px)'
            }}
          />

          {/* Slide-over panel */}
          <div
            className="smartnest-card"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '440px',
              height: '100%',
              borderRadius: 0,
              borderLeft: '1px solid var(--border)',
              padding: '32px 28px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9600,
              animation: 'fadeUpPage 250ms ease-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
                Respond to Enquiry
              </h3>
              <button
                onClick={() => setSelectedEnquiry(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Buyer and Property Card details */}
            <div style={{ padding: '16px', backgroundColor: 'var(--mist)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--slate)', marginBottom: '4px' }}>From Prospective Buyer:</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>{selectedEnquiry.buyer_name}</div>
              <div style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '12px' }}>{selectedEnquiry.buyer_email}</div>

              <div style={{ fontSize: '12px', color: 'var(--slate)', marginBottom: '2px' }}>Regarding Property:</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--teal)' }}>{selectedEnquiry.property_title}</div>
            </div>

            {/* Buyer's Message */}
            <div style={{ marginBottom: '24px' }}>
              <label className="smartnest-label">Buyer Message</label>
              <div style={{ padding: '14px', backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '14px', color: 'var(--ink)', lineHeight: 1.6 }}>
                "{selectedEnquiry.message}"
              </div>
            </div>

            {/* Previous response if already responded */}
            {selectedEnquiry.response && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <CheckCircle2 size={14} color="var(--teal)" />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--teal)' }}>Previously Sent Response:</span>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--teal-light)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--ink)' }}>
                  {selectedEnquiry.response}
                </div>
              </div>
            )}

            {/* Response Form */}
            <form onSubmit={handleSendResponse} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ marginBottom: '20px' }}>
                <label className="smartnest-label" htmlFor="seller-reply">
                  Your Reply to {selectedEnquiry.buyer_name}
                </label>
                <textarea
                  id="seller-reply"
                  className="smartnest-input"
                  rows={5}
                  placeholder="Type your message, confirm visiting schedule, or answer questions..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                  disabled={submittingResponse}
                >
                  {submittingResponse ? 'Sending...' : 'Send Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
