"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Input, 
  Badge,
  GradientText,
  GlassCard,
  DynamicContainer,
  Skeleton
} from '@afc-sear/ui';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Calendar, 
  Ticket, 
  Users, 
  ChevronRight,
  Globe,
  Settings,
  Shield,
  Activity
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface PageProps { params: Promise<{ id: string }> }

const selectClass = "flex h-12 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 text-sm text-foreground ring-offset-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 appearance-none cursor-pointer";

export default function EventEditPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = React.use(params);

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

  const statusVariant = (s: string) => {
    switch (s) {
        case 'PUBLISHED': return 'success';
        case 'DRAFT': return 'default';
        case 'APPROVED': return 'premium';
        case 'ARCHIVED': return 'danger';
        default: return 'warning';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-muted rounded-2xl w-full" />
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-8 h-[600px] bg-muted rounded-3xl" />
          <div className="col-span-4 h-[400px] bg-muted rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex items-center gap-6">
          <Link href="/events">
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-primary/10">
              <ArrowLeft className="h-5 w-5 text-primary" />
            </Button>
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Event Console</h4>
              <Badge variant={statusVariant(form.status) as any}>{form.status}</Badge>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight heading-premium">
              <GradientText>{form.title || 'Untitled Event'}</GradientText>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="md">Discard</Button>
          <Button variant="primary" size="md" onClick={handleSave} isLoading={isSaving} className="shadow-xl">
             <Save className="h-4.5 w-4.5 mr-2" />
             Save Changes
          </Button>
        </div>
      </div>

      {error && (
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl font-medium"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-12 gap-10">
        {/* Main Workspace */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Custom Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-muted/30 rounded-2xl w-fit backdrop-blur-sm">
            {[
              { id: 'details', label: 'Overview', icon: Settings },
              { id: 'schedules', label: 'Sessions', icon: Calendar },
              { id: 'tickets', label: 'Pricing', icon: Ticket },
              { id: 'registrants', label: 'Community', icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-6 py-2.5 text-sm font-bold transition-all duration-300 rounded-xl ${
                  activeTab === tab.id ? 'text-white' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab-bg"
                    className="absolute inset-0 bg-primary rounded-xl shadow-lg shadow-primary/30"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className={`relative z-10 h-4 w-4 ${activeTab === tab.id ? 'text-white' : ''}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          <DynamicContainer key={activeTab}>
            {activeTab === 'details' && (
              <div className="space-y-6">
                <Card className="p-8 space-y-8 border-none shadow-premium">
                  <div className="grid gap-6">
                    <Input 
                      label="Event Title" 
                      value={form.title} 
                      onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} 
                      placeholder="e.g. Master Class Worship 2026"
                    />
                    <div className="grid grid-cols-2 gap-6">
                      <Input 
                        label="URL Slug" 
                        value={form.slug} 
                        onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} 
                        placeholder="master-class-2026"
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-semibold tracking-tight text-muted-foreground ml-1">Event Type</label>
                        <div className="relative group">
                            <select className={selectClass} value={form.eventType} onChange={(e) => setForm(f => ({ ...f, eventType: e.target.value }))}>
                                <option value="SERVICE">Service</option>
                                <option value="CONFERENCE">Conference</option>
                                <option value="CONCERT">Concert</option>
                                <option value="MEETING">Meeting</option>
                            </select>
                            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 rotate-90 pointer-events-none opacity-40" />
                        </div>
                      </div>
                    </div>
                    <Input 
                      label="Brief Summary" 
                      value={form.summary} 
                      onChange={(e) => setForm(f => ({ ...f, summary: e.target.value }))} 
                      placeholder="A short description for event cards..."
                    />
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-6">
                  <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                      <Globe className="h-4 w-4" /> Visibility Settings
                    </div>
                    <div className="grid gap-4">
                        {[
                          ['Visibility', 'visibility', [['PUBLIC','Public Audience'],['MEMBER','Covenant Members'],['PRIVATE','Administrative Only']]],
                          ['Access Mode', 'registrationMode', [['OPEN','Everywhere'],['MEMBER_ONLY','Exclusive Members'],['CLOSED','Registration Suspended']]],
                        ].map(([label, field, opts]: any) => (
                          <div key={field} className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground ml-1">{label}</label>
                            <div className="relative group">
                                <select className={selectClass} value={(form as any)[field]} onChange={(e) => setForm(f => ({ ...f, [field]: e.target.value }))}>
                                    {opts.map(([v, l]: string[]) => <option key={v} value={v}>{l}</option>)}
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 rotate-90 pointer-events-none opacity-40" />
                            </div>
                          </div>
                        ))}
                    </div>
                  </Card>
                  
                  <Card className="p-6 bg-gradient-to-br from-primary to-indigo-700 text-white relative overflow-hidden group border-none shadow-2xl">
                    <div className="relative z-10 space-y-4">
                       <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-[0.2em] text-white/60">
                         <Shield className="h-4 w-4 text-white/80" /> Publication Status
                       </div>
                       <div className="grid gap-4">
                          <div className="flex flex-col gap-1">
                             <span className="text-xs font-bold text-white/40 ml-1 uppercase">Workflow State</span>
                             <select 
                                className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-sm rounded-xl p-3 focus:outline-none transition-all cursor-pointer font-bold"
                                value={form.status} 
                                onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                             >
                                <option value="DRAFT" className="text-black">Draft Version</option>
                                <option value="PUBLISHED" className="text-black">Live Production</option>
                                <option value="ARCHIVED" className="text-black">Archived Legacy</option>
                             </select>
                          </div>
                          <p className="text-xs text-white/70 leading-relaxed italic">
                             Setting to <strong>Live Production</strong> will expose this event to the public website and initiate automated registrations.
                          </p>
                       </div>
                    </div>
                    <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'schedules' && (
              <div className="space-y-8">
                <Card className="p-8 border-none shadow-premium space-y-6">
                   <div className="flex items-center justify-between">
                     <CardTitle className="text-xl">Add New Session</CardTitle>
                     <Badge variant="gold">UTC Standard</Badge>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <Input type="datetime-local" label="Session Start" value={schedForm.startsAt} onChange={(e) => setSchedForm(f => ({ ...f, startsAt: e.target.value }))} />
                      <Input type="datetime-local" label="Session End" value={schedForm.endsAt} onChange={(e) => setSchedForm(f => ({ ...f, endsAt: e.target.value }))} />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <Input label="Timezone String" value={schedForm.timezone} onChange={(e) => setSchedForm(f => ({ ...f, timezone: e.target.value }))} placeholder="e.g. Africa/Harare" />
                      <Input label="Virtual Connection (URL)" value={schedForm.virtualJoinUrl} onChange={(e) => setSchedForm(f => ({ ...f, virtualJoinUrl: e.target.value }))} placeholder="https://zoom.us/..." />
                   </div>
                   <Button variant="primary" onClick={async () => {
                        if (!schedForm.startsAt || !schedForm.endsAt) return;
                        const r = await fetchApi(`/admin/events/${id}/schedules`, { method: 'POST', body: JSON.stringify(schedForm) });
                        setSchedules(p => [...p, r.data]);
                        setSchedForm({ startsAt: '', endsAt: '', timezone: 'UTC', virtualJoinUrl: '' });
                   }} className="w-full">Initialize Session</Button>
                </Card>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">Active Schedules</h3>
                  {schedules.map((s, i) => (
                    <Card key={i} className="p-5 flex items-center justify-between group hover:border-primary/50">
                       <div className="flex items-center gap-6">
                          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                             <Calendar className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                             <span className="font-bold text-base">{new Date(s.startsAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</span>
                             <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{s.timezone} • {s.virtualJoinUrl ? 'Hybrid' : 'Physical Only'}</span>
                          </div>
                       </div>
                       <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">Edit</Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="space-y-8">
                <Card className="p-8 border-none shadow-premium space-y-6">
                    <CardTitle className="text-xl">Inventory & Pricing</CardTitle>
                    <div className="grid grid-cols-4 gap-6">
                        <div className="col-span-2"><Input label="Tier Name" value={ticketForm.name} onChange={(e) => setTicketForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. General Admission" /></div>
                        <Input label="Price (USD)" type="number" value={ticketForm.priceMinor} onChange={(e) => setTicketForm(f => ({ ...f, priceMinor: e.target.value }))} />
                        <Input label="Capacity" type="number" value={ticketForm.capacity} onChange={(e) => setTicketForm(f => ({ ...f, capacity: e.target.value }))} placeholder="999" />
                    </div>
                    <Button variant="primary" onClick={async () => {
                        if (!ticketForm.name) return;
                        const r = await fetchApi(`/admin/events/${id}/ticket-types`, { 
                            method: 'POST', body: JSON.stringify({ ...ticketForm, priceMinor: parseInt(ticketForm.priceMinor,10), capacity: ticketForm.capacity ? parseInt(ticketForm.capacity,10) : undefined }) 
                        });
                        setTicketTypes(p => [...p, r.data]);
                        setTicketForm({ name: '', priceMinor: '0', currencyCode: 'USD', capacity: '' });
                    }} className="w-full">Create Ticket Tier</Button>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    {ticketTypes.map((t, i) => (
                        <Card key={i} className="p-6 relative group border-2 border-transparent hover:border-primary/20 transition-all">
                             <div className="flex flex-col h-full justify-between gap-6">
                                <div className="space-y-2">
                                   <Badge variant="gold">TIER {i+1}</Badge>
                                   <div className="text-2xl font-black heading-premium tracking-tight">{t.name}</div>
                                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Limited Availability: {t.capacity ?? 'Infinite'}</p>
                                </div>
                                <div className="flex items-end justify-between">
                                   <div className="text-3xl font-bold tracking-tighter">
                                      {t.priceMinor === 0 ? <GradientText>FREE</GradientText> : `$${(t.priceMinor / 100).toFixed(2)}`}
                                   </div>
                                   <Button variant="ghost" size="sm" className="rounded-lg h-9 w-9 p-0 group-hover:bg-primary/10 transition-colors"><Edit className="h-4 w-4" /></Button>
                                </div>
                             </div>
                        </Card>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'registrants' && (
              <Card className="border-none shadow-premium overflow-hidden">
                <div className="bg-muted/30 p-4 border-b border-border/50 flex items-center justify-between px-6">
                   <div className="flex items-center gap-2 font-bold text-sm tracking-tight">
                      <Activity className="h-4 w-4 text-primary" />
                      Live Community Engagement
                   </div>
                   <Badge variant="premium">{registrants.length} Total Registrations</Badge>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30">
                          <th className="h-12 px-6 text-left font-bold uppercase text-[10px] tracking-widest opacity-40">Identity</th>
                          <th className="h-12 px-6 text-left font-bold uppercase text-[10px] tracking-widest opacity-40">Status</th>
                          <th className="h-12 px-6 text-left font-bold uppercase text-[10px] tracking-widest opacity-40">Attendees</th>
                          <th className="h-12 px-6 text-right font-bold uppercase text-[10px] tracking-widest opacity-40">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                        {registrants.map((reg) => (
                           <tr key={reg.id} className="hover:bg-muted/20 transition-colors">
                              <td className="px-6 py-4">
                                 <div className="flex flex-col">
                                    <span className="font-bold font-mono text-[11px] text-primary">{reg.id.slice(0, 8)}</span>
                                    <span className="text-[10px] font-bold uppercase opacity-60">Payment: {reg.paymentStatus}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4"><Badge variant={reg.status === 'CONFIRMED' ? 'success' : 'warning' as any}>{reg.status}</Badge></td>
                              <td className="px-6 py-4">
                                 <div className="flex flex-wrap gap-2">
                                    {reg.attendees?.map((a: any, ai: number) => (
                                       <div key={ai} className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/60 text-[10px] font-bold uppercase">
                                          {a.fullName}
                                          {a.checkInStatus === 'CHECKED_IN' && <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />}
                                       </div>
                                    ))}
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-right text-[11px] font-bold opacity-40">{new Date(reg.createdAt).toLocaleDateString()}</td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </Card>
            )}
          </DynamicContainer>
        </div>

        {/* Sidebar Analytics */}
        <div className="hidden lg:block lg:col-span-4 space-y-8">
           <GlassCard className="p-0 border-none">
              <div className="p-6 pb-2">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Quick Insights</h4>
                 <div className="mt-4 grid gap-6">
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-medium opacity-60">Total Revenue</span>
                       <span className="text-lg font-black tracking-tighter heading-premium">
                          ${(registrants.reduce((sum, r) => sum + (r.totalMinor || 0), 0) / 100).toFixed(2)}
                       </span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-medium opacity-60">Average Capacity</span>
                       <span className="text-lg font-black tracking-tighter heading-premium">
                          {Math.round((registrants.length / (ticketTypes.reduce((sum, t) => sum + (t.capacity || 100), 0) || 1)) * 100)}%
                       </span>
                    </div>
                 </div>
              </div>
              <div className="mt-4 bg-primary/5 p-6 rounded-b-[2rem] border-t border-primary/10">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                       <Activity className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                       <div className="text-sm font-bold tracking-tight">System Optimized</div>
                       <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest">Global delivery active</p>
                    </div>
                 </div>
              </div>
           </GlassCard>

           <Card className="p-6 space-y-4 border-dashed border-2 bg-transparent">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Workflow History</h4>
              <div className="space-y-4">
                 {[
                   { label: 'Event Created', time: '2 days ago', status: 'primary' },
                   { label: 'SEO Tags Optimized', time: 'Yesterday', status: 'premium' },
                   { label: 'Registration Opened', time: 'Live Now', status: 'success' },
                 ].map((log, i) => (
                   <div key={i} className="flex gap-4 relative">
                      {i !== 2 && <div className="absolute left-1.5 top-6 bottom-[-16px] w-[2px] bg-border/40" />}
                      <div className={`mt-1 h-3 w-3 rounded-full border-2 border-background ring-2 ring-primary/20 bg-primary`} />
                      <div className="space-y-0.5">
                         <div className="text-xs font-bold tracking-tight">{log.label}</div>
                         <div className="text-[10px] font-medium uppercase opacity-40">{log.time}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
