"use client";

import React, { useEffect, useState } from 'react';
import { PortalNav } from '@/components/PortalNav';
import { portalApi } from '@/lib/api';
import Link from 'next/link';

const card = {
  background: '#fff', borderRadius: 12, padding: 24,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
};

const badge = (color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
  borderRadius: 20, fontSize: 12, fontWeight: 500,
  background: color === 'green' ? '#dcfce7' : color === 'yellow' ? '#fef9c3' : '#f1f5f9',
  color: color === 'green' ? '#16a34a' : color === 'yellow' ? '#ca8a04' : '#475569',
});

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [giving, setGiving] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      portalApi('/me').then((r) => setUser(r.data)).catch(() => {}),
      portalApi('/me/registrations').then((r) => setRegistrations((r.data ?? []).slice(0, 3))).catch(() => {}),
      portalApi('/me/announcements').then((r) => setAnnouncements((r.data ?? []).slice(0, 3))).catch(() => {}),
      portalApi('/me/giving').then((r) => setGiving(r.data ?? [])).catch(() => {}),
    ]);
  }, []);

  const totalGiving = giving.reduce((sum, d) => sum + (d.payment?.amountMinor ?? 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <PortalNav />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Hero greeting */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
            Welcome back{user ? `, ${user.email?.split('@')[0]}` : ''} 👋
          </h1>
          <p style={{ color: '#64748b', marginTop: 4 }}>Here's what's happening at your church.</p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Registrations', value: registrations.length, sub: 'this year', link: '/registrations', color: '#6366f1' },
            { label: 'Total Given', value: `$${(totalGiving / 100).toFixed(2)}`, sub: 'all time', link: '/giving', color: '#10b981' },
            { label: 'Announcements', value: announcements.length, sub: 'unread', link: '/announcements', color: '#f59e0b' },
          ].map(({ label, value, sub, link, color }) => (
            <Link key={label} href={link} style={{ ...card, display: 'block', borderTop: `3px solid ${color}` }}>
              <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{sub}</div>
            </Link>
          ))}
        </div>

        {/* Two-column content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Recent registrations */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Recent Registrations</h2>
              <Link href="/registrations" style={{ fontSize: 13, color: '#6366f1' }}>See all →</Link>
            </div>
            {registrations.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No registrations yet.</p>
            ) : registrations.map((r: any) => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{r.event?.title ?? 'Event'}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <span style={badge(r.status === 'CONFIRMED' ? 'green' : 'yellow')}>{r.status}</span>
              </div>
            ))}
          </div>

          {/* Announcements */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>Announcements</h2>
              <Link href="/announcements" style={{ fontSize: 13, color: '#6366f1' }}>See all →</Link>
            </div>
            {announcements.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No announcements.</p>
            ) : announcements.map((a: any) => (
              <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{a.title}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  {new Date(a.publishedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
