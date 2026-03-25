"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navLinks = [
  { href: '/dashboard', label: 'Home' },
  { href: '/profile', label: 'My Profile' },
  { href: '/household', label: 'Household' },
  { href: '/registrations', label: 'My Registrations' },
  { href: '/giving', label: 'My Giving' },
  { href: '/announcements', label: 'Announcements' },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export function PortalNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch(`${API_URL}/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Sign out error:', err);
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <header style={{
      background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
      color: '#fff',
      padding: '0',
      boxShadow: '0 2px 8px rgba(79,70,229,0.15)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 32 }}>
        <Link href="/dashboard" style={{ fontWeight: 700, fontSize: 18, color: '#fff', padding: '16px 0', letterSpacing: '-0.02em' }}>
          AFC Portal
        </Link>
        <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: '16px 12px',
                fontSize: 14,
                fontWeight: 500,
                color: pathname === href ? '#fff' : 'rgba(255,255,255,0.75)',
                borderBottom: pathname === href ? '2px solid #fff' : '2px solid transparent',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleSignOut}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
