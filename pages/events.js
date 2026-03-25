// pages/events.js
import React from 'react';
import PageShell from '../components/PageShell';
import { getUpcomingEvents, formatEventDate } from '../lib/eventUtils';
import { getEventsFeedFromPlatform } from '../lib/platformPublicApi';
import { useState, useEffect } from 'react';

const fallbackMetadata = {
  eyebrow: 'Events',
  title: 'Upcoming Events',
  lead:
    'Join our recurring services and regional gatherings. Worship, prayer, and unified ministry events across the South East Africa Region.',
};

export default function Events({ metadata, allUpcomingEvents }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <PageShell
      eyebrow={metadata.eyebrow}
      title={metadata.title}
      lead={metadata.lead}
      actions={[
        { href: '/calendar', label: 'View Yearly Calendar', variant: 'secondary' }
      ]}
    >
      <div className="not-prose max-w-4xl">
        {allUpcomingEvents.length > 0 ? (
          <ul className="list-none p-0 space-y-8">
            {allUpcomingEvents.map((event) => (
              <li key={event.id} className="p-8 border border-foreground/5 rounded-3xl shadow-premium bg-card/50 backdrop-blur-sm transition-all hover:scale-[1.01] hover:bg-card/80">
                <h2 className="text-2xl md:text-3xl font-bold mb-3 heading-premium italic">
                  {event.title}
                </h2>
                <p className="mb-4 text-sm text-accent font-black uppercase tracking-widest">
                  {formatEventDate(event.calculatedNextOccurrence, event.recurrence)}
                </p>
                {event.description && (
                  <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                    {event.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-20 bg-foreground/5 rounded-3xl border border-dotted border-foreground/20">
            <p className="text-xl text-muted-foreground font-medium italic">
              No upcoming events scheduled at this time.
            </p>
          </div>
        )}
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mt-12 pb-10">
          Sync Time: {mounted ? new Date().toLocaleDateString() : 'Loading...'}
        </p>
      </div>
    </PageShell>
  );
}

export async function getStaticProps() {
  let allUpcomingEvents = [];

  try {
    allUpcomingEvents = await getUpcomingEvents(null);
  } catch (error) {
    console.error("Failed to fetch events for the events page:", error);
  }

  const platformFeed = await getEventsFeedFromPlatform(fallbackMetadata, allUpcomingEvents);

  return {
    props: {
      metadata: platformFeed.metadata,
      allUpcomingEvents: platformFeed.items,
    }
  };
}
