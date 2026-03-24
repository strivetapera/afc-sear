"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@afc-sear/ui';
import { Plus, Megaphone, Mail, FileText, Send, Clock } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

type Tab = 'announcements' | 'campaigns' | 'templates' | 'logs';

export default function CommunicationsPage() {
  const [tab, setTab] = useState<Tab>('announcements');
  const [data, setData] = useState<{ announcements: any[]; campaigns: any[]; templates: any[]; logs: any[] }>({
    announcements: [], campaigns: [], templates: [], logs: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchApi('/admin/announcements').then((r) => r.data ?? []).catch(() => []),
      fetchApi('/admin/campaigns').then((r) => r.data ?? []).catch(() => []),
      fetchApi('/admin/message-templates').then((r) => r.data ?? []).catch(() => []),
      fetchApi('/admin/delivery-logs').then((r) => r.data ?? []).catch(() => []),
    ]).then(([announcements, campaigns, templates, logs]) => {
      setData({ announcements, campaigns, templates, logs });
    }).finally(() => setIsLoading(false));
  }, []);

  const tabs: { key: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { key: 'announcements', label: 'Announcements', icon: Megaphone, count: data.announcements.length },
    { key: 'campaigns', label: 'Campaigns', icon: Send, count: data.campaigns.length },
    { key: 'templates', label: 'Templates', icon: FileText, count: data.templates.length },
    { key: 'logs', label: 'Delivery Logs', icon: Mail, count: data.logs.length },
  ];

  const badgeVariant = (status: string): "default" | "success" | "warning" | "danger" | undefined => {
    switch (status?.toUpperCase()) {
      case 'SENT': case 'DELIVERED': return 'success';
      case 'DRAFT': case 'PENDING': return 'default';
      case 'FAILED': case 'BOUNCED': return 'danger';
      case 'SENDING': case 'APPROVED': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Communications</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {tab === 'announcements' ? 'New Announcement' : tab === 'campaigns' ? 'New Campaign' : tab === 'templates' ? 'New Template' : 'Refresh'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
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
          ) : tab === 'announcements' ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b">
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Title</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Visibility</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Published</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Branch</th>
              </tr></thead>
              <tbody>
                {data.announcements.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-500">No announcements yet.</td></tr>
                ) : data.announcements.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{a.title}</td>
                    <td className="p-4"><Badge variant="default">{a.visibility}</Badge></td>
                    <td className="p-4 text-gray-500">
                      {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : '— Draft'}
                    </td>
                    <td className="p-4 text-gray-500">{a.branch?.name ?? 'All branches'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : tab === 'campaigns' ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b">
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Name</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Channel</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Recipients</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Scheduled</th>
                <th className="h-10 px-4 text-right font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {data.campaigns.length === 0 ? (
                  <tr><td colSpan={6} className="p-4 text-center text-gray-500">No campaigns yet.</td></tr>
                ) : data.campaigns.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{c.name}</td>
                    <td className="p-4"><Badge variant="default">{c.channel}</Badge></td>
                    <td className="p-4"><Badge variant={badgeVariant(c.status)}>{c.status}</Badge></td>
                    <td className="p-4 text-gray-600">{c._count?.recipients ?? 0}</td>
                    <td className="p-4 text-gray-500">
                      {c.scheduledFor ? (
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(c.scheduledFor).toLocaleDateString()}</span>
                      ) : '—'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {c.status === 'DRAFT' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              fetchApi(`/admin/campaigns/${c.id}/approve`, { method: 'POST' })
                                .then(() => window.location.reload());
                            }}
                          >
                            Approve
                          </Button>
                        )}
                        {c.status === 'APPROVED' && (
                          <Button 
                            variant="primary" 
                            size="sm"
                            className="bg-primary text-white"
                            onClick={() => {
                              fetchApi(`/admin/campaigns/${c.id}/send`, { method: 'POST' })
                                .then(() => window.location.reload());
                            }}
                          >
                            Send
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : tab === 'templates' ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b">
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Key</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Channel</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Subject</th>
              </tr></thead>
              <tbody>
                {data.templates.length === 0 ? (
                  <tr><td colSpan={3} className="p-4 text-center text-gray-500">No templates yet.</td></tr>
                ) : data.templates.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono text-xs">{t.key}</td>
                    <td className="p-4"><Badge variant="default">{t.channel}</Badge></td>
                    <td className="p-4 text-gray-500">{t.subject ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="border-b">
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Channel</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Provider</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Campaign</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                <th className="h-10 px-4 text-left font-medium text-muted-foreground">Time</th>
              </tr></thead>
              <tbody>
                {data.logs.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-500">No delivery logs yet.</td></tr>
                ) : data.logs.map((l) => (
                  <tr key={l.id} className="border-b hover:bg-muted/50">
                    <td className="p-4"><Badge variant="default">{l.channel}</Badge></td>
                    <td className="p-4 text-gray-600">{l.provider}</td>
                    <td className="p-4 text-gray-500">{l.campaign?.name ?? '—'}</td>
                    <td className="p-4"><Badge variant={badgeVariant(l.status)}>{l.status}</Badge></td>
                    <td className="p-4 text-gray-500 text-xs">{new Date(l.createdAt).toLocaleString()}</td>
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
