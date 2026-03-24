"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge } from '@afc-sear/ui';
import { ArrowLeft, Save, Plus, Calendar, Ticket, Users } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PageProps { params: { id: string } }

const selectClass = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export default function EventEditPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = params;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'schedules' | 'tickets' | 'registrants'>('details');

  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    eventType: 'SERVICE',
    visibility: 'PUBLIC',
    registrationMode: 'OPEN',
    status: 'DRAFT',
  });
  const [schedules, setSchedules] = useState<any[]>([]);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [registrants, setRegistrants] = useState<any[]>([]);
  const [_count, setCount] = useState(0);

  // Schedule form
  const [schedForm, setSchedForm] = useState({ startsAt: '', endsAt: '', timezone: 'UTC', virtualJoinUrl: '' });
  const [ticketForm, setTicketForm] = useState({ name: '', priceMinor: '0', currencyCode: 'USD', capacity: '' });

  useEffect(() => {
    async function load() {
      try {
        const [eventRes, regRes] = await Promise.all([
          fetchApi(`/admin/events`).then((r) => (r.data || []).find((e: any) => e.id === id)),
          fetchApi(`/admin/events/${id}/registrations`).then((r) => r.data || []).catch(() => []),
        ]);
        if (eventRes) {
          setForm({
            title: eventRes.title || '',
            slug: eventRes.slug || '',
            summary: eventRes.summary || '',
            eventType: eventRes.eventType || 'SERVICE',
            visibility: eventRes.visibility || 'PUBLIC',
            registrationMode: eventRes.registrationMode || 'OPEN',
            status: eventRes.status || 'DRAFT',
          });
          setSchedules(eventRes.schedules || []);
          setTicketTypes(eventRes.ticketTypes || []);
          setCount((eventRes._count?.registrations ?? 0));
        }
        setRegistrants(regRes);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await fetchApi(`/admin/events/${id}`, { method: 'PATCH', body: JSON.stringify(form) });
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!schedForm.startsAt || !schedForm.endsAt) return;
    try {
      const result = await fetchApi(`/admin/events/${id}/schedules`, {
        method: 'POST', body: JSON.stringify(schedForm),
      });
      setSchedules((prev) => [...prev, result.data]);
      setSchedForm({ startsAt: '', endsAt: '', timezone: 'UTC', virtualJoinUrl: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddTicket = async () => {
    if (!ticketForm.name) return;
    try {
      const payload = {
        name: ticketForm.name,
        priceMinor: parseInt(ticketForm.priceMinor, 10) || 0,
        currencyCode: ticketForm.currencyCode,
        capacity: ticketForm.capacity ? parseInt(ticketForm.capacity, 10) : undefined,
      };
      const result = await fetchApi(`/admin/events/${id}/ticket-types`, {
        method: 'POST', body: JSON.stringify(payload),
      });
      setTicketTypes((prev) => [...prev, result.data]);
      setTicketForm({ name: '', priceMinor: '0', currencyCode: 'USD', capacity: '' });
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) return <div className="p-8 text-gray-500">Loading event...</div>;

  const statusVariant = (s: string) =>
    s === 'CHECKED_IN' ? 'success' : s === 'REGISTERED' ? 'default' : 'warning';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/events">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight flex-1">{form.title || 'Edit Event'}</h1>
        <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
          <Save className="h-4 w-4" />{isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Tabs */}
      <div className="flex border-b gap-1">
        {([['details', 'Details', null], ['schedules', 'Schedules', Calendar], ['tickets', 'Ticket Types', Ticket], ['registrants', 'Registrants', Users]] as any[]).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {Icon && <Icon className="h-4 w-4" />}{label}
            {key === 'registrants' && <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">{registrants.length}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
        <Card>
          <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Title</label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Slug</label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Summary</label>
              <Input value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[['eventType', 'Type', [['SERVICE','Service'],['CONFERENCE','Conference'],['CONCERT','Concert'],['MEETING','Meeting'],['WORKSHOP','Workshop'],['SOCIAL','Social'],['OTHER','Other']]],
                ['visibility', 'Visibility', [['PUBLIC','Public'],['MEMBER','Members Only'],['BRANCH','Branch Only'],['PRIVATE','Private']]],
                ['registrationMode', 'Registration', [['OPEN','Open'],['MEMBER_ONLY','Members Only'],['INVITATION_ONLY','Invitation Only'],['CLOSED','Closed']]],
                ['status', 'Status', [['DRAFT','Draft'],['PUBLISHED','Published'],['ARCHIVED','Archived']]],
              ].map(([field, label, opts]: any) => (
                <div key={field} className="space-y-1">
                  <label className="text-sm font-medium">{label}</label>
                  <select className={selectClass} value={(form as any)[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}>
                    {opts.map(([v, l]: string[]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Schedule</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Starts At</label>
                  <Input type="datetime-local" value={schedForm.startsAt} onChange={(e) => setSchedForm((f) => ({ ...f, startsAt: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Ends At</label>
                  <Input type="datetime-local" value={schedForm.endsAt} onChange={(e) => setSchedForm((f) => ({ ...f, endsAt: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Timezone</label>
                  <Input value={schedForm.timezone} onChange={(e) => setSchedForm((f) => ({ ...f, timezone: e.target.value }))} placeholder="e.g. Africa/Harare" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Virtual Join URL</label>
                  <Input value={schedForm.virtualJoinUrl} onChange={(e) => setSchedForm((f) => ({ ...f, virtualJoinUrl: e.target.value }))} placeholder="https://..." />
                </div>
              </div>
              <Button onClick={handleAddSchedule} className="flex items-center gap-2"><Plus className="h-4 w-4" />Add</Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              {schedules.length === 0 ? <p className="text-center text-gray-500 py-4">No schedules yet.</p> : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="h-9 px-3 text-left font-medium text-muted-foreground">Starts</th><th className="h-9 px-3 text-left font-medium text-muted-foreground">Ends</th><th className="h-9 px-3 text-left font-medium text-muted-foreground">Timezone</th></tr></thead>
                  <tbody>{schedules.map((s: any, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-3">{new Date(s.startsAt).toLocaleString()}</td>
                      <td className="p-3">{new Date(s.endsAt).toLocaleString()}</td>
                      <td className="p-3">{s.timezone}</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Add Ticket Type</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={ticketForm.name} onChange={(e) => setTicketForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. General Admission" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Price (minor units)</label>
                  <Input type="number" min={0} value={ticketForm.priceMinor} onChange={(e) => setTicketForm((f) => ({ ...f, priceMinor: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Capacity</label>
                  <Input type="number" min={0} value={ticketForm.capacity} onChange={(e) => setTicketForm((f) => ({ ...f, capacity: e.target.value }))} placeholder="Unlimited" />
                </div>
              </div>
              <Button onClick={handleAddTicket} className="flex items-center gap-2"><Plus className="h-4 w-4" />Add</Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              {ticketTypes.length === 0 ? <p className="text-center text-gray-500 py-4">No ticket types yet.</p> : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="h-9 px-3 text-left font-medium text-muted-foreground">Name</th><th className="h-9 px-3 text-left font-medium text-muted-foreground">Price</th><th className="h-9 px-3 text-left font-medium text-muted-foreground">Capacity</th></tr></thead>
                  <tbody>{ticketTypes.map((t: any) => (
                    <tr key={t.id} className="border-b">
                      <td className="p-3 font-medium">{t.name}</td>
                      <td className="p-3">{t.priceMinor === 0 ? 'Free' : `${t.currencyCode} ${(t.priceMinor / 100).toFixed(2)}`}</td>
                      <td className="p-3">{t.capacity ?? 'Unlimited'}</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'registrants' && (
        <Card>
          <CardContent className="pt-6">
            {registrants.length === 0 ? <p className="text-center text-gray-500 py-8">No registrations yet.</p> : (
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="h-9 px-3 text-left font-medium text-muted-foreground">ID</th><th className="h-9 px-3 text-left font-medium text-muted-foreground">Status</th><th className="h-9 px-3 text-left font-medium text-muted-foreground">Payment</th><th className="h-9 px-3 text-left font-medium text-muted-foreground">Attendees</th><th className="h-9 px-3 text-left font-medium text-muted-foreground">Date</th></tr></thead>
                <tbody>{registrants.map((r: any) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-3 font-mono text-xs">{r.id.slice(0, 8)}…</td>
                    <td className="p-3"><Badge variant="default">{r.status}</Badge></td>
                    <td className="p-3"><Badge variant={r.paymentStatus === 'PAID' ? 'success' : 'warning'}>{r.paymentStatus}</Badge></td>
                    <td className="p-3">{r.attendees?.map((a: any) => (
                      <span key={a.id} className="flex items-center gap-2 text-xs">
                        {a.fullName}
                        <Badge variant={statusVariant(a.checkInStatus)}>{a.checkInStatus}</Badge>
                      </span>
                    ))}</td>
                    <td className="p-3 text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
