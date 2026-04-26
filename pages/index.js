// pages/index.js
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import EventsSection from '../components/EventsSection';
import { getUpcomingEvents } from '../lib/eventUtils';
import { getStructuredPageContent } from '../data/structuredPagesData';

export default function Home({ upcomingEvents, homeContent }) {
  return (
    <>
      <Hero content={homeContent.hero} />
      <AboutSection content={homeContent.aboutSection} />
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
      upcomingEvents,
      homeContent: getStructuredPageContent('homePage'),
    },
  };
}
