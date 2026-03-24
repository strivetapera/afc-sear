'use client';

import { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@afc-sear/ui';
import { Ticket, Users, Calendar, CheckCircle2 } from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
  priceMinor: number;
  currencyCode: string;
}

interface RegistrationFormProps {
  eventSlug: string;
  ticketTypes: TicketType[];
}

export function RegistrationForm({ eventSlug, ticketTypes }: RegistrationFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    ticketTypeId: ticketTypes[0]?.id || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/v1/public/events/${eventSlug}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendees: [
            {
              fullName: formData.fullName,
              ticketTypeId: formData.ticketTypeId,
              metadata: {
                email: formData.email,
                phone: formData.phone,
              }
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit registration');
      }

      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 3) {
    return (
      <Card className="border-green-100 bg-green-50/30">
        <CardContent className="pt-6 text-center">
          <div className="mb-4 flex justify-center text-green-600">
            <CheckCircle2 size={48} />
          </div>
          <h3 className="mb-2 text-xl font-bold text-green-900">Registration Received!</h3>
          <p className="text-green-800">
            We've received your registration for this event. A confirmation email will be sent to {formData.email} shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-zinc-200">
      <CardHeader className="bg-zinc-50 border-b border-zinc-100">
        <CardTitle className="text-lg">Event Registration</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Full Name</label>
            <Input
              required
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Email Address</label>
              <Input
                required
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Phone (Optional)</label>
              <Input
                type="tel"
                placeholder="+263..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">Select Ticket</label>
            <div className="grid gap-2">
              {ticketTypes.map((ticket) => (
                <label
                  key={ticket.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                    formData.ticketTypeId === ticket.id
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="ticket"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      checked={formData.ticketTypeId === ticket.id}
                      onChange={() => setFormData({ ...formData, ticketTypeId: ticket.id })}
                    />
                    <div>
                      <div className="font-medium text-zinc-900">{ticket.name}</div>
                      <div className="text-xs text-zinc-500">
                        {ticket.priceMinor === 0 ? 'Free' : `$${(ticket.priceMinor / 100).toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                  <Ticket size={18} className="text-zinc-400" />
                </label>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          >
            {isSubmitting ? 'Processing...' : 'Complete Registration'}
          </Button>
          
          <p className="text-center text-xs text-zinc-500">
            By registering, you agree to receive communications regarding this event.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
