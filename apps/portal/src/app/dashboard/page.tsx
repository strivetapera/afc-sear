"use client";

import React, { useEffect, useState } from 'react';
import { PortalNav } from '@/components/PortalNav';
import { portalApi } from '@/lib/api';
import { usePortalAuth, UserRole } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

interface QuickAction {
  label: string;
  href: string;
  icon: string;
  color: string;
  roles: UserRole[];
}

const quickActions: QuickAction[] = [
  { label: 'My Profile', href: '/profile', icon: '👤', color: '#6366f1', roles: ['member', 'leader', 'staff', 'branch_admin', 'super_admin'] },
  { label: 'My Household', href: '/household', icon: '🏠', color: '#10b981', roles: ['member', 'leader', 'staff', 'branch_admin', 'super_admin'] },
  { label: 'My Registrations', href: '/registrations', icon: '📋', color: '#f59e0b', roles: ['member', 'leader', 'staff', 'branch_admin', 'super_admin'] },
  { label: 'My Giving', href: '/giving', icon: '💰', color: '#ef4444', roles: ['member', 'leader', 'staff', 'branch_admin', 'super_admin'] },
  { label: 'Announcements', href: '/announcements', icon: '📢', color: '#8b5cf6', roles: ['member', 'leader', 'staff', 'branch_admin', 'super_admin'] },
  { label: 'Event Check-In', href: '/checkin', icon: '✅', color: '#14b8a6', roles: ['leader', 'staff', 'branch_admin', 'super_admin'] },
];

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, hasRole } = usePortalAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [giving, setGiving] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        portalApi('/me').then((r) => setUserData(r.data)).catch(() => {}),
        portalApi('/me/registrations').then((r) => setRegistrations((r.data ?? []).slice(0, 3))).catch(() => {}),
        portalApi('/me/announcements').then((r) => setAnnouncements((r.data ?? []).slice(0, 3))).catch(() => {}),
        portalApi('/me/giving').then((r) => setGiving(r.data ?? [])).catch(() => {}),
      ]);
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b' }}>Loading your portal...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const roleLabel = hasRole('super_admin') ? 'Super Admin' 
    : hasRole('branch_admin') ? 'Branch Administrator'
    : hasRole('leader') ? 'Ministry Leader'
    : hasRole('staff') ? 'Staff Member'
    : hasRole('visitor') ? 'Visitor'
    : 'Member';

  const totalGiving = giving.reduce((sum, d) => sum + (d.payment?.amountMinor ?? 0), 0);

  const visibleActions = quickActions.filter(action => 
    action.roles.some(role => hasRole(role as UserRole))
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <PortalNav />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Hero greeting */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
              Welcome back{userData ? `, ${userData.name || user.email?.split('@')[0]}` : ''} 👋
            </h1>
            <p style={{ color: '#64748b', marginTop: 4 }}>
              Here's what's happening at your church{user.branchName ? ` - ${user.branchName}` : ''}.
            </p>
            <div style={{ marginTop: 8 }}>
              <span style={{ 
                display: 'inline-flex', alignItems: 'center', padding: '4px 12px', 
                background: hasRole('super_admin') ? '#fef3c7' : '#e0e7ff',
                color: hasRole('super_admin') ? '#92400e' : '#4338ca',
                borderRadius: 20, fontSize: 12, fontWeight: 500
              }}>
                {roleLabel}
              </span>
            </div>
          </div>
          
          {/* Quick action buttons */}
          {hasRole(['branch_admin', 'super_admin']) && (
            <Link 
              href="/admin" 
              style={{ 
                padding: '10px 20px', background: '#4f46e5', color: '#fff', 
                borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none'
              }}
            >
              Go to Admin Panel →
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Registrations', value: registrations.length, sub: 'this year', link: '/registrations', color: '#6366f1' },
            { label: 'Total Given', value: `$${(totalGiving / 100).toFixed(2)}`, sub: 'all time', link: '/giving', color: '#10b981' },
            { label: 'Announcements', value: announcements.length, sub: 'unread', link: '/announcements', color: '#f59e0b' },
          ].map(({ label, value, sub, link, color }) => (
            <Link key={label} href={link} style={{ ...card, display: 'block', borderTop: `3px solid ${color}`, textDecoration: 'none' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 4 }}>{label}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{sub}</div>
            </Link>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0f172a', marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {visibleActions.map((action) => (
              <Link 
                key={action.href}
                href={action.href}
                style={{ 
                  ...card, display: 'flex', alignItems: 'center', gap: 12,
                  textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = card.boxShadow;
                }}
              >
                <span style={{ fontSize: 24 }}>{action.icon}</span>
                <span style={{ fontWeight: 500, color: '#0f172a' }}>{action.label}</span>
              </Link>
            ))}
          </div>
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
                  {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : 'Recently posted'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
