"use client";

import React, { useEffect, useState } from 'react';
import { PortalNav } from '@/components/PortalNav';
import { portalApi } from '@/lib/api';

export default function GivingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    portalApi('/me/giving').then((r) => setItems(r.data ?? [])).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const total = items.reduce((sum, d) => sum + (d.payment?.amountMinor ?? 0), 0);
  const currency = items[0]?.payment?.currencyCode ?? 'USD';

  const fmt = (minor: number, c: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).format(minor / 100);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <PortalNav />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>My Giving</h1>
          {items.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>{fmt(total, currency)}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Total given</div>
            </div>
          )}
        </div>

        {isLoading ? <p style={{ color: '#94a3b8' }}>Loading…</p> : items.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: 48, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#94a3b8' }}>No giving records yet.</p>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Date', 'Fund', 'Amount', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((d: any) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontSize: 14, color: '#64748b' }}>{new Date(d.donatedAt).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{d.fund?.name ?? '—'}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{d.fund?.code}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#10b981' }}>
                      {d.payment ? fmt(d.payment.amountMinor, d.payment.currencyCode) : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: d.payment?.status === 'PAID' ? '#dcfce7' : '#fef9c3',
                        color: d.payment?.status === 'PAID' ? '#16a34a' : '#ca8a04',
                        borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 500,
                      }}>{d.payment?.status ?? 'PENDING'}</span>
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
}
