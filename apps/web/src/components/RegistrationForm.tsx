'use client';

import { useMemo, useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '@afc-sear/ui';
import { CheckCircle2, Clock3, Ticket, Users } from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
  priceMinor: number;
  currencyCode: string;
}

interface RegistrationInventory {
  id: string;
  category: string;
  name: string;
  capacity: number;
  remainingCapacity: number;
  isActive: boolean;
}

interface RegistrationPolicy {
  supportedChannels?: string[];
  allowWaitlist?: boolean;
  pricingRules?: Array<{
    inventoryCategory?: string;
    inventoryName?: string;
    amountMinor?: number;
  }>;
  confirmationConfig?: {
    successHeading?: string;
    successMessage?: string;
  };
}

interface RegistrationFieldDefinition {
  key: string;
  label: string;
  type: string;
  required?: boolean;
}

interface EventRegistrationFormProps {
  event: {
    slug: string;
    title: string;
    ticketTypes?: TicketType[];
    registrationFormSchema?: {
      fields?: RegistrationFieldDefinition[];
    } | null;
    registrationPolicy?: RegistrationPolicy | null;
    registrationInventory?: RegistrationInventory[];
  };
}

type SubmissionState =
  | { kind: 'idle' }
  | { kind: 'registered'; heading: string; message: string; registrationCode?: string; contact?: string }
  | { kind: 'waitlisted'; heading: string; message: string; waitlistCode?: string; contact?: string };

function formatMoney(amountMinor: number, currencyCode = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(amountMinor / 100);
}

function splitFullName(fullName: string) {
  const cleaned = fullName.trim().replace(/\s+/g, ' ');
  if (!cleaned) {
    return { firstName: '', lastName: '' };
  }

  const parts = cleaned.split(' ');
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: parts[0] };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export function RegistrationForm({ event }: EventRegistrationFormProps) {
  const apiOrigin = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/v1\/?$/, '');
  const fields = useMemo<RegistrationFieldDefinition[]>(
    () =>
      Array.isArray(event.registrationFormSchema?.fields) && event.registrationFormSchema?.fields.length
        ? event.registrationFormSchema.fields
        : [
            { key: 'fullName', label: 'Full Name', type: 'text', required: true },
            { key: 'email', label: 'Email Address', type: 'email', required: true },
          ],
    [event.registrationFormSchema]
  );

  const activeInventory = useMemo(
    () => (event.registrationInventory || []).filter((item) => item.isActive),
    [event.registrationInventory]
  );
  const supportedChannels = event.registrationPolicy?.supportedChannels || ['WEB', 'WHATSAPP', 'ADMIN'];
  const webEnabled = supportedChannels.includes('WEB');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    branchName: '',
    ageGroup: '',
    ticketTypeId: event.ticketTypes?.[0]?.id || '',
    inventoryId: '',
  });
  const [submissionState, setSubmissionState] = useState<SubmissionState>({ kind: 'idle' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTicket = (event.ticketTypes || []).find((ticket) => ticket.id === formData.ticketTypeId) || null;
  const selectedInventory = activeInventory.find((inventory) => inventory.id === formData.inventoryId) || null;
  const additionalInventoryPriceMinor = useMemo(() => {
    if (!selectedInventory) {
      return 0;
    }

    const pricingRules = event.registrationPolicy?.pricingRules || [];
    const matchedRule = pricingRules.find((rule) => {
      if (rule.inventoryName && rule.inventoryName === selectedInventory.name) return true;
      if (rule.inventoryCategory && rule.inventoryCategory === selectedInventory.category) return true;
      return false;
    });

    return Number(matchedRule?.amountMinor || 0);
  }, [event.registrationPolicy?.pricingRules, selectedInventory]);

  const totalMinor = (selectedTicket?.priceMinor || 0) + additionalInventoryPriceMinor;
  const currencyCode = selectedTicket?.currencyCode || 'USD';
  const allowWaitlist = Boolean(event.registrationPolicy?.allowWaitlist);
  const hasInventory = activeInventory.length > 0;
  const hasFullInventory = hasInventory && activeInventory.every((inventory) => inventory.remainingCapacity <= 0);

  const fieldMap = new Map(fields.map((field) => [field.key, field]));
  const hasField = (key: string) => fieldMap.has(key);
  const isRequired = (key: string) => Boolean(fieldMap.get(key)?.required);

  const successHeading =
    event.registrationPolicy?.confirmationConfig?.successHeading || 'Registration Received!';
  const successMessage =
    event.registrationPolicy?.confirmationConfig?.successMessage ||
    'We have received your registration for this event.';

  const handleRegister = async (submissionEvent: React.FormEvent) => {
    submissionEvent.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiOrigin}/api/v1/public/events/${event.slug}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: 'WEB',
          contactEmail: hasField('email') ? formData.email || undefined : undefined,
          contactPhone: hasField('phone') ? formData.phone || undefined : undefined,
          attendees: [
            {
              fullName: formData.fullName,
              email: hasField('email') ? formData.email || undefined : undefined,
              phone: hasField('phone') ? formData.phone || undefined : undefined,
              branchName: hasField('branchName') ? formData.branchName || undefined : undefined,
              ageGroup: hasField('ageGroup') ? formData.ageGroup || undefined : undefined,
              ticketTypeId: formData.ticketTypeId || undefined,
              inventoryId: formData.inventoryId || undefined,
            },
          ],
        }),
      });

      const result = await response.json().catch(() => ({ message: 'Failed to submit registration.' }));
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit registration.');
      }

      setSubmissionState({
        kind: 'registered',
        heading: successHeading,
        message: successMessage,
        registrationCode: result.data?.registrationCode,
        contact: formData.email || formData.phone || undefined,
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinWaitlist = async () => {
    const { firstName, lastName } = splitFullName(formData.fullName);
    if (!firstName || !lastName) {
      setError('Enter the registrant name before joining the waitlist.');
      return;
    }

    setIsJoiningWaitlist(true);
    setError(null);

    try {
      const response = await fetch(`${apiOrigin}/api/v1/public/events/${event.slug}/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: 'WEB',
          firstName,
          lastName,
          email: hasField('email') ? formData.email || undefined : undefined,
          phone: hasField('phone') ? formData.phone || undefined : undefined,
          branchName: hasField('branchName') ? formData.branchName || undefined : undefined,
          ageGroup: hasField('ageGroup') ? formData.ageGroup || undefined : undefined,
          inventoryId: formData.inventoryId || undefined,
        }),
      });

      const result = await response.json().catch(() => ({ message: 'Failed to join the waitlist.' }));
      if (!response.ok) {
        throw new Error(result.message || 'Failed to join the waitlist.');
      }

      setSubmissionState({
        kind: 'waitlisted',
        heading: 'You have been added to the waitlist',
        message: 'We will keep this entry on file and can activate it when space becomes available.',
        waitlistCode: result.data?.waitlistCode,
        contact: formData.email || formData.phone || undefined,
      });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Something went wrong.');
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  if (submissionState.kind !== 'idle') {
    const isWaitlist = submissionState.kind === 'waitlisted';
    const registrationCode = submissionState.kind === 'registered' ? submissionState.registrationCode : undefined;
    const waitlistCode = submissionState.kind === 'waitlisted' ? submissionState.waitlistCode : undefined;

    return (
      <Card className={isWaitlist ? 'border-amber-100 bg-amber-50/40' : 'border-green-100 bg-green-50/30'}>
        <CardContent className="pt-6 text-center">
          <div className={`mb-4 flex justify-center ${isWaitlist ? 'text-amber-600' : 'text-green-600'}`}>
            {isWaitlist ? <Clock3 size={48} /> : <CheckCircle2 size={48} />}
          </div>
          <h3 className={`mb-2 text-xl font-bold ${isWaitlist ? 'text-amber-900' : 'text-green-900'}`}>
            {submissionState.heading}
          </h3>
          <p className={isWaitlist ? 'text-amber-800' : 'text-green-800'}>{submissionState.message}</p>
          {(registrationCode || waitlistCode) && (
            <div className="mt-4 rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-sm font-semibold text-zinc-800">
              {registrationCode ? `Registration Code: ${registrationCode}` : null}
              {waitlistCode ? `Waitlist Code: ${waitlistCode}` : null}
            </div>
          )}
          {submissionState.contact ? (
            <p className="mt-3 text-sm text-zinc-600">Primary contact: {submissionState.contact}</p>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-zinc-200">
      <CardHeader className="border-b border-zinc-100 bg-zinc-50">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Event Registration</CardTitle>
            <p className="mt-1 text-sm text-zinc-500">Complete the details below to reserve your place.</p>
          </div>
          <Badge variant="premium">Public Form</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {!webEnabled ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Online registration is not enabled for this event at the moment.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label={fieldMap.get('fullName')?.label || 'Full Name'}
            required
            value={formData.fullName}
            onChange={(event) => setFormData((current) => ({ ...current, fullName: event.target.value }))}
            placeholder="John Doe"
          />

          {hasField('email') ? (
            <Input
              label={fieldMap.get('email')?.label || 'Email Address'}
              type="email"
              required={isRequired('email')}
              value={formData.email}
              onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
              placeholder="john@example.com"
            />
          ) : null}

          {hasField('phone') ? (
            <Input
              label={fieldMap.get('phone')?.label || 'Phone Number'}
              type="tel"
              required={isRequired('phone')}
              value={formData.phone}
              onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
              placeholder="+263..."
            />
          ) : null}

          {hasField('branchName') ? (
            <Input
              label={fieldMap.get('branchName')?.label || 'Branch'}
              required={isRequired('branchName')}
              value={formData.branchName}
              onChange={(event) => setFormData((current) => ({ ...current, branchName: event.target.value }))}
              placeholder="Harare Central"
            />
          ) : null}

          {hasField('ageGroup') ? (
            <Input
              label={fieldMap.get('ageGroup')?.label || 'Age Group'}
              required={isRequired('ageGroup')}
              value={formData.ageGroup}
              onChange={(event) => setFormData((current) => ({ ...current, ageGroup: event.target.value }))}
              placeholder="18-25"
            />
          ) : null}

          {(event.ticketTypes || []).length > 0 ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Ticket Type</label>
              <div className="grid gap-2">
                {(event.ticketTypes || []).map((ticket) => (
                  <label
                    key={ticket.id}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3 transition-colors ${
                      formData.ticketTypeId === ticket.id
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="ticket"
                        checked={formData.ticketTypeId === ticket.id}
                        onChange={() => setFormData((current) => ({ ...current, ticketTypeId: ticket.id }))}
                      />
                      <div>
                        <div className="font-medium text-zinc-900">{ticket.name}</div>
                        <div className="text-xs text-zinc-500">
                          {ticket.priceMinor === 0 ? 'Free' : formatMoney(ticket.priceMinor, ticket.currencyCode)}
                        </div>
                      </div>
                    </div>
                    <Ticket size={18} className="text-zinc-400" />
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {hasInventory ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Inventory or Accommodation</label>
              <select
                value={formData.inventoryId}
                onChange={(event) => setFormData((current) => ({ ...current, inventoryId: event.target.value }))}
                className="flex h-12 w-full rounded-xl border-2 border-input bg-background/50 px-4 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus:border-primary/50"
              >
                <option value="">No specific selection</option>
                {activeInventory.map((inventory) => (
                  <option key={inventory.id} value={inventory.id} disabled={inventory.remainingCapacity <= 0}>
                    {inventory.category} - {inventory.name} ({inventory.remainingCapacity}/{inventory.capacity} left)
                    {inventory.remainingCapacity <= 0 ? ' [Full]' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-500">
                Choose a limited-capacity option if this event includes accommodation, sections, or reserved spaces.
              </p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-zinc-900">Estimated total</p>
                <p className="text-xs text-zinc-500">
                  Base ticket plus any extra inventory charge configured for this event.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-zinc-900">{formatMoney(totalMinor, currencyCode)}</div>
                {selectedInventory && additionalInventoryPriceMinor > 0 ? (
                  <p className="text-xs text-zinc-500">Includes {formatMoney(additionalInventoryPriceMinor, currencyCode)} for {selectedInventory.name}</p>
                ) : null}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !webEnabled}
            className="w-full bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
          >
            {isSubmitting ? 'Processing...' : 'Complete Registration'}
          </Button>

          {allowWaitlist ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
              <div className="mb-3 flex items-center gap-2 text-amber-900">
                <Users size={16} />
                <span className="text-sm font-semibold">Waitlist option</span>
              </div>
              <p className="text-sm leading-6 text-amber-800">
                {hasFullInventory
                  ? 'All active inventory choices are currently full. You can still join the waitlist now.'
                  : 'If the option you want becomes full, you can still keep your details on the waitlist.'}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full border-amber-200 text-amber-900 hover:bg-amber-100"
                onClick={handleJoinWaitlist}
                disabled={isJoiningWaitlist || !webEnabled}
              >
                {isJoiningWaitlist ? 'Joining Waitlist...' : 'Join Waitlist Instead'}
              </Button>
            </div>
          ) : null}

          <p className="text-center text-xs text-zinc-500">
            By registering, you agree to receive updates that relate directly to this event.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
