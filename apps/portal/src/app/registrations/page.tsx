"use client";

import React, { useEffect, useState } from 'react';
import { PortalNav } from '@/components/PortalNav';
import { portalApi } from '@/lib/api';

export default function RegistrationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    portalApi('/me/registrations').then((r) => setItems(r.data ?? [])).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const statusColor = (s: string) => s === 'CONFIRMED' ? '#dcfce7' : s === 'CANCELLED' ? '#fee2e2' : '#fef9c3';
  const statusText = (s: string) => s === 'CONFIRMED' ? '#16a34a' : s === 'CANCELLED' ? '#dc2626' : '#ca8a04';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <PortalNav />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>My Registrations</h1>

        {isLoading ? <p style={{ color: '#94a3b8' }}>Loading…</p> : items.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: 48, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#94a3b8', marginBottom: 16 }}>You haven't registered for any events yet.</p>
            <a href="/events" style={{ color: '#6366f1', fontWeight: 500 }}>Browse Events →</a>
          </div>
        ) : items.map((reg: any) => (
          <div key={reg.id} style={{
            background: '#fff', borderRadius: 12, padding: 20, marginBottom: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{reg.event?.title ?? 'Event'}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Ref: {reg.id.slice(0, 8)}… · {new Date(reg.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ background: statusColor(reg.status), color: statusText(reg.status), borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 500 }}>
                  {reg.status}
                </span>
                <span style={{ background: reg.paymentStatus === 'PAID' ? '#dcfce7' : '#fef9c3', color: reg.paymentStatus === 'PAID' ? '#16a34a' : '#ca8a04', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 500 }}>
                  {reg.paymentStatus}
                </span>
              </div>
            </div>
            {(reg.attendees ?? []).length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>ATTENDEES</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {reg.attendees.map((a: any) => (
                    <div key={a.id} style={{
                      background: '#f8fafc', borderRadius: 8, padding: '6px 12px', fontSize: 13,
                      display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #e2e8f0',
                    }}>
                      {a.fullName}
                      <span style={{
                        background: a.checkInStatus === 'CHECKED_IN' ? '#dcfce7' : '#f1f5f9',
                        color: a.checkInStatus === 'CHECKED_IN' ? '#16a34a' : '#64748b',
                        borderRadius: 10, padding: '1px 8px', fontSize: 11, fontWeight: 500,
                      }}>{a.checkInStatus?.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
