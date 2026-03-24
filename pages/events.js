// pages/events.js
import React from 'react';
import { getUpcomingEvents, formatEventDate } from '../lib/eventUtils';
import { getEventsFeedFromPlatform } from '../lib/platformPublicApi';

const fallbackMetadata = {
  eyebrow: 'Events',
  title: 'Upcoming Events',
  lead:
    'These recurring services and public gatherings are currently drawn from the restored Zimbabwe schedule while the wider regional events system is being built out on the platform.',
};

// Receive events prop
export default function Events({ metadata, allUpcomingEvents }) {
  // ... (Your component code remains exactly the same, it's perfect)
  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-6 w-11/12 max-w-[900px]">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-gold/75">
          {metadata.eyebrow}
        </p>
        <h1 className="text-3xl md:text-4xl text-center font-bold mb-8 md:mb-12">
          {metadata.title}
        </h1>
        <p className="mx-auto mb-10 max-w-3xl text-center text-base leading-7 text-cream/80">
          {metadata.lead}
        </p>

        {allUpcomingEvents.length > 0 ? (
          <ul className="list-none p-0 space-y-8">
            {allUpcomingEvents.map((event) => (
              <li key={event.id} className="p-6 border border-gray-700 rounded-lg shadow-lg bg-gradient-to-br from-black to-gray-900">
                <h2 className="text-xl md:text-2xl font-semibold mb-2">
                  {event.title}
                </h2>
                <p className="mb-3 text-sm text-gold font-medium">
                  {formatEventDate(event.calculatedNextOccurrence, event.recurrence)}
                </p>
                {event.description && (
                  <p className="text-base leading-relaxed">
                    {event.description}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-lg">
            No upcoming events scheduled at this time. Please check back later.
          </p>
        )}
        <p className="text-center text-sm text-gray-400 mt-8">
          Event list generated at build time.
        </p>
      </div>
    </div>
  );
}

// Fetch data at build time
export async function getStaticProps() {
  let allUpcomingEvents = []; // Default to empty array

  try {
    // Fetch ALL upcoming events for the events page
    allUpcomingEvents = await getUpcomingEvents(null); // null limit gets all
  } catch (error) {
    console.error("Failed to fetch events for the events page:", error);
    // The build will succeed, and the page will render the "empty state" message.
  }

  const platformFeed = await getEventsFeedFromPlatform(fallbackMetadata, allUpcomingEvents);

  return {
    props: {
      metadata: platformFeed.metadata,
      allUpcomingEvents: platformFeed.items,
    },
  };
}
