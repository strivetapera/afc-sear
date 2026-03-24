import { RegistrationForm } from '@/components/RegistrationForm';
import { Calendar, MapPin, Clock, Share2, Info } from 'lucide-react';
import { Badge } from '@afc-sear/ui';

// Mock data for initial implementation
const mockEvent = {
  id: 'event-001',
  title: 'Annual Youth Conference 2026',
  slug: 'youth-conference-2026',
  summary: 'Join young people from across the region for three days of worship, teaching, and fellowship.',
  description: 'Our annual youth conference is back! This year\'s theme is "Rise and Shine". We have prepared inspiring sessions, practical workshops, and engaging activities to help you grow in your faith and connect with fellow believers.',
  eventType: 'CONFERENCE',
  registrationMode: 'OPEN',
  venue: {
    name: 'Harare Central Tabernacle',
    city: 'Harare',
    addressLine1: '123 Samora Machel Ave',
  },
  schedules: [
    { startsAt: '2026-08-15T09:00:00Z', endsAt: '2026-08-17T17:00:00Z', timezone: 'CAT' }
  ],
  ticketTypes: [
    { id: 't1', name: 'General Admission', priceMinor: 0, currencyCode: 'USD' },
    { id: 't2', name: 'Premium (Includes Meals)', priceMinor: 2500, currencyCode: 'USD' }
  ]
};

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  const response = await fetch(`${apiUrl}/api/v1/public/events/${slug}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Event Not Found</h1>
          <p className="text-zinc-600">The event you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const { data: event } = await response.json();

  const startDate = event.schedules?.[0] ? new Date(event.schedules[0].startsAt) : new Date();
  const dateString = startDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const descriptionText = typeof event.description === 'object' && event.description?.content 
    ? event.description.content 
    : event.description || 'No description provided.';

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero Header */}
      <div className="bg-white border-b border-zinc-200 pt-16 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">DEFAULT</Badge>
              <Badge variant="default" className="border-zinc-200 text-zinc-600">Register Now</Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight mb-4">
              {event.title}
            </h1>
            <p className="text-xl text-zinc-600 leading-relaxed mb-8">
              {event.summary}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-zinc-600">
              <div className="flex items-start gap-3">
                <div className="bg-zinc-100 p-2 rounded-lg text-zinc-900">
                  <Calendar size={20} />
                </div>
                <div>
                  <div className="font-semibold text-zinc-900">Date</div>
                  <div>{dateString}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-zinc-100 p-2 rounded-lg text-zinc-900">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="font-semibold text-zinc-900">Location</div>
                  <div>{event.venue.name}, {event.venue.city}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl p-8 border border-zinc-200 shadow-sm">
              <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                <Info className="text-blue-600" /> About this Event
              </h2>
              <div className="prose prose-zinc max-w-none text-zinc-700">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {descriptionText}
                </p>
              </div>
            </section>

            <section className="bg-blue-600 rounded-2xl p-8 text-white shadow-xl shadow-blue-900/10">
              <h2 className="text-2xl font-bold mb-4">Need help?</h2>
              <p className="opacity-90 mb-6 font-medium">
                Our team is here to assist with your registration or any questions you might have about the event.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold transition-transform hover:scale-105">
                  Contact Support
                </button>
                <button className="bg-blue-500/50 backdrop-blur-sm text-white border border-blue-400 px-6 py-2 rounded-full font-bold transition-transform hover:scale-105">
                  Read FAQs
                </button>
              </div>
            </section>
          </div>

          {/* Registration Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <RegistrationForm 
                eventSlug={event.slug} 
                ticketTypes={event.ticketTypes} 
              />
              
              <div className="mt-6 flex justify-center gap-4 text-zinc-500">
                <button className="flex items-center gap-1 hover:text-zinc-900 transition-colors">
                  <Share2 size={16} /> <span className="text-sm font-medium">Share Event</span>
                </button>
                <button className="flex items-center gap-1 hover:text-zinc-900 transition-colors">
                  <Clock size={16} /> <span className="text-sm font-medium">Add to Calendar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
