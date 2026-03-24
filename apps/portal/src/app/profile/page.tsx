"use client";

import React, { useEffect, useState } from 'react';
import { PortalNav } from '@/components/PortalNav';
import { portalApi } from '@/lib/api';

const card = {
  background: '#fff', borderRadius: 12, padding: 24,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
  borderRadius: 8, fontSize: 14, outline: 'none', background: '#f8fafc',
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', preferredName: '', phone: '' });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    portalApi('/me').then((r) => {
      setUser(r.data);
    }).catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      await portalApi('/me/profile', { method: 'PATCH', body: JSON.stringify(form) });
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <PortalNav />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>My Profile</h1>
        <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>Update your personal information.</p>

        <div style={{ ...card, marginBottom: 24 }}>
          <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: '#0f172a' }}>Account Info</h2>
          <div style={{ display: 'grid', gap: 4 }}>
            <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
              <span style={{ color: '#94a3b8', minWidth: 80 }}>Email</span>
              <span style={{ fontWeight: 500 }}>{user?.email ?? '—'}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
              <span style={{ color: '#94a3b8', minWidth: 80 }}>Status</span>
              <span style={{ fontWeight: 500 }}>{user?.status ?? '—'}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} style={card}>
          <h2 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: '#0f172a' }}>Personal Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {[
              ['First Name', 'firstName'],
              ['Last Name', 'lastName'],
              ['Preferred Name', 'preferredName'],
              ['Phone', 'phone'],
            ].map(([label, field]) => (
              <div key={field}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
                <input
                  type="text"
                  value={(form as any)[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  placeholder={`Your ${label.toLowerCase()}`}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={status === 'saving'}
            style={{
              background: status === 'saved' ? '#10b981' : 'linear-gradient(135deg, #4f46e5, #6366f1)',
              color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {status === 'saving' ? 'Saving…' : status === 'saved' ? '✓ Saved' : status === 'error' ? 'Error — retry' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
