"use client";

import React, { useEffect, useState } from 'react';
import { PortalNav } from '@/components/PortalNav';
import { portalApi } from '@/lib/api';

export default function HouseholdPage() {
  const [household, setHousehold] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    portalApi('/me/household').then((r) => setHousehold(r.data)).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 12, padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <PortalNav />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>My Household</h1>

        {isLoading ? (
          <p style={{ color: '#94a3b8' }}>Loading household…</p>
        ) : !household ? (
          <div style={{ ...card, textAlign: 'center', padding: 48 }}>
            <p style={{ color: '#94a3b8' }}>No household linked to your account.</p>
          </div>
        ) : (
          <div style={card}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{household.displayName}</h2>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>Household ID: {household.id}</p>

            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Members</h3>
            {(household.members ?? []).length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No members listed.</p>
            ) : (household.members ?? []).map((m: any) => (
              <div key={m.personId} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: '1px solid #f1f5f9',
              }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{m.fullName}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'capitalize' }}>
                    {m.relationshipType?.toLowerCase().replace(/_/g, ' ') ?? ''}
                  </div>
                </div>
                {m.isPrimaryContact && (
                  <span style={{
                    background: '#ede9fe', color: '#6d28d9', borderRadius: 20,
                    padding: '2px 10px', fontSize: 11, fontWeight: 600,
                  }}>Primary Contact</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
