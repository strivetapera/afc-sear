// pages/events.js
import React from 'react';
import { getUpcomingEvents, formatEventDate } from '../lib/eventUtils'; // Import helpers

// Receive events prop
export default function Events({ allUpcomingEvents }) {
  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-6 w-11/12 max-w-[900px]">
        <h1 className="text-3xl md:text-4xl text-center font-bold mb-8 md:mb-12">
          Upcoming Events
        </h1>

        {allUpcomingEvents.length > 0 ? (
          <ul className="list-none p-0 space-y-8">
            {/* Map over the events passed as props */}
            {allUpcomingEvents.map((event) => (
              <li key={event.id} className="p-6 border border-gray-700 rounded-lg shadow-lg bg-gradient-to-br from-black to-gray-900">
                <h2 className="text-xl md:text-2xl font-semibold mb-2">
                  {event.title}
                </h2>
                <p className="mb-3 text-sm text-gold font-medium">
                  {/* Format the calculated date */}
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
  // Fetch ALL upcoming events for the events page
  const allUpcomingEvents = await getUpcomingEvents(null); // null limit gets all

  return {
    props: {
      allUpcomingEvents,
    },
     // Optional: Add revalidate if NOT using output: 'export'
  };
}