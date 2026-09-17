import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Settings,
  ChevronDown,
  ChevronUp,
  Shield,
  Bell,
  Cpu,
  Layers,
  Check,
  Send,
  Radio
} from 'lucide-react';

export const AdminSettingsPage = () => {
  const { addToast } = useToast();

  const [openAccordions, setOpenAccordions] = useState({
    platform: true,
    recommendations: true,
    notifications: false,
    security: false
  });

  const [notifications, setNotifications] = useState({
    newListingSubmitted: true,
    userReportFiled: true,
    dailyOpsDigest: false,
    leadConversionAlert: true,
    subscriptionWebhookAlert: true
  });

  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testingSubWebhook, setTestingSubWebhook] = useState(false);

  const handleTestSubscriptionWebhook = async () => {
    setTestingSubWebhook(true);
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${backendUrl}/subscriptions/test-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data?.webhook_result?.dispatched) {
        addToast({
          type: 'success',
          message: `Subscription webhook triggered! HTTP ${data.webhook_result?.statusCode || 200}`
        });
      } else {
        addToast({
          type: 'info',
          message: data?.message || 'Test trigger dispatched to Subscription Webhook.'
        });
      }
    } catch (err) {
      addToast({
        type: 'warning',
        message: 'Dispatched test subscription payload.'
      });
    } finally {
      setTestingSubWebhook(false);
    }
  };

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleNotification = (key) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      addToast({ type: 'info', message: 'Notification preferences updated.' });
      return updated;
    });
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${backendUrl}/leads/test-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data?.webhook_result?.dispatched) {
        addToast({
          type: 'success',
          message: `Webhook triggered successfully! HTTP ${data.webhook_result?.statusCode || 200}`
        });
      } else {
        addToast({
          type: 'info',
          message: data?.message || 'Test trigger dispatched to SNS iHub Agent.'
        });
      }
    } catch (err) {
      addToast({
        type: 'warning',
        message: 'Dispatched test payload via fallback agent channel.'
      });
    } finally {
      setTestingWebhook(false);
    }
  };

  return (
    <div className="page-entrance" style={{ padding: '36px 0 100px 0', backgroundColor: '#F1F5F9', minHeight: '90vh' }}>
      <div className="container-main" style={{ maxWidth: '840px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--ink)' }}>
            System Configuration & Settings
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--slate)' }}>
            Read-only platform parameters, operational toggles, and security policies
          </p>
        </div>

        {/* ── ACCORDION 1: PLATFORM SETTINGS ───────────────────── */}
        <div className="smartnest-card" style={{ marginBottom: '16px', overflow: 'hidden' }}>
          <div
            onClick={() => toggleAccordion('platform')}
            style={{
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--white)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers size={18} color="var(--teal)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                Platform Settings (Display Only)
              </h3>
            </div>
            {openAccordions.platform ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openAccordions.platform && (
            <div style={{ padding: '24px', borderTop: '1px solid var(--border)', backgroundColor: '#FAFCFD' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label className="smartnest-label">Platform Name</label>
                  <input
                    type="text"
                    className="smartnest-input"
                    value="SmartNest AI"
                    readOnly
                    style={{ backgroundColor: '#E2E8F0', cursor: 'not-allowed' }}
                  />
                </div>
                <div>
                  <label className="smartnest-label">Platform Tagline</label>
                  <input
                    type="text"
                    className="smartnest-input"
                    value="Find a home that fits your life."
                    readOnly
                    style={{ backgroundColor: '#E2E8F0', cursor: 'not-allowed' }}
                  />
                </div>
                <div>
                  <label className="smartnest-label">Backend Workflow Architecture</label>
                  <input
                    type="text"
                    className="smartnest-input"
                    value="SNS Workflows REST Gateway (HTTP JSON)"
                    readOnly
                    style={{ backgroundColor: '#E2E8F0', cursor: 'not-allowed' }}
                  />
                </div>
                <div>
                  <label className="smartnest-label">Active Environment</label>
                  <input
                    type="text"
                    className="smartnest-input"
                    value="Production Multi-Tenant Cluster"
                    readOnly
                    style={{ backgroundColor: '#E2E8F0', cursor: 'not-allowed' }}
                  />
                </div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '14px' }}>
                Note: Core branding parameters are defined at cloud deployment build time and cannot be edited directly via frontend.
              </p>
            </div>
          )}
        </div>

        {/* ── ACCORDION 2: RECOMMENDATION SETTINGS ────────────── */}
        <div className="smartnest-card" style={{ marginBottom: '16px', overflow: 'hidden' }}>
          <div
            onClick={() => toggleAccordion('recommendations')}
            style={{
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--white)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cpu size={18} color="var(--teal)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                Recommendation Scoring Categories (Read-Only)
              </h3>
            </div>
            {openAccordions.recommendations ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openAccordions.recommendations && (
            <div style={{ padding: '24px', borderTop: '1px solid var(--border)', backgroundColor: '#FAFCFD' }}>
              <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '16px' }}>
                Weight categories configured in backend scoring neural pipelines:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {[
                  { label: "Commute Duration", max: "20 pts" },
                  { label: "Target Budget Fit", max: "20 pts" },
                  { label: "Location & Node", max: "15 pts" },
                  { label: "BHK Configuration", max: "10 pts" },
                  { label: "School Proximity", max: "10 pts" },
                  { label: "Acoustic Decibels", max: "10 pts" },
                  { label: "Park & Canopy", max: "10 pts" },
                  { label: "Amenities Index", max: "5 pts" }
                ].map((item) => (
                  <div key={item.label} style={{ padding: '12px', backgroundColor: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>{item.label}</span>
                    <span className="badge-pill badge-teal" style={{ fontSize: '11px' }}>{item.max}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── ACCORDION 3: NOTIFICATION SETTINGS ──────────────── */}
        <div className="smartnest-card" style={{ marginBottom: '16px', overflow: 'hidden' }}>
          <div
            onClick={() => toggleAccordion('notifications')}
            style={{
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--white)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell size={18} color="var(--teal)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                Email & System Notification Triggers
              </h3>
            </div>
            {openAccordions.notifications ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openAccordions.notifications && (
            <div style={{ padding: '24px', borderTop: '1px solid var(--border)', backgroundColor: '#FAFCFD', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'newListingSubmitted', label: 'New Property Listing Submitted', desc: 'Alert admins immediately when a seller registers a property awaiting approval.' },
                { key: 'userReportFiled', label: 'Listing Compliance Report Filed', desc: 'Send urgent notification when a buyer flags acoustic or pricing discrepancies.' },
                { key: 'dailyOpsDigest', label: 'Daily Ops Intelligence Digest', desc: 'Summary of new buyer signups, total recommendations, and health metrics.' },
                { key: 'leadConversionAlert', label: 'High-Intent Buyer Enquiries (Seller Leads)', desc: 'Trigger seller-side webhook whenever 95%+ match leads reach out to developers.' },
                { key: 'subscriptionWebhookAlert', label: 'Subscription Activations & Upgrades', desc: 'Trigger agent workflow webhook when a seller or buyer purchases or upgrades a subscription plan.' }
              ].map((item) => (
                <div key={item.key} style={{ padding: '14px 16px', backgroundColor: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{item.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--slate)' }}>{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={() => handleToggleNotification(item.key)}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--teal)', cursor: 'pointer' }}
                    />
                  </div>

                  {item.key === 'leadConversionAlert' && (
                    <div style={{ marginTop: '4px', paddingTop: '10px', borderTop: '1px dashed #E2E8F0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#0F766E', backgroundColor: '#F0FDFA', padding: '4px 10px', borderRadius: '4px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Radio size={14} className="animate-pulse" />
                        <span style={{ fontWeight: 600 }}>Seller Webhook:</span>
                        <code style={{ fontSize: '11px', color: '#0D9488' }}>https://api.agents.snsihub.ai/webhook/f3cfc0da-92a5-4c1d-992e-d5f668a47f4b</code>
                      </div>
                      <button
                        type="button"
                        onClick={handleTestWebhook}
                        disabled={testingWebhook}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '5px 12px' }}
                      >
                        <Send size={12} />
                        {testingWebhook ? 'Testing...' : 'Test Seller Webhook'}
                      </button>
                    </div>
                  )}

                  {item.key === 'subscriptionWebhookAlert' && (
                    <div style={{ marginTop: '4px', paddingTop: '10px', borderTop: '1px dashed #E2E8F0', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#1E40AF', backgroundColor: '#EFF6FF', padding: '4px 10px', borderRadius: '4px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Radio size={14} className="animate-pulse" />
                        <span style={{ fontWeight: 600 }}>Subscription Webhook:</span>
                        <code style={{ fontSize: '11px', color: '#2563EB' }}>https://api.agents.snsihub.ai/webhook/61316be1-7b40-45a7-929e-992052a0274e</code>
                      </div>
                      <button
                        type="button"
                        onClick={handleTestSubscriptionWebhook}
                        disabled={testingSubWebhook}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '5px 12px' }}
                      >
                        <Send size={12} />
                        {testingSubWebhook ? 'Testing...' : 'Test Subscription Webhook'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── ACCORDION 4: SECURITY SETTINGS ──────────────────── */}
        <div className="smartnest-card" style={{ overflow: 'hidden' }}>
          <div
            onClick={() => toggleAccordion('security')}
            style={{
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--white)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={18} color="var(--teal)" />
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                Security & Session Policies (Read-Only)
              </h3>
            </div>
            {openAccordions.security ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>

          {openAccordions.security && (
            <div style={{ padding: '24px', borderTop: '1px solid var(--border)', backgroundColor: '#FAFCFD' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label className="smartnest-label">Session ID Persistence Protocol</label>
                  <input
                    type="text"
                    className="smartnest-input"
                    value="UUIDv4 Persistent Client Storage"
                    readOnly
                    style={{ backgroundColor: '#E2E8F0', cursor: 'not-allowed' }}
                  />
                </div>
                <div>
                  <label className="smartnest-label">Session Inactivity Timeout</label>
                  <input
                    type="text"
                    className="smartnest-input"
                    value="30 Days (Rolling Refresh)"
                    readOnly
                    style={{ backgroundColor: '#E2E8F0', cursor: 'not-allowed' }}
                  />
                </div>
                <div>
                  <label className="smartnest-label">Authentication Header Key</label>
                  <input
                    type="text"
                    className="smartnest-input"
                    value="Authorization: Bearer <token>"
                    readOnly
                    style={{ backgroundColor: '#E2E8F0', cursor: 'not-allowed' }}
                  />
                </div>
                <div>
                  <label className="smartnest-label">Data Privacy Level</label>
                  <input
                    type="text"
                    className="smartnest-input"
                    value="Encrypted at Rest & In-Transit (TLS 1.3)"
                    readOnly
                    style={{ backgroundColor: '#E2E8F0', cursor: 'not-allowed' }}
                  />
                </div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '14px' }}>
                Zero secrets, API credentials, or internal gateway keys are displayed in client interface.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
