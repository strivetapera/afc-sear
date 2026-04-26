import { Button, Card, Badge, Input } from '@afc-sear/ui';
import { ArrowLeft, Search, Download } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { RegistrantsTable } from '@/components/RegistrantsTable';

async function getRegistrations(eventId: string, cookieHeader: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const response = await fetch(`${apiUrl}/api/v1/admin/events/${eventId}/registrations`, {
    cache: 'no-store',
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
  const json = await response.json();
  return json.data || [];
}

async function getWaitlist(eventId: string, cookieHeader: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const response = await fetch(`${apiUrl}/api/v1/admin/events/${eventId}/waitlist`, {
    cache: 'no-store',
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
  const json = await response.json();
  return json.data || [];
}

async function getEvent(eventId: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const response = await fetch(`${apiUrl}/api/v1/public/events/list`, {
    cache: 'no-store',
  });
  const json = await response.json();
  return json.data?.find((e: any) => e.id === eventId);
}

export default async function RegistrantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const [registrations, waitlist] = await Promise.all([
    getRegistrations(id, cookieHeader),
    getWaitlist(id, cookieHeader),
  ]);
  const event = await getEvent(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/events">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{event?.title || 'Event Registrants'}</h1>
          <p className="text-zinc-500">
            Manage {registrations.length} registrations, {waitlist.length} waitlist entries, receipts, and check-in status.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input className="pl-10" placeholder="Search by name or email..." />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
             Mark Check-in
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <RegistrantsTable initialRegistrations={registrations} initialWaitlist={waitlist} eventId={id} />
      </Card>
    </div>
  );
}
