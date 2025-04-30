// components/EventsSection.js
import Link from 'next/link';
import { formatEventDate } from '../lib/eventUtils'; // Import formatter

// Accept events prop
const EventsSection = ({ events = [] }) => { // Default to empty array
  return (
    <section className="py-12 md:py-16 bg-black">
      <div className="container mx-auto px-6 w-11/12 max-w-[1200px]">
        <h2 className="text-3xl md:text-4xl font-semibold mb-8 md:mb-12 text-center">
          Upcoming Events
        </h2>

        {events.length > 0 ? (
          <>
            <ul className="list-none p-0 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Map over the events prop */}
              {events.map((event) => (
                <li key={event.id} className="p-6 border border-gray-700 rounded-lg shadow-lg bg-gradient-to-br from-black to-gray-900 flex flex-col">
                  <h3 className="text-xl md:text-2xl font-semibold mb-2">
                    {event.title}
                  </h3>
                  <p className="mb-3 text-sm text-gold font-medium">
                    {/* Format the calculated date */}
                    {formatEventDate(event.calculatedNextOccurrence, event.recurrence)}
                  </p>
                  {/* Optional: Add description back if needed */}
                  {/* {event.description && <p className="text-base leading-relaxed mb-4 flex-grow">{event.description}</p>} */}
                </li>
              ))}
            </ul>

            <div className="mt-10 text-center">
              <Link
                href="/events"
                className="inline-block bg-gold text-black [text-shadow:1px_1px_1px_rgba(0,0,0,0.2)] font-semibold py-3 px-8 rounded hover:bg-opacity-85 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-black"
              >
                View All Events
              </Link>
            </div>
          </>
        ) : (
           <p className="text-center text-lg">
             No upcoming events found.
           </p>
        )}
         <p className="text-center text-xs text-gray-500 mt-6">
           Event list reflects schedule at time of last website update.
         </p>
      </div>
    </section>
  );
};

export default EventsSection;