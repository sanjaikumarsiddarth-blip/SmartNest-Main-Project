import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Check,
  CheckCheck
} from 'lucide-react';

export const SellerEnquiriesPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [activeConv, setActiveConv] = useState(null);
  const [loadingConv, setLoadingConv] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const messagesEndRef = useRef(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const data = await api.getEnquiries(user?.user_id);
      setEnquiries(data || []);
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to load enquiries.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [user]);

  // Load matching full conversation when an enquiry is selected
  const handleOpenRespond = async (enq) => {
    setSelectedEnquiry(enq);
    setResponseMessage('');
    setLoadingConv(true);

    try {
      const sellerId = user?.user_id || user?.id || (api.getDemoMode() ? 'usr_seller_01' : '');
      const allConvs = await api.getConversations(sellerId, 'seller');
      let found = (allConvs || []).find(
        (c) =>
          c.enquiry_id === enq.enquiry_id ||
          (c.property_id === enq.property_id && c.buyer_id === enq.buyer_id)
      );

      if (found) {
        setActiveConv(found);
        if (found.unread_for_seller && user) {
          await api.markConversationAsRead(found.conversation_id, user.user_id, 'seller');
        }
      } else {
        // Ensure conversation exists in persistent store
        const createdConv = await api.createOrGetConversation({
          buyer_id: enq.buyer_id || (api.getDemoMode() ? 'usr_buyer_01' : ''),
          buyer_name: enq.buyer_name || (api.getDemoMode() ? 'Aarav Sharma' : 'Buyer'),
          buyer_email: enq.buyer_email || '',
          seller_id: sellerId || enq.seller_id || '',
          seller_name: user?.name || user?.user_metadata?.full_name || (api.getDemoMode() ? 'Prestige Developers' : 'Seller'),
          property_id: enq.property_id,
          property_title: enq.property_title,
          initial_message: enq.message
        });
        setActiveConv(createdConv);
      }
    } catch (err) {
      console.error('Failed to load conversation thread', err);
    } finally {
      setLoadingConv(false);
    }
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeConv?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConv?.messages]);

  // Listen for new messages
  useEffect(() => {
    const handleUpdate = async () => {
      const sellerId = user?.user_id || user?.id || (api.getDemoMode() ? 'usr_seller_01' : '');
      const data = await api.getEnquiries(sellerId);
      setEnquiries(data || []);

      if (selectedEnquiry) {
        const allConvs = await api.getConversations(sellerId, 'seller');
        const updated = (allConvs || []).find(
          (c) =>
            c.enquiry_id === selectedEnquiry.enquiry_id ||
            (c.property_id === selectedEnquiry.property_id && c.buyer_id === selectedEnquiry.buyer_id) ||
            (activeConv && c.conversation_id === activeConv.conversation_id)
        );
        if (updated) {
          setActiveConv(updated);
        }
      }
    };

    window.addEventListener('smartnest_message_sent', handleUpdate);
    return () => window.removeEventListener('smartnest_message_sent', handleUpdate);
  }, [user, selectedEnquiry, activeConv]);

  const handleSendResponse = async (e) => {
    if (e) e.preventDefault();
    if (!responseMessage.trim() || !selectedEnquiry || submittingResponse) return;

    setSubmittingResponse(true);
    const textToSend = responseMessage.trim();
    const sellerId = user?.user_id || user?.id || (api.getDemoMode() ? 'usr_seller_01' : '');
    const sellerName = user?.name || user?.user_metadata?.full_name || (api.getDemoMode() ? 'Prestige Developers' : 'Seller');

    try {
      let targetConvId = activeConv?.conversation_id;

      if (!targetConvId) {
        const conv = await api.createOrGetConversation({
          buyer_id: selectedEnquiry.buyer_id || (api.getDemoMode() ? 'usr_buyer_01' : ''),
          buyer_name: selectedEnquiry.buyer_name || (api.getDemoMode() ? 'Aarav Sharma' : 'Buyer'),
          buyer_email: selectedEnquiry.buyer_email || '',
          seller_id: sellerId || selectedEnquiry.seller_id || '',
          seller_name: sellerName,
          property_id: selectedEnquiry.property_id,
          property_title: selectedEnquiry.property_title,
          initial_message: selectedEnquiry.message
        });
        targetConvId = conv.conversation_id;
        setActiveConv(conv);
      }

      // Send reply message
      const res = await api.sendMessage(targetConvId, {
        sender_id: sellerId,
        sender_role: 'seller',
        sender_name: sellerName,
        text: textToSend
      });

      // Also ensure enquiry is marked responded
      await api.respondToEnquiry(selectedEnquiry.enquiry_id, textToSend);

      // Fetch fresh conversation state
      const freshConv = await api.getConversation(targetConvId);
      if (freshConv) {
        setActiveConv(freshConv);
      } else if (res?.message) {
        setActiveConv((prev) => ({
          ...prev,
          messages: [...(prev?.messages || []), res.message]
        }));
      }

      setEnquiries((prev) =>
        prev.map((item) =>
          item.enquiry_id === selectedEnquiry.enquiry_id
            ? { ...item, status: 'responded', response: textToSend }
            : item
        )
      );

      addToast({ type: 'success', message: 'Reply sent to buyer successfully.' });
      setResponseMessage('');
    } catch (err) {
      console.error('Failed to send response:', err);
      addToast({ type: 'error', message: err.message || 'Failed to send response.' });
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendResponse();
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

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const d = new Date(timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div
      className="page-entrance"
      style={{ padding: '40px 0 100px 0', backgroundColor: '#F8FAFC', minHeight: '90vh' }}
    >
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
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>
                    Buyer
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>
                    Target Property
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>
                    Message Preview
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>
                    Date
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)' }}>
                    Status
                  </th>
                  <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: 'var(--slate)', textAlign: 'right' }}>
                    Actions
                  </th>
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
                    <td
                      style={{
                        padding: '16px',
                        fontSize: '13px',
                        color: 'var(--slate)',
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
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

      {/* ── FULL CONVERSATION SIDE DRAWER (SLIDES FROM RIGHT) ─────────────────── */}
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
              maxWidth: '520px',
              height: '100%',
              borderRadius: 0,
              borderLeft: '1px solid var(--border)',
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 9600,
              animation: 'fadeUpPage 250ms ease-out',
              backgroundColor: '#FFFFFF'
            }}
          >
            {/* Top Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#FFFFFF'
              }}
            >
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: '0 0 4px 0' }}>
                  Conversation with {selectedEnquiry.buyer_name}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{selectedEnquiry.property_title}</span>
                  {selectedEnquiry.property_id && (
                    <Link
                      to={`/buyer/property/${selectedEnquiry.property_id}`}
                      target="_blank"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        color: 'var(--teal)',
                        textDecoration: 'none',
                        fontWeight: 600
                      }}
                    >
                      <span>Listing</span>
                      <ExternalLink size={12} />
                    </Link>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)', padding: '4px' }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Buyer Details Summary Card */}
            <div
              style={{
                padding: '12px 24px',
                backgroundColor: 'var(--mist)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px'
              }}
            >
              <div>
                <span style={{ color: 'var(--slate)' }}>Buyer Email: </span>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{selectedEnquiry.buyer_email}</span>
              </div>
              <span
                className={`badge-pill ${
                  selectedEnquiry.status === 'new' ? 'badge-rose' : 'badge-teal'
                }`}
                style={{ fontSize: '10px', textTransform: 'capitalize' }}
              >
                {selectedEnquiry.status}
              </span>
            </div>

            {/* Conversation Messages Thread */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                backgroundColor: '#F8FAFC'
              }}
            >
              {loadingConv ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate)', fontSize: '13px' }}>
                  Loading conversation history...
                </div>
              ) : activeConv?.messages && activeConv.messages.length > 0 ? (
                activeConv.messages.map((m, idx) => {
                  const isSeller = m.sender_role === 'seller';

                  return (
                    <div
                      key={m.message_id || idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isSeller ? 'flex-end' : 'flex-start',
                        width: '100%'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          color: 'var(--slate)',
                          marginBottom: '3px',
                          marginLeft: isSeller ? '0' : '4px',
                          marginRight: isSeller ? '4px' : '0'
                        }}
                      >
                        {isSeller ? 'You (Seller)' : m.sender_name || selectedEnquiry.buyer_name}
                      </span>
                      <div
                        style={{
                          maxWidth: '82%',
                          padding: '11px 15px',
                          borderRadius: isSeller ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                          backgroundColor: isSeller ? 'var(--teal)' : '#FFFFFF',
                          color: isSeller ? '#FFFFFF' : 'var(--ink)',
                          border: isSeller ? 'none' : '1px solid var(--border)',
                          boxShadow: isSeller
                            ? '0 2px 6px rgba(42, 157, 143, 0.2)'
                            : '0 2px 4px rgba(13, 27, 42, 0.04)',
                          fontSize: '13px',
                          lineHeight: '1.5',
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {m.text}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '3px',
                          fontSize: '10px',
                          color: 'var(--slate)',
                          marginRight: isSeller ? '4px' : '0',
                          marginLeft: isSeller ? '0' : '4px'
                        }}
                      >
                        <span>{formatTimestamp(m.created_at)}</span>
                        {isSeller && (
                          <span>
                            {m.status === 'read' ? (
                              <CheckCheck size={12} color="var(--teal)" />
                            ) : (
                              <Check size={12} color="var(--slate)" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate)', fontSize: '13px' }}>
                  No messages yet.
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Response Form Bar */}
            <form
              onSubmit={handleSendResponse}
              style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--border)',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-end'
              }}
            >
              <div style={{ flex: 1 }}>
                <textarea
                  rows={2}
                  placeholder={`Reply to ${selectedEnquiry.buyer_name}... (Enter to send, Shift + Enter for new line)`}
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="smartnest-input"
                  style={{
                    width: '100%',
                    resize: 'none',
                    padding: '10px 14px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    lineHeight: '1.4'
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!responseMessage.trim() || submittingResponse}
                className="btn btn-primary"
                style={{
                  height: '46px',
                  padding: '0 18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: !responseMessage.trim() || submittingResponse ? 0.6 : 1,
                  cursor: !responseMessage.trim() || submittingResponse ? 'not-allowed' : 'pointer'
                }}
              >
                <span>{submittingResponse ? 'Sending...' : 'Send'}</span>
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
