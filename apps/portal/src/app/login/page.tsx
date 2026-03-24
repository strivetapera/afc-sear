"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { portalApi, setStoredToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await portalApi('/auth/sign-in', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (res.data?.session?.token) {
        setStoredToken(res.data.session.token);
      } else if (res.data?.token) {
        setStoredToken(res.data.token);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Sign-in failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 50%, #c7d2fe 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 400,
        boxShadow: '0 20px 60px rgba(79,70,229,0.2)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #4f46e5, #818cf8)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>A</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Welcome Back</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Sign in to your member portal</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>
              {error}
            </div>
          )}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Email or Phone</label>
            <input
              type="text"
              value={form.login}
              onChange={(e) => setForm((f) => ({ ...f, login: e.target.value }))}
              placeholder="you@example.com"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', transition: 'border-color 0.15s' }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              required
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              background: isLoading ? '#a5b4fc' : 'linear-gradient(135deg, #4f46e5, #6366f1)',
              color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontSize: 14,
              fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: 4,
              transition: 'opacity 0.15s',
            }}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
