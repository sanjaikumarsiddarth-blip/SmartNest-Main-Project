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
  Check
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
    leadConversionAlert: true
  });

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
                { key: 'leadConversionAlert', label: 'High-Intent Buyer Enquiries', desc: 'Trigger webhook whenever 95%+ match leads reach out to developers.' }
              ].map((item) => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
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
