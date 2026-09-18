import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { SmartNestBrand } from '../shared/SmartNestBrand';
import { formatCurrency } from '../../services/subscriptionConfig';

export const InvoiceModal = ({ isOpen, invoice, onClose }) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(13, 27, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="smartnest-card"
        style={{
          width: '100%',
          maxWidth: '600px',
          padding: '36px',
          borderRadius: 'var(--radius-modal)',
          boxShadow: 'var(--shadow-modal)',
          backgroundColor: '#FFFFFF',
          animation: 'fadeUpPage 200ms ease-out',
          border: '1px solid var(--border)'
        }}
      >
        {/* Top Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <SmartNestBrand
            orientation="horizontal"
            withTagline={true}
            iconSize={36}
            textSize="20px"
            taglineSize="10.5px"
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-ghost"
              style={{ padding: '6px 12px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={15} /> Print / Save
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--slate)',
                cursor: 'pointer',
                padding: '4px'
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border)',
            marginBottom: '20px'
          }}
        >
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Tax Invoice
            </span>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink)', marginTop: '2px' }}>
              {invoice.invoice_id}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--slate)', marginTop: '4px' }}>
              Issued: {new Date(invoice.issued_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge-pill badge-teal" style={{ fontSize: '12px', padding: '4px 10px' }}>
              <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {invoice.status}
            </span>
            <div style={{ fontSize: '12px', color: 'var(--slate)', marginTop: '6px' }}>
              Method: {invoice.payment_method || 'Verified Online'}
            </div>
          </div>
        </div>

        {/* Billed To */}
        <div style={{ marginBottom: '24px', fontSize: '13.5px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', marginBottom: '4px' }}>
            Billed To:
          </div>
          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{invoice.customer_name}</div>
          <div style={{ color: 'var(--slate)' }}>{invoice.customer_email}</div>
          <div style={{ color: 'var(--slate)', fontSize: '12.5px', marginTop: '2px' }}>Role: {invoice.role === 'seller' ? 'Property Seller' : 'Home Buyer'}</div>
        </div>

        {/* Invoice Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--slate)', fontSize: '12px', textTransform: 'uppercase' }}>
              <th style={{ padding: '8px 0' }}>Description</th>
              <th style={{ padding: '8px 0', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
              <td style={{ padding: '12px 0', color: 'var(--ink)', fontWeight: 500 }}>
                SmartNest {invoice.plan_name} Subscription
              </td>
              <td style={{ padding: '12px 0', textAlign: 'right', color: 'var(--ink)', fontWeight: 600 }}>
                {formatCurrency(invoice.base_amount || invoice.amount, invoice.currency)}
              </td>
            </tr>
            <tr style={{ color: 'var(--slate)', fontSize: '12.5px' }}>
              <td style={{ padding: '6px 0' }}>CGST (9%)</td>
              <td style={{ padding: '6px 0', textAlign: 'right' }}>
                {formatCurrency(invoice.cgst_9_pct || 0, invoice.currency)}
              </td>
            </tr>
            <tr style={{ color: 'var(--slate)', fontSize: '12.5px' }}>
              <td style={{ padding: '6px 0' }}>SGST (9%)</td>
              <td style={{ padding: '6px 0', textAlign: 'right' }}>
                {formatCurrency(invoice.sgst_9_pct || 0, invoice.currency)}
              </td>
            </tr>
            <tr style={{ borderTop: '2px solid var(--border)', fontWeight: 700, fontSize: '15px', color: 'var(--ink)' }}>
              <td style={{ padding: '12px 0' }}>Total Paid</td>
              <td style={{ padding: '12px 0', textAlign: 'right', color: 'var(--teal)' }}>
                {formatCurrency(invoice.amount, invoice.currency)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer info */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            color: 'var(--slate)',
            lineHeight: 1.45,
            border: '1px solid var(--border)'
          }}
        >
          SmartNest AI Real Estate Intelligence Platform • GSTIN: 33AAAAA0000A1Z5 • Support: billing@smartnest.ai
        </div>
      </div>
    </div>
  );
};
