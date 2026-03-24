"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@afc-sear/ui';
import { Plus, Calendar, Users, Globe, Edit } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';
import Link from 'next/link';

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
      default: return 'default';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <Link href="/events/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b transition-colors hover:bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Event</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Next Date</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Registrations</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="p-4 text-center text-gray-500">Loading events...</td></tr>
                ) : events.length === 0 ? (
                  <tr><td colSpan={6} className="p-4 text-center text-gray-500">No events yet. Create your first event.</td></tr>
                ) : events.map((ev) => {
                  const nextSchedule = ev.schedules?.[0];
                  return (
                    <tr key={ev.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-medium">{ev.title}</span>
                          <span className="text-xs text-gray-400">/{ev.slug}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant="default">{ev.eventType}</Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge variant={statusVariant(ev.status)}>{ev.status}</Badge>
                      </td>
                      <td className="p-4 align-middle text-gray-500">
                        {nextSchedule
                          ? new Date(nextSchedule.startsAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
                          : '—'}
                      </td>
                      <td className="p-4 align-middle">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Users className="h-3.5 w-3.5" />
                          {ev._count?.registrations ?? 0}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/events/${ev.id}`}>
                            <Button variant="ghost" size="sm" title="Edit event">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/events/${ev.id}/registrants`}>
                            <Button variant="ghost" size="sm" title="View registrants">
                              <Users className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/events/${ev.id}`} title="View schedules">
                            <Button variant="ghost" size="sm">
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/api/v1/public/events/${ev.slug}`} target="_blank">
                            <Button variant="ghost" size="sm" title="Public page">
                              <Globe className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
