import React from 'react';
import PageShell from '../../components/PageShell';
import Link from 'next/link';
import { getThisWeeksLessonsStructured, formatLessonHeader } from '../../lib/eventUtils';

export default function ThisWeeksLessons({ structuredLessons }) {
  if (!structuredLessons || structuredLessons.length === 0) {
    return (
      <PageShell
        eyebrow="Library"
        title="Weekly Lessons"
        lead="Our structured teaching materials are temporarily unavailable. Please check back soon as we synchronize our regional curriculum."
      >
        <div className="py-24 text-center">
            <p className="text-muted-foreground font-medium">Lesson details are currently being synchronized.</p>
        </div>
      </PageShell>
    );
  }

  const lessonBasePath = "/library/lessons";

  return (
    <PageShell
      eyebrow="Unified Teaching"
      title="Weekly Lessons"
      lead="Our regional curriculum for personal study and sanctuary teaching. These lessons provide a consistent biblical foundation across all our regional branches."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {structuredLessons.map((lesson) => (
          <Link
            href={`${lessonBasePath}/${lesson.categoryKey}`}
            key={lesson.id}
            className="group flex flex-col p-8 rounded-3xl border border-foreground/5 bg-card/30 backdrop-blur-md transition-all hover:bg-card/50 hover:border-accent/20"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4 block">
              {lesson.title}
            </span>
            <h3 className="text-2xl font-bold text-foreground mb-4 heading-premium">{lesson.topic}</h3>
            <p className="text-muted-foreground text-sm font-semibold mb-6 flex-grow">
               {formatLessonHeader(lesson)}
            </p>
            {lesson.keyVerse && (
               <p className="text-[10px] italic text-muted-foreground/50 mb-8 border-l-2 border-accent/20 pl-4 leading-relaxed line-clamp-3">
                 &quot;{lesson.keyVerse.text}&quot; — {lesson.keyVerse.reference}
               </p>
            )}
            <div className="mt-auto pt-6 border-t border-foreground/5 text-[10px] font-black uppercase tracking-widest text-accent group-hover:tracking-[0.2em] transition-all">
               Open Curriculum →
             </div>
          </Link>
        ))}
      </div>
      <p className="text-center text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] mt-24 italic">
        Curriculum reflects regional synchronization at time of last update.
      </p>
    </PageShell>
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