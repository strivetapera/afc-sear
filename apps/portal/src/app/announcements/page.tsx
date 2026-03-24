"use client";

import React, { useEffect, useState } from 'react';
import { PortalNav } from '@/components/PortalNav';
import { portalApi } from '@/lib/api';

export default function AnnouncementsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prayerForm, setPrayerForm] = useState({ requestText: '', visibility: 'PRIVATE' });
  const [prayerStatus, setPrayerStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');

  useEffect(() => {
    portalApi('/me/announcements').then((r) => setItems(r.data ?? [])).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const handlePrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrayerStatus('submitting');
    try {
      await portalApi('/me/prayer-requests', { method: 'POST', body: JSON.stringify(prayerForm) });
      setPrayerStatus('sent');
      setPrayerForm({ requestText: '', visibility: 'PRIVATE' });
      setTimeout(() => setPrayerStatus('idle'), 3000);
    } catch {
      setPrayerStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <PortalNav />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Announcements</h1>
          {isLoading ? <p style={{ color: '#94a3b8' }}>Loading…</p> : items.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, padding: 48, textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#94a3b8' }}>No announcements right now.</p>
            </div>
          ) : items.map((a: any) => (
            <div key={a.id} style={{
              background: '#fff', borderRadius: 12, padding: 20, marginBottom: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{a.title}</h2>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>
                {new Date(a.publishedAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {a.body && typeof a.body === 'object' && (a.body as any).text && (
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{(a.body as any).text}</p>
              )}
            </div>
          ))}
        </div>

        {/* Prayer request sidebar */}
        <div style={{ background: 'linear-gradient(135deg, #ede9fe, #f5f3ff)', borderRadius: 12, padding: 24, border: '1px solid #ddd6fe' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#4f46e5', marginBottom: 4 }}>🙏 Submit a Prayer Request</h2>
          <p style={{ fontSize: 13, color: '#6d28d9', marginBottom: 16 }}>Share what's on your heart with your pastoral team.</p>

          {prayerStatus === 'sent' ? (
            <div style={{ background: '#dcfce7', borderRadius: 8, padding: 16, color: '#16a34a', fontSize: 14, fontWeight: 500 }}>
              ✓ Your prayer request has been submitted.
            </div>
          ) : (
            <form onSubmit={handlePrayer} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea
                value={prayerForm.requestText}
                onChange={(e) => setPrayerForm((f) => ({ ...f, requestText: e.target.value }))}
                placeholder="Share your request…"
                required
                rows={4}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd6fe', borderRadius: 8, fontSize: 14, resize: 'vertical', outline: 'none', background: '#fff' }}
              />
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Visibility</label>
                <select
                  value={prayerForm.visibility}
                  onChange={(e) => setPrayerForm((f) => ({ ...f, visibility: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd6fe', borderRadius: 8, fontSize: 13, background: '#fff' }}
                >
                  <option value="PRIVATE">Private (pastoral team only)</option>
                  <option value="PUBLIC">Public (congregation)</option>
                </select>
              </div>
              {prayerStatus === 'error' && <p style={{ color: '#dc2626', fontSize: 12 }}>Failed to submit. Try again.</p>}
              <button
                type="submit"
                disabled={prayerStatus === 'submitting'}
                style={{
                  background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                  color: '#fff', border: 'none', borderRadius: 8, padding: '10px',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                {prayerStatus === 'submitting' ? 'Submitting…' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
