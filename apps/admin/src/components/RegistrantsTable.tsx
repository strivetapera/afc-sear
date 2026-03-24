'use client';

import { useState } from 'react';
import { Button, Badge } from '@afc-sear/ui';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';

interface Attendee {
  id: string;
  fullName: string;
  registrationId: string;
  status: string;
  paid: boolean;
  date: string;
  checkInStatus: string;
  metadata?: {
    email?: string;
  };
  ticketType: {
    name: string;
  };
}

interface RegistrantsTableProps {
  initialAttendees: Attendee[];
  eventId: string;
}

export function RegistrantsTable({ initialAttendees, eventId }: RegistrantsTableProps) {
  const [attendees, setAttendees] = useState(initialAttendees);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const handleCheckIn = async (attendeeId: string) => {
    setLoadingIds((prev) => new Set(prev).add(attendeeId));
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/v1/admin/events/${eventId}/check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In a real app, we'd include the auth token here if not handled by a proxy/middleware
        },
        body: JSON.stringify({ attendeeId }),
      });

      if (!response.ok) throw new Error('Failed to check in');

      // Update local state
      setAttendees((prev) =>
        prev.map((a) =>
          a.id === attendeeId ? { ...a, checkInStatus: 'CHECKED_IN' } : a
        )
      );
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Failed to record check-in. Please try again.');
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(attendeeId);
        return next;
      });
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
          <tr>
            <th className="px-6 py-4">Attendee</th>
            <th className="px-6 py-4">Ticket Type</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Payment</th>
            <th className="px-6 py-4">Check-in</th>
            <th className="px-6 py-4 text-right">Registered</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {attendees.map((reg) => (
            <tr key={reg.id} className="hover:bg-zinc-50/50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-semibold text-zinc-900">{reg.fullName}</div>
                <div className="text-zinc-500">{reg.metadata?.email || 'No Email'}</div>
              </td>
              <td className="px-6 py-4">
                <Badge variant="default">{reg.ticketType.name}</Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5">
                  {reg.status === 'CONFIRMED' ? (
                    <CheckCircle2 size={14} className="text-green-600" />
                  ) : (
                    <Clock size={14} className="text-amber-500" />
                  )}
                  <span className={reg.status === 'CONFIRMED' ? 'text-green-700' : 'text-amber-700'}>
                    {reg.status}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                {reg.paid ? (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Paid
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-600/10">
                    Unpaid
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                {reg.checkInStatus === 'CHECKED_IN' ? (
                  <div className="flex items-center gap-1.5 text-green-700 font-medium">
                    <CheckCircle2 size={16} />
                    Checked In
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                    onClick={() => handleCheckIn(reg.id)}
                    disabled={loadingIds.has(reg.id)}
                  >
                    {loadingIds.has(reg.id) ? (
                      <Loader2 size={14} className="animate-spin mr-2" />
                    ) : null}
                    Check In
                  </Button>
                )}
              </td>
              <td className="px-6 py-4 text-right text-zinc-500">
                {reg.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
