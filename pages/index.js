// pages/index.js
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import EventsSection from '../components/EventsSection';
import { getUpcomingEvents } from '../lib/eventUtils';

export default function Home({ upcomingEvents }) {
  return (
    <>
      <Hero />
      <AboutSection />
      {/* The EventsSection now receives its data as a prop! */}
      <EventsSection events={upcomingEvents} />
    </>
  );
}

export async function getStaticProps() {
  let upcomingEvents = []; // Default to an empty array

  try {
    // Fetch only a limited number for the homepage section (e.g., 4)
    upcomingEvents = await getUpcomingEvents(4);
  } catch (error) {
    // If fetching fails, log the error and the build will continue with an empty list.
    console.error("Failed to fetch upcoming events for homepage:", error);
  }

  return {
    props: {
      // Pass events to the page component.
      // NOTE: Next.js automatically serializes props. If your events have
      // Date objects, they will be converted to ISO strings. Your EventsSection
      // component will need to parse them back into Dates if needed.
      upcomingEvents,
    },
    // No `revalidate` key is needed when using `output: 'export'`.
  };
}