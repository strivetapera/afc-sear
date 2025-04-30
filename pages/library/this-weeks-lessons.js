// pages/library/this-weeks-lessons.js
import React from 'react';
import Link from 'next/link';
// Import the necessary functions from your utils file
import { getThisWeeksLessonsStructured, formatLessonHeader } from '../../lib/eventUtils';

// This page component receives the array of all current lessons as a prop
export default function ThisWeeksLessons({ structuredLessons }) {

  // Handle cases where data fetching might have failed or returned an empty array
  if (!structuredLessons || structuredLessons.length === 0) {
    return (
       <div className="py-12 md:py-16">
         <div className="container mx-auto px-6 w-11/12 max-w-[900px] text-center">
           {/* Page Title */}
           <h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12 text-gold"> {/* Ensure title uses theme color */}
             This Week&apos;s Lessons
           </h1>
           {/* Message shown when no lessons are available */}
           <div className="prose prose-invert max-w-none mx-auto text-lg">
              <p className="text-cream"> {/* Ensure text uses theme color */}
                 Lesson details are currently unavailable or could not be loaded. Please check back soon.
              </p>
           </div>
         </div>
       </div>
    );
  }

  // Define the base path for the individual lesson detail pages we will create later
  const lessonBasePath = "/library/lessons";

  return (
    // Main page container with vertical padding
    <div className="py-12 md:py-16">
      {/* Consistent content container */}
      <div className="container mx-auto px-6 w-11/12 max-w-[1000px]"> {/* Slightly wider container */}

        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl text-center font-bold mb-10 md:mb-14 text-gold"> {/* Ensure title uses theme color */}
          This Week&apos;s Lessons
        </h1>

        {/* Grid layout for lesson summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

          {/* Map over the array of lessons passed via props */}
          {structuredLessons.map((lesson) => (
            // Each grid item is a Link component acting as a clickable card
            <Link
                // Create the destination URL, e.g., /library/lessons/discovery
                href={`${lessonBasePath}/${lesson.categoryKey}`}
                key={lesson.id} // Use the unique lesson ID as the key
                // Styling for the card appearance and hover effects
                className="flex flex-col block p-6 border border-gray-700 rounded-lg shadow-lg bg-gradient-to-br from-black to-gray-900 hover:border-gold hover:shadow-md hover:shadow-gold/30 transition-all duration-200 ease-in-out group" // Added group for potential inner hover states
            >
              {/* Lesson Category Title (e.g., "Discovery Lesson (Wed)") */}
              <h2 className="text-gold mt-0 mb-3 text-xl md:text-2xl font-semibold">
                {lesson.title}
              </h2>

              {/* Lesson Topic and Effective Date (using the formatter) */}
              <p className="mb-4 text-sm text-cream font-medium">
                 {formatLessonHeader(lesson)}
              </p>

              {/* Optional: Display a very short snippet or key verse */}
              {lesson.keyVerse && (
                 <p className="text-xs italic text-cream/70 mb-2 line-clamp-2 flex-grow"> {/* Use flex-grow to push indicator down */}
                   Key Verse: &quot;{lesson.keyVerse.text}&quot; - {lesson.keyVerse.reference}
                 </p>
              )}

              {/* "View Lesson" indicator - pushed to the bottom */}
              <div className="mt-auto pt-3 text-right text-xs text-gold opacity-80 group-hover:opacity-100 transition-opacity"> {/* Use group-hover */}
                 View Lesson →
               </div>

            </Link> // End Link wrapper
          ))}
        </div> {/* End grid */}

        {/* Footer note about build time */}
        <p className="text-center text-xs text-gray-500 pt-10 mt-8">
          Lesson content reflects schedule at time of last website update.
        </p>

      </div> {/* End standard container */}
    </div> // End page wrapper
  );
}


// Fetch ALL lesson data at build time
export async function getStaticProps() {
  // Fetch ALL structured lessons using the existing function from eventUtils
  const allStructuredLessons = await getThisWeeksLessonsStructured();

  // Basic check in case the fetch function itself fails (though it aims to return [])
  if (!allStructuredLessons) {
    console.error("Failed to fetch structured lessons in getStaticProps for this-weeks-lessons.");
    return {
      props: { structuredLessons: [] }, // Pass empty array if fetch failed catastrophically
    }
  }

  return {
    props: {
      // Pass the FULL array of lessons to the page component
      structuredLessons: allStructuredLessons,
    },
    // No revalidate needed because we are using output: 'export'
  };
}