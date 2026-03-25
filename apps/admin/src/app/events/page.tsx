"use client";

import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  Badge, 
  GradientText,
  DynamicContainer,
  Skeleton
} from '@afc-sear/ui';
import { 
  Plus, 
  Calendar, 
  Users, 
  Globe, 
  Edit, 
  MoreVertical, 
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import Link from 'next/link';
import { motion } from 'framer-motion';

type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'IN_REVIEW' | 'APPROVED';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApi('/admin/events')
      .then((r) => setEvents(r.data || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const statusVariant = (status: EventStatus) => {
    switch (status) {
      case 'PUBLISHED': return 'success';
      case 'DRAFT': return 'default';
      case 'IN_REVIEW': return 'warning';
      case 'ARCHIVED': return 'danger';
      case 'APPROVED': return 'premium';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-10">
      {/* Header section with Premium feel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Ministry Logistics</h4>
          <h1 className="text-4xl font-extrabold tracking-tight heading-premium">
            <GradientText>Event</GradientText> Management
          </h1>
          <p className="text-muted-foreground text-sm max-w-md">
            Organize services, conferences, and community gatherings with precision.
          </p>
        </div>
        <Link href="/events/new">
          <Button variant="primary" size="lg" className="shadow-xl">
            <Plus className="h-5 w-5 mr-2" />
            Create New Event
          </Button>
        </Link>
      </div>

      {/* Modern Filter Bar */}
      <div className="flex items-center gap-4 px-2">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search events by title or slug..." 
            className="w-full bg-card/50 border-2 border-border/50 rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-all shadow-sm"
          />
        </div>
        <Button variant="outline" size="md" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <Card className="overflow-hidden border-none shadow-premium bg-card/40 backdrop-blur-sm">
        <div className="relative w-full overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="h-14 px-6 text-left align-middle font-bold text-muted-foreground/60 uppercase tracking-widest text-[10px]">Event Information</th>
                <th className="h-14 px-6 text-left align-middle font-bold text-muted-foreground/60 uppercase tracking-widest text-[10px]">Type & Status</th>
                <th className="h-14 px-6 text-left align-middle font-bold text-muted-foreground/60 uppercase tracking-widest text-[10px]">Engagement</th>
                <th className="h-14 px-6 text-left align-middle font-bold text-muted-foreground/60 uppercase tracking-widest text-[10px]">Schedule</th>
                <th className="h-14 px-6 text-right align-middle font-bold text-muted-foreground/60 uppercase tracking-widest text-[10px]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="p-8"><Skeleton className="h-12 w-full" /></td>
                  </tr>
                ))
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <Calendar className="h-12 w-12 opacity-20" />
                      <p className="font-medium italic">No events found in the sanctuary records.</p>
                      <Button variant="outline" size="sm">Reset Workspace</Button>
                    </div>
                  </td>
                </tr>
              ) : (
                events.map((ev, i) => {
                  const nextSchedule = ev.schedules?.[0];
                  return (
                    <motion.tr 
                      key={ev.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group hover:bg-white/5 transition-colors cursor-default"
                    >
                      <td className="px-6 py-5 align-middle">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-indigo-500/10 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                            {ev.title.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">{ev.title}</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">slug: {ev.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-middle">
                        <div className="flex flex-col gap-2">
                          <Badge variant="gold" className="w-fit">{ev.eventType}</Badge>
                          <Badge variant={statusVariant(ev.status)} className="w-fit">{ev.status}</Badge>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-base">{ev._count?.registrations ?? 0}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Registrants</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-middle">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground/80">
                            {nextSchedule
                              ? new Date(nextSchedule.startsAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                              : 'TBD'}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Next Session</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-middle text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Link href={`/events/${ev.id}`}>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-primary/10 hover:text-primary">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <div className="h-4 w-[1px] bg-border/30 mx-1" />
                          <Link href={`/events/${ev.id}/registrants`}>
                             <Button variant="outline" size="sm" className="h-9 px-4 rounded-lg bg-transparent border-border/50 hover:border-primary">
                               Details
                               <ArrowRight className="h-3.5 w-3.5 ml-2" />
                             </Button>
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
