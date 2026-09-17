import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useMessaging } from '../../context/MessagingContext';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import {
  Send,
  Building,
  ExternalLink,
  Search,
  MessageSquare,
  ArrowLeft,
  Clock,
  CheckCheck,
  Check,
  Compass,
  AlertCircle
} from 'lucide-react';

export const MessageBoxPage = () => {
  const {
    conversations,
    activeConversation,
    selectConversation,
    sendMessage,
    loading
  } = useMessaging();

  const { user } = useAuth();
  const { subscription, usage } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Deep-link to conversation via ?id=conv_id
  useEffect(() => {
    const targetId = searchParams.get('id');
    if (targetId && conversations.length > 0) {
      const found = conversations.find((c) => c.conversation_id === targetId);
      if (found) {
        selectConversation(found);
        setMobileChatOpen(true);
      }
    }
  }, [searchParams, conversations, selectConversation]);

  // Auto scroll chat to bottom when messages change
  useEffect(() => {
    if (activeConversation?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages]);

  const handleSelectConv = (conv) => {
    selectConversation(conv);
    setMobileChatOpen(true);
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || sending || !activeConversation) return;

    setSending(true);
    try {
      await sendMessage(activeConversation.conversation_id, inputMessage);
      setInputMessage('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const d = new Date(timestamp);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = d.toDateString() === yesterday.toDateString();

      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (isToday) return `Today, ${timeStr}`;
      if (isYesterday) return `Yesterday, ${timeStr}`;
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
    } catch (e) {
      return '';
    }
  };

  const formatPrice = (price) => {
    if (!price) return '';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    return `₹${(price / 100000).toFixed(0)} Lakhs`;
  };

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.seller_name?.toLowerCase().includes(query) ||
      c.property_title?.toLowerCase().includes(query) ||
      c.last_message?.toLowerCase().includes(query)
    );
  });

  return (
    <div
      className="page-entrance"
      style={{
        backgroundColor: '#F8FAFC',
        minHeight: 'calc(100vh - 76px)',
        padding: '24px 0 60px 0'
      }}
    >
      <div className="container-main" style={{ maxWidth: '1200px' }}>
        {/* Page Title & Contact Quota Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: 700,
                color: 'var(--ink)',
                letterSpacing: '-0.02em',
                marginBottom: '4px'
              }}
            >
              Message Box
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--slate)', margin: 0 }}>
              View and manage your conversations with property sellers.
            </p>
          </div>

          {/* Contact Quota Info Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '8px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>
                  {subscription?.plan_name || 'Connect Plan'}
                </span>
                <span
                  className="badge-pill"
                  style={{
                    fontSize: '11px',
                    backgroundColor: usage?.is_limit_reached ? '#FEE2E2' : '#E6F4F1',
                    color: usage?.is_limit_reached ? '#DC2626' : 'var(--teal)'
                  }}
                >
                  {usage?.contacts_used || 0} / {usage?.contact_limit || 15} Contacts
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--slate)', marginTop: '2px' }}>
                {usage?.is_limit_reached
                  ? 'Allowance exhausted · Existing replies remain active'
                  : `${(usage?.contact_limit || 15) - (usage?.contacts_used || 0)} new seller contacts left`}
              </div>
            </div>
            <Link
              to="/buyer/plans"
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Manage Plan
            </Link>
          </div>
        </div>

        {/* ── MAIN 2-COLUMN CONTAINER ─────────────────────── */}
        {loading && conversations.length === 0 ? (
          <div
            className="smartnest-card"
            style={{
              padding: '48px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
            <div className="skeleton" style={{ width: '220px', height: '20px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '320px', height: '14px', borderRadius: '4px' }} />
          </div>
        ) : conversations.length === 0 ? (
          /* Empty State */
          <div
            className="smartnest-card"
            style={{
              padding: '64px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--teal-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--teal)'
              }}
            >
              <MessageSquare size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ink)', marginBottom: '6px' }}>
                No messages yet
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--slate)', maxWidth: '420px', margin: '0 auto' }}>
                Your conversations with property sellers will appear here once you enquire about a property.
              </p>
            </div>
            <Link
              to="/buyer/recommendations"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px'
              }}
            >
              <Compass size={16} /> Explore Matches
            </Link>
          </div>
        ) : (
          <div
            className="smartnest-card"
            style={{
              display: 'grid',
              gridTemplateColumns: '360px 1fr',
              height: '720px',
              padding: 0,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(13, 27, 42, 0.08)'
            }}
          >
            {/* ── LEFT PANE: CONVERSATION LIST ─────────────── */}
            <div
              className={`conv-list-pane ${mobileChatOpen ? 'mobile-hidden' : ''}`}
              style={{
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                backgroundColor: '#FFFFFF'
              }}
            >
              {/* Search Bar */}
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Search
                    size={16}
                    color="var(--slate)"
                    style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
                  />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="smartnest-input"
                    style={{
                      paddingLeft: '36px',
                      fontSize: '13px',
                      height: '38px',
                      width: '100%'
                    }}
                  />
                </div>
              </div>

              {/* Conversations Scrollable List */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {filteredConversations.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--slate)' }}>
                    <p style={{ fontSize: '13px', margin: 0 }}>No conversations match your search.</p>
                  </div>
                ) : (
                  filteredConversations.map((c) => {
                    const isSelected = activeConversation?.conversation_id === c.conversation_id;
                    const hasUnread = Boolean(c.unread_for_buyer);

                    return (
                      <div
                        key={c.conversation_id}
                        onClick={() => handleSelectConv(c)}
                        style={{
                          padding: '16px',
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'var(--teal-light)' : '#FFFFFF',
                          borderLeft: isSelected ? '4px solid var(--teal)' : '4px solid transparent',
                          transition: 'background-color 150ms ease, border-color 150ms ease',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'flex-start'
                        }}
                      >
                        {/* Property Thumbnail */}
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: 'var(--mist)',
                            flexShrink: 0
                          }}
                        >
                          {c.property_image ? (
                            <img
                              src={c.property_image}
                              alt={c.property_title}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
                              }}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--slate)'
                              }}
                            >
                              <Building size={20} />
                            </div>
                          )}
                        </div>

                        {/* Text Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'baseline',
                              marginBottom: '2px'
                            }}
                          >
                            <span
                              style={{
                                fontSize: '14px',
                                fontWeight: hasUnread ? 700 : 600,
                                color: 'var(--ink)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '160px'
                              }}
                            >
                              {c.seller_name}
                            </span>
                            <span
                              style={{
                                fontSize: '11px',
                                color: hasUnread ? 'var(--teal)' : 'var(--slate)',
                                fontWeight: hasUnread ? 600 : 400,
                                flexShrink: 0
                              }}
                            >
                              {formatTimestamp(c.last_message_at).split(',')[0]}
                            </span>
                          </div>

                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 500,
                              color: 'var(--slate)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              marginBottom: '4px'
                            }}
                          >
                            {c.property_title}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <p
                              style={{
                                fontSize: '12px',
                                color: hasUnread ? 'var(--ink)' : 'var(--slate)',
                                fontWeight: hasUnread ? 600 : 400,
                                margin: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '210px'
                              }}
                            >
                              {c.last_message || 'No messages yet'}
                            </p>

                            {hasUnread && (
                              <span
                                style={{
                                  backgroundColor: 'var(--teal)',
                                  color: '#FFFFFF',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '2px 7px',
                                  borderRadius: '10px',
                                  flexShrink: 0,
                                  marginLeft: '6px'
                                }}
                              >
                                1 unread
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── RIGHT PANE: ACTIVE CHAT ─────────────────── */}
            <div
              className={`conv-chat-pane ${!mobileChatOpen ? 'mobile-hidden' : ''}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                backgroundColor: '#FFFFFF'
              }}
            >
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Mobile Back Button */}
                      <button
                        onClick={() => setMobileChatOpen(false)}
                        className="btn-mobile-back"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '6px',
                          cursor: 'pointer',
                          display: 'none',
                          color: 'var(--ink)',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '13px'
                        }}
                      >
                        <ArrowLeft size={18} />
                      </button>

                      {/* Property Thumbnail */}
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: 'var(--mist)',
                          flexShrink: 0
                        }}
                      >
                        {activeConversation.property_image ? (
                          <img
                            src={activeConversation.property_image}
                            alt={activeConversation.property_title}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80';
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--slate)'
                            }}
                          >
                            <Building size={20} />
                          </div>
                        )}
                      </div>

                      {/* Header Details */}
                      <div>
                        <div
                          style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: 'var(--ink)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {activeConversation.seller_name}
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 500,
                              color: 'var(--slate)',
                              backgroundColor: 'var(--mist)',
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            Seller
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'var(--slate)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span style={{ fontWeight: 500, color: 'var(--ink)' }}>
                            {activeConversation.property_title}
                          </span>
                          {activeConversation.property_price ? (
                            <span>• {formatPrice(activeConversation.property_price)}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* View Property Action */}
                    {activeConversation.property_id && (
                      <Link
                        to={`/buyer/property/${activeConversation.property_id}`}
                        className="btn btn-secondary"
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>View Property</span>
                        <ExternalLink size={14} />
                      </Link>
                    )}
                  </div>

                  {/* Messages Stream Area */}
                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: '24px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      backgroundColor: '#F8FAFC'
                    }}
                  >
                    {/* Security & Verification Banner */}
                    <div
                      style={{
                        padding: '10px 14px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--slate)',
                        textAlign: 'center',
                        maxWidth: '520px',
                        margin: '0 auto 12px auto'
                      }}
                    >
                      🔒 All conversations are securely verified by SmartNest AI to guarantee verified seller identity and direct communication.
                    </div>

                    {/* Message Bubbles */}
                    {(!activeConversation.messages || activeConversation.messages.length === 0) ? (
                      <div style={{ textAlign: 'center', color: 'var(--slate)', marginTop: '40px' }}>
                        <p style={{ fontSize: '13px' }}>Start the conversation by sending a message below.</p>
                      </div>
                    ) : (
                      activeConversation.messages.map((m) => {
                        const isBuyer = m.sender_role === 'buyer';

                        return (
                          <div
                            key={m.message_id}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isBuyer ? 'flex-end' : 'flex-start',
                              width: '100%'
                            }}
                          >
                            {/* Sender Info Tag */}
                            <span
                              style={{
                                fontSize: '11px',
                                color: 'var(--slate)',
                                marginBottom: '4px',
                                marginLeft: isBuyer ? '0' : '4px',
                                marginRight: isBuyer ? '4px' : '0'
                              }}
                            >
                              {isBuyer ? 'You' : m.sender_name || activeConversation.seller_name}
                            </span>

                            {/* Message Bubble Container */}
                            <div
                              style={{
                                maxWidth: '75%',
                                padding: '12px 16px',
                                borderRadius: isBuyer ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                backgroundColor: isBuyer ? 'var(--teal)' : '#FFFFFF',
                                color: isBuyer ? '#FFFFFF' : 'var(--ink)',
                                border: isBuyer ? 'none' : '1px solid var(--border)',
                                boxShadow: isBuyer
                                  ? '0 2px 8px rgba(42, 157, 143, 0.2)'
                                  : '0 2px 6px rgba(13, 27, 42, 0.04)',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap'
                              }}
                            >
                              {m.text}
                            </div>

                            {/* Timestamp and Delivery Status */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '4px',
                                fontSize: '10px',
                                color: 'var(--slate)',
                                marginRight: isBuyer ? '4px' : '0',
                                marginLeft: isBuyer ? '0' : '4px'
                              }}
                            >
                              <span>{formatTimestamp(m.created_at)}</span>
                              {isBuyer && (
                                <span title={m.status === 'read' ? 'Read by seller' : 'Delivered'}>
                                  {m.status === 'read' ? (
                                    <CheckCheck size={13} color="var(--teal)" />
                                  ) : (
                                    <Check size={13} color="var(--slate)" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input Bottom Bar */}
                  <form
                    onSubmit={handleSend}
                    style={{
                      padding: '14px 20px',
                      borderTop: '1px solid var(--border)',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-end'
                    }}
                  >
                    <div style={{ flex: 1, position: 'relative' }}>
                      <textarea
                        ref={inputRef}
                        rows={2}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message... (Enter to send, Shift + Enter for new line)"
                        className="smartnest-input"
                        style={{
                          width: '100%',
                          resize: 'none',
                          padding: '10px 14px',
                          fontSize: '13px',
                          borderRadius: '8px',
                          lineHeight: '1.4'
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || sending}
                      className="btn btn-primary"
                      style={{
                        height: '48px',
                        padding: '0 20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: !inputMessage.trim() || sending ? 0.6 : 1,
                        cursor: !inputMessage.trim() || sending ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <span>{sending ? 'Sending...' : 'Send'}</span>
                      <Send size={15} />
                    </button>
                  </form>
                </>
              ) : (
                /* No Conversation Selected Placeholder */
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'var(--slate)',
                    padding: '24px',
                    textAlign: 'center'
                  }}
                >
                  <MessageSquare size={44} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 6px 0' }}>
                    Select a conversation
                  </h4>
                  <p style={{ fontSize: '13px', margin: 0, maxWidth: '300px' }}>
                    Choose a conversation from the left to view messages and schedule site visits.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Media query styling for responsive split pane */}
      <style>{`
        @media (max-width: 768px) {
          .smartnest-card {
            display: block !important;
            height: auto !important;
            min-height: 580px;
          }
          .conv-list-pane {
            width: 100% !important;
            border-right: none !important;
            height: 580px !important;
          }
          .conv-chat-pane {
            width: 100% !important;
            height: 580px !important;
          }
          .mobile-hidden {
            display: none !important;
          }
          .btn-mobile-back {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  );
};
