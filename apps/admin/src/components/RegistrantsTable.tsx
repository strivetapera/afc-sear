'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, Input } from '@afc-sear/ui';
import { CheckCircle2, CreditCard, Loader2, Users } from 'lucide-react';
import { fetchApi } from '@/lib/api-client';

interface RegistrationReceipt {
  id: string;
  receiptNumber: string;
  amountMinor: number;
  currencyCode: string;
  paymentMethod?: string | null;
  note?: string | null;
  receivedAt: string;
}

interface RegistrationAttendee {
  id: string;
  fullName: string;
  checkInStatus?: string;
  inventory?: {
    id: string;
    category: string;
    name: string;
  } | null;
  ticketType?: {
    id: string;
    name: string;
  } | null;
  metadata?: {
    email?: string;
    phone?: string;
    branchName?: string;
    ageGroup?: string;
  };
}

interface Registration {
  id: string;
  registrationCode: string;
  status: string;
  totalMinor: number;
  amountPaidMinor: number;
  amountOutstandingMinor: number;
  currencyCode: string;
  paymentStatus: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  createdAt: string;
  attendees: RegistrationAttendee[];
  receipts?: RegistrationReceipt[];
}

interface WaitlistEntry {
  id: string;
  waitlistCode: string;
  firstName: string;
  lastName: string;
  branchName?: string | null;
  ageGroup?: string | null;
  email?: string | null;
  phone?: string | null;
  status: string;
  inventory?: {
    id: string;
    category: string;
    name: string;
  } | null;
  createdAt: string;
  activatedAt?: string | null;
}

interface RegistrantsTableProps {
  initialRegistrations: Registration[];
  initialWaitlist: WaitlistEntry[];
  eventId: string;
}

function formatMoney(amountMinor: number, currencyCode = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(amountMinor / 100);
}

export function RegistrantsTable({ initialRegistrations, initialWaitlist, eventId }: RegistrantsTableProps) {
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [waitlistEntries, setWaitlistEntries] = useState(initialWaitlist);
  const [activeTab, setActiveTab] = useState<'registrations' | 'waitlist'>('registrations');
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(initialRegistrations[0]?.id || null);
  const [receiptForm, setReceiptForm] = useState({
    receiptNumber: '',
    amountMajor: '',
    paymentMethod: '',
    note: '',
  });
  const [submittingReceipt, setSubmittingReceipt] = useState(false);
  const [loadingCheckInIds, setLoadingCheckInIds] = useState<Set<string>>(new Set());
  const [loadingWaitlistIds, setLoadingWaitlistIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const selectedRegistration =
    registrations.find((registration) => registration.id === selectedRegistrationId) || registrations[0] || null;

  const attendeeRows = useMemo(
    () =>
      registrations.flatMap((registration) =>
        registration.attendees.map((attendee) => ({
          registration,
          attendee,
        }))
      ),
    [registrations]
  );

  const handleCheckIn = async (attendeeId: string, overridePaymentBlock = false) => {
    setLoadingCheckInIds((current) => new Set(current).add(attendeeId));
    setError(null);

    try {
      await fetchApi(`/admin/events/${eventId}/check-in`, {
        method: 'POST',
        body: JSON.stringify({ attendeeId, overridePaymentBlock }),
      });

      setRegistrations((current) =>
        current.map((registration) => ({
          ...registration,
          attendees: registration.attendees.map((attendee) =>
            attendee.id === attendeeId ? { ...attendee, checkInStatus: 'CHECKED_IN' } : attendee
          ),
        }))
      );
    } catch (checkInError) {
      const message = checkInError instanceof Error ? checkInError.message : 'Failed to record check-in.';
      if (!overridePaymentBlock && message.toLowerCase().includes('full payment')) {
        const confirmed = window.confirm(`${message}\n\nDo you want to override the payment block and continue?`);
        if (confirmed) {
          await handleCheckIn(attendeeId, true);
          return;
        }
      }
      setError(message);
    } finally {
      setLoadingCheckInIds((current) => {
        const next = new Set(current);
        next.delete(attendeeId);
        return next;
      });
    }
  };

  const handleRecordReceipt = async () => {
    if (!selectedRegistration) {
      return;
    }

    const amountMinor = Math.round(Number(receiptForm.amountMajor || 0) * 100);
    if (!receiptForm.receiptNumber.trim() || amountMinor <= 0) {
      setError('Enter a receipt number and a positive receipt amount.');
      return;
    }

    setSubmittingReceipt(true);
    setError(null);

    try {
      const result = await fetchApi(
        `/admin/events/${eventId}/registrations/${selectedRegistration.id}/receipts`,
        {
          method: 'POST',
          body: JSON.stringify({
            receiptNumber: receiptForm.receiptNumber.trim(),
            amountMinor,
            paymentMethod: receiptForm.paymentMethod.trim() || undefined,
            note: receiptForm.note.trim() || undefined,
          }),
        }
      );

      const updated = result.data;
      setRegistrations((current) =>
        current.map((registration) => (registration.id === updated.id ? updated : registration))
      );
      setReceiptForm({ receiptNumber: '', amountMajor: '', paymentMethod: '', note: '' });
    } catch (receiptError) {
      setError(receiptError instanceof Error ? receiptError.message : 'Failed to record receipt.');
    } finally {
      setSubmittingReceipt(false);
    }
  };

  const handleActivateWaitlist = async (waitlistEntryId: string) => {
    setLoadingWaitlistIds((current) => new Set(current).add(waitlistEntryId));
    setError(null);

    try {
      const result = await fetchApi(`/admin/events/${eventId}/waitlist/${waitlistEntryId}/activate`, {
        method: 'POST',
      });

      setRegistrations((current) => [result.data, ...current]);
      setWaitlistEntries((current) =>
        current.map((entry) =>
          entry.id === waitlistEntryId
            ? { ...entry, status: 'CONVERTED', activatedAt: new Date().toISOString() }
            : entry
        )
      );
      setSelectedRegistrationId(result.data.id);
      setActiveTab('registrations');
    } catch (activationError) {
      setError(activationError instanceof Error ? activationError.message : 'Failed to activate waitlist entry.');
    } finally {
      setLoadingWaitlistIds((current) => {
        const next = new Set(current);
        next.delete(waitlistEntryId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-border bg-background p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Registration Operations</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a registration to record receipts and review the current balance.
              </p>
            </div>
            <Badge variant="premium">{registrations.length} registrations</Badge>
          </div>

          {selectedRegistration ? (
            <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {selectedRegistration.registrationCode}
                  </p>
                  <h4 className="mt-1 text-xl font-semibold text-foreground">
                    {selectedRegistration.attendees.map((attendee) => attendee.fullName).join(', ')}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedRegistration.contactEmail || selectedRegistration.contactPhone || 'No primary contact'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">Outstanding balance</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatMoney(selectedRegistration.amountOutstandingMinor, selectedRegistration.currencyCode)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Paid {formatMoney(selectedRegistration.amountPaidMinor, selectedRegistration.currencyCode)} of{' '}
                    {formatMoney(selectedRegistration.totalMinor, selectedRegistration.currencyCode)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Receipt number"
                  value={receiptForm.receiptNumber}
                  onChange={(event) => setReceiptForm((current) => ({ ...current, receiptNumber: event.target.value }))}
                  placeholder="AFM-REC-001"
                />
                <Input
                  label="Amount received"
                  type="number"
                  min="0"
                  step="0.01"
                  value={receiptForm.amountMajor}
                  onChange={(event) => setReceiptForm((current) => ({ ...current, amountMajor: event.target.value }))}
                  placeholder="25.00"
                />
                <Input
                  label="Payment method"
                  value={receiptForm.paymentMethod}
                  onChange={(event) => setReceiptForm((current) => ({ ...current, paymentMethod: event.target.value }))}
                  placeholder="Cash, transfer, mobile money"
                />
                <div className="space-y-2">
                  <label className="ml-1 text-sm font-semibold tracking-tight text-muted-foreground">Payment note</label>
                  <textarea
                    rows={3}
                    value={receiptForm.note}
                    onChange={(event) => setReceiptForm((current) => ({ ...current, note: event.target.value }))}
                    className="w-full rounded-2xl border-2 border-input bg-background/50 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus:border-primary/50"
                    placeholder="Optional note for the finance desk"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  {selectedRegistration.receipts?.length || 0} receipt
                  {selectedRegistration.receipts?.length === 1 ? '' : 's'} recorded
                </div>
                <Button type="button" onClick={handleRecordReceipt} isLoading={submittingReceipt}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Record Receipt
                </Button>
              </div>

              {selectedRegistration.receipts && selectedRegistration.receipts.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 text-zinc-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Receipt</th>
                        <th className="px-4 py-3 font-medium">Amount</th>
                        <th className="px-4 py-3 font-medium">Method</th>
                        <th className="px-4 py-3 font-medium">Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {selectedRegistration.receipts.map((receipt) => (
                        <tr key={receipt.id}>
                          <td className="px-4 py-3 font-medium text-zinc-900">{receipt.receiptNumber}</td>
                          <td className="px-4 py-3 text-zinc-700">
                            {formatMoney(receipt.amountMinor, receipt.currencyCode)}
                          </td>
                          <td className="px-4 py-3 text-zinc-600">{receipt.paymentMethod || 'Not recorded'}</td>
                          <td className="px-4 py-3 text-zinc-600">
                            {new Date(receipt.receivedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No registration has been selected yet.
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-3xl border border-border bg-background p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Queues</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Switch between confirmed registrations and the event waitlist.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={activeTab === 'registrations' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('registrations')}
              >
                Registrations
              </Button>
              <Button
                type="button"
                variant={activeTab === 'waitlist' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('waitlist')}
              >
                Waitlist
              </Button>
            </div>
          </div>

          {activeTab === 'registrations' ? (
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Registrant</th>
                    <th className="px-4 py-3 font-medium">Ticket</th>
                    <th className="px-4 py-3 font-medium">Balance</th>
                    <th className="px-4 py-3 font-medium">Check-in</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {attendeeRows.map(({ registration, attendee }) => (
                    <tr
                      key={attendee.id}
                      className={`cursor-pointer transition-colors hover:bg-zinc-50 ${
                        selectedRegistrationId === registration.id ? 'bg-blue-50/40' : ''
                      }`}
                      onClick={() => setSelectedRegistrationId(registration.id)}
                    >
                      <td className="px-4 py-4">
                        <div className="font-semibold text-zinc-900">{attendee.fullName}</div>
                        <div className="text-xs text-zinc-500">
                          {registration.registrationCode} • {registration.contactEmail || attendee.metadata?.email || registration.contactPhone || 'No contact'}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">
                          {attendee.inventory ? `${attendee.inventory.category} - ${attendee.inventory.name}` : 'No inventory selected'}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-zinc-800">{attendee.ticketType?.name || 'No ticket selected'}</div>
                        <div className="mt-1 text-xs text-zinc-500">{registration.paymentStatus}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-zinc-900">
                          {formatMoney(registration.amountOutstandingMinor, registration.currencyCode)}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">
                          {registration.receipts?.length || 0} receipts
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {attendee.checkInStatus === 'CHECKED_IN' ? (
                          <div className="inline-flex items-center gap-1.5 font-medium text-green-700">
                            <CheckCircle2 size={16} />
                            Checked in
                          </div>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={loadingCheckInIds.has(attendee.id)}
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleCheckIn(attendee.id);
                            }}
                          >
                            {loadingCheckInIds.has(attendee.id) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Check In
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {attendeeRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-zinc-500">
                        No registrations have been recorded for this event yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Waitlist entry</th>
                    <th className="px-4 py-3 font-medium">Preferred inventory</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {waitlistEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-zinc-900">
                          {entry.firstName} {entry.lastName}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {entry.waitlistCode} • {entry.email || entry.phone || 'No contact'}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">
                          {entry.branchName || 'Branch not supplied'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-zinc-700">
                        {entry.inventory ? `${entry.inventory.category} - ${entry.inventory.name}` : 'General waitlist'}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={entry.status === 'WAITING' ? 'warning' : 'success'}>{entry.status}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        {entry.status === 'WAITING' ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={loadingWaitlistIds.has(entry.id)}
                            onClick={() => void handleActivateWaitlist(entry.id)}
                          >
                            {loadingWaitlistIds.has(entry.id) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
                            Activate
                          </Button>
                        ) : (
                          <span className="text-sm text-zinc-500">
                            {entry.activatedAt ? `Activated ${new Date(entry.activatedAt).toLocaleDateString()}` : 'Processed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {waitlistEntries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-zinc-500">
                        No waitlist entries have been captured for this event yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
