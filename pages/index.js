// pages/index.js
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
// Removed MinistriesSection import as it wasn't in your latest code here
import EventsSection from '../components/EventsSection';
import { getUpcomingEvents } from '../lib/eventUtils'; // *** IMPORT THE HELPER ***

// *** MODIFY Home component to ACCEPT events prop ***
export default function Home({ upcomingEvents }) {
  return (
    <>
      <Hero />
      <AboutSection />
      {/* Remove MinistriesSection if not used on homepage */}
      {/* <MinistriesSection /> */}
      {/* *** PASS the events prop to EventsSection *** */}
      <EventsSection events={upcomingEvents} />
    </>
  );
}

// *** ADD getStaticProps back to fetch data at build time ***
export async function getStaticProps() {
  // Fetch only a limited number for the homepage section (e.g., 4)
  const upcomingEvents = await getUpcomingEvents(4); // Limit to 4 events

  return {
    props: {
      // Pass events, ensuring Date objects are serialized (toISOString does this)
      upcomingEvents,
    },
    // No revalidate needed for 'output: export'
  };
}