// /pages/library/lessons/[lessonKey].js
import React from 'react';
import Link from 'next/link';

// *** ADD THESE IMPORTS ***
import { getLessonForDate, transformArchivedLesson } from '../../../lib/lessonArchiveUtils';
import { getCurrentLessonContent, getNextDayDate } from '../../../lib/eventUtils';

// --- Helper to get category definitions ---
const lessonCategories = [
    { key: 'discovery', title: 'Discovery Lesson (Wed)', dayOfWeek: 3 },
    { key: 'beginners', title: 'Beginners (Sun, Ages 2-5)', dayOfWeek: 0 },
    { key: 'primary', title: 'Primary Pals (Sun, 1st-3rd)', dayOfWeek: 0 },
    { key: 'answer', title: 'Answer Class (Sun, 4th-8th)', dayOfWeek: 0 },
    { key: 'search', title: 'Search Class (Sun, High School+)', dayOfWeek: 0 },
];

export default function LessonDetailPage({ lessonDetail }) {
    if (!lessonDetail) {
        return (
            <div className="py-12 md:py-16">
                <div className="container mx-auto px-6 w-11/12 max-w-[900px] text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12 text-gold">
                        Lesson Not Found
                    </h1>
                    <div className="prose prose-invert max-w-none mx-auto text-lg">
                        <p className="text-cream">
                            The requested lesson could not be found or is not currently available.
                        </p>
                        <p>
                            <Link href="/library/this-weeks-lessons" className="text-gold hover:underline">
                                ← Back to Weekly Lessons
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 md:py-16">
            <div className="container mx-auto px-6 w-11/12 max-w-[900px]">
                <h1 className="text-3xl md:text-4xl text-center font-bold mb-4 text-gold">
                    {lessonDetail.topic}
                </h1>
                <p className="text-center text-cream text-lg mb-8 md:mb-12">
                    {lessonDetail.title}
                </p>

                <div className="prose prose-invert max-w-none mx-auto text-lg leading-relaxed space-y-6">
                    {lessonDetail.effectiveDate && !lessonDetail.effectiveDate.startsWith('archive-') && (
                         <p className="text-center text-sm text-gold !-mt-6 !mb-6">
                            (Content effective from {new Date(lessonDetail.effectiveDate + 'T00:00:00Z').toLocaleDateString(undefined, { dateStyle: 'medium' })})
                         </p>
                    )}
                    {lessonDetail.sourceReference && (
                        <p className="text-sm italic">
                            Source for Questions: {lessonDetail.sourceReference}
                        </p>
                    )}
                    {lessonDetail.keyVerse?.text && (
                        <div className="my-6 p-4 border-l-4 border-gold bg-gray-900/50 rounded">
                            <h3 className="!text-gold !mt-0 !mb-2 text-base font-semibold uppercase tracking-wider">Key Verse</h3>
                            <blockquote className="!mt-0 !border-none !pl-0 italic">
                                "{lessonDetail.keyVerse.text}"
                                <footer className="text-sm not-italic text-cream/80 mt-1 block">
                                    - {lessonDetail.keyVerse.reference}
                                </footer>
                            </blockquote>
                        </div>
                    )}
                    {lessonDetail.background && (
                        <div>
                            <h2 className="!text-gold !mb-3 !mt-8">Background</h2>
                            <div dangerouslySetInnerHTML={{ __html: lessonDetail.background }} />
                        </div>
                    )}
                     {lessonDetail.body && lessonDetail.body !== lessonDetail.background && lessonDetail.body !== lessonDetail.conclusion && (
                        <div className="mt-5" dangerouslySetInnerHTML={{ __html: lessonDetail.body }} />
                     )}
                    {lessonDetail.questions && lessonDetail.questions.length > 0 && (
                        <div>
                            <h2 className="!text-gold !mb-3 !mt-8">Questions</h2>
                            <ol className="list-decimal list-outside space-y-3 pl-5">
                                {lessonDetail.questions.map((question, index) => (
                                    <li key={index}>{question}</li>
                                ))}
                            </ol>
                        </div>
                    )}
                    {lessonDetail.conclusion && (
                        <div>
                            <h2 className="!text-gold !mb-3 !mt-8">Conclusion</h2>
                            <div dangerouslySetInnerHTML={{ __html: lessonDetail.conclusion }} />
                        </div>
                    )}
                    {lessonDetail.sourceLink && (
                        <p className="text-center text-sm pt-8">
                            <Link href={lessonDetail.sourceLink} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                                View Original Lesson Source
                            </Link>
                        </p>
                    )}
                     <p className="text-center pt-8">
                         <Link href="/library/this-weeks-lessons" className="text-gold hover:underline">
                           ← Back to All Weekly Lessons
                         </Link>
                     </p>
                </div>
                 <p className="text-center text-xs text-gray-500 pt-10 mt-4">
                    Lesson content reflects schedule at time of last website update.
                </p>
            </div>
        </div>
    );
}

// Define which paths to pre-render at build time
export async function getStaticPaths() {
    const paths = lessonCategories.map((cat) => ({
        params: { lessonKey: cat.key },
    }));
    return { paths, fallback: false };
}

// Fetch data for a specific lesson category at build time
export async function getStaticProps(context) {
    const { params } = context;
    const lessonKey = params?.lessonKey;

    if (!lessonKey || typeof lessonKey !== 'string') {
        return { notFound: true };
    }

    const categoryInfo = lessonCategories.find(cat => cat.key === lessonKey);
    if (!categoryInfo) {
        return { notFound: true };
    }

    const now = new Date();
    const nextDate = getNextDayDate(categoryInfo.dayOfWeek, now);
    let content = null;

    // *** START OF MODIFICATION ***
    if (lessonKey === 'search') {
        const archivedLesson = getLessonForDate(now);
        if (archivedLesson) {
            content = transformArchivedLesson(archivedLesson);
        }
    } else {
        content = await getCurrentLessonContent(lessonKey);
    }
    // *** END OF MODIFICATION ***

    if (!content) {
        console.warn(`No current content found for lessonKey: ${lessonKey}`);
        return { notFound: true };
    }

    const lessonDetail = {
        id: `${categoryInfo.key}-${content.effectiveDate}`,
        categoryKey: categoryInfo.key,
        title: categoryInfo.title,
        dayOfWeek: categoryInfo.dayOfWeek,
        topic: content.topic ?? 'Topic Not Available',
        body: content.body ?? null,
        sourceReference: content.sourceReference ?? null,
        keyVerse: content.keyVerse ?? null,
        background: content.background ?? null,
        questions: content.questions ?? [],
        conclusion: content.conclusion ?? null,
        sourceLink: content.sourceLink ?? null,
        effectiveDate: content.effectiveDate,
        nextOccurrenceDate: nextDate.toISOString(),
    };

    return {
        props: {
            lessonDetail,
        },
    };
}