"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@afc-sear/ui';
import { Plus, DollarSign, CreditCard, Heart, ArrowUpRight } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

type Tab = 'funds' | 'payments' | 'donations';

function formatAmount(minor: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency', currency, minimumFractionDigits: 2,
  }).format(minor / 100);
}

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>('funds');
  const [data, setData] = useState<{ funds: any[]; payments: any[]; donations: any[] }>({
    funds: [], payments: [], donations: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchApi('/admin/finance/funds').then((r) => r.data ?? []).catch(() => []),
      fetchApi('/admin/finance/payments').then((r) => r.data ?? []).catch(() => []),
      fetchApi('/admin/finance/donations').then((r) => r.data ?? []).catch(() => []),
    ]).then(([funds, payments, donations]) => {
      setData({ funds, payments, donations });
    }).finally(() => setIsLoading(false));
  }, []);

  const paymentStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID': case 'AUTHORIZED': return 'success';
      case 'PENDING': return 'warning';
      case 'FAILED': case 'REFUNDED': return 'danger';
      default: return 'default';
    }
  };

  const tabs = [
    { key: 'funds' as Tab, label: 'Funds', icon: DollarSign, count: data.funds.length },
    { key: 'payments' as Tab, label: 'Payments', icon: CreditCard, count: data.payments.length },
    { key: 'donations' as Tab, label: 'Donations', icon: Heart, count: data.donations.length },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
        {tab === 'funds' && (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />New Fund
          </Button>
        )}
      </div>

      <div className="flex border-b">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">{count}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : tab === 'funds' ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b">
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Name</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Code</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Type</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Branch</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Donations</th>
              </tr></thead>
              <tbody>
                {data.funds.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-500">No funds yet.</td></tr>
                ) : data.funds.map((f) => (
                  <tr key={f.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{f.name}</td>
                    <td className="p-4 font-mono text-sm">{f.code}</td>
                    <td className="p-4"><Badge variant={f.isRestricted ? 'warning' : 'default'}>{f.isRestricted ? 'Restricted' : 'General'}</Badge></td>
                    <td className="p-4 text-gray-500">{f.branch?.name ?? 'All branches'}</td>
                    <td className="p-4 text-gray-600">{f._count?.donations ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : tab === 'payments' ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b">
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Reference</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Provider</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Amount</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Receipt</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Date</th>
              </tr></thead>
              <tbody>
                {data.payments.length === 0 ? (
                  <tr><td colSpan={6} className="p-4 text-center text-gray-500">No payments yet.</td></tr>
                ) : data.payments.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono text-xs">{p.providerReference}</td>
                    <td className="p-4 text-gray-600">{p.provider}</td>
                    <td className="p-4 font-medium">{formatAmount(p.amountMinor, p.currencyCode)}</td>
                    <td className="p-4"><Badge variant={paymentStatusVariant(p.status)}>{p.status}</Badge></td>
                    <td className="p-4 text-gray-500">
                      {p.receipt ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs">
                          <ArrowUpRight className="h-3 w-3" />{p.receipt.receiptNumber}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="p-4 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b">
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Fund</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Amount</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Payment Status</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Donated At</th>
              </tr></thead>
              <tbody>
                {data.donations.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-500">No donations yet.</td></tr>
                ) : data.donations.map((d) => (
                  <tr key={d.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{d.fund?.name ?? '—'}</td>
                    <td className="p-4 font-medium">{d.payment ? formatAmount(d.payment.amountMinor, d.payment.currencyCode) : '—'}</td>
                    <td className="p-4"><Badge variant={paymentStatusVariant(d.payment?.status ?? '')}>{d.payment?.status ?? '—'}</Badge></td>
                    <td className="p-4 text-gray-500 text-xs">{new Date(d.donatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
