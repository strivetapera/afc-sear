// pages/library/lessons/[lessonKey].js
import React from 'react';
import Link from 'next/link';
// Removed unused import: import { useRouter } from 'next/router';
// Import the necessary utility functions
import { getCurrentLessonContent, getNextDayDate } from '../../lib/eventUtils'; // Adjust path as needed

// --- Helper to get category definitions ---
// We need this in both getStaticPaths and getStaticProps
const lessonCategories = [
    { key: 'discovery', title: 'Discovery Lesson (Wed)', dayOfWeek: 3 },
    { key: 'beginners', title: 'Beginners (Sun, Ages 2-5)', dayOfWeek: 0 },
    { key: 'primary', title: 'Primary Pals (Sun, 1st-3rd)', dayOfWeek: 0 },
    { key: 'answer', title: 'Answer Class (Sun, 4th-8th)', dayOfWeek: 0 },
    { key: 'search', title: 'Search Class (Sun, High School+)', dayOfWeek: 0 },
];
// -----------------------------------------


// This component receives the specific lesson detail as a prop
export default function LessonDetailPage({ lessonDetail }) {
    // Removed unused variable: const router = useRouter();

    // Handle case where getStaticProps returned notFound or data is missing
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

    // --- Render the full lesson content ---
    return (
        <div className="py-12 md:py-16">
            <div className="container mx-auto px-6 w-11/12 max-w-[900px]">

                {/* Lesson Topic as Main Title */}
                <h1 className="text-3xl md:text-4xl text-center font-bold mb-4 text-gold">
                    {lessonDetail.topic}
                </h1>
                {/* Subtitle with Category Title */}
                <p className="text-center text-cream text-lg mb-8 md:mb-12">
                    {lessonDetail.title} {/* e.g., Discovery Lesson (Wed) */}
                </p>

                {/* Main Content Area */}
                <div className="prose prose-invert max-w-none mx-auto text-lg leading-relaxed space-y-6">

                    {/* Effective Date */}
                    {lessonDetail.effectiveDate && (
                         <p className="text-center text-sm text-gold !-mt-6 !mb-6">
                            (Content effective from {new Date(lessonDetail.effectiveDate + 'T00:00:00Z').toLocaleDateString(undefined, { dateStyle: 'medium' })})
                         </p>
                    )}

                    {/* Source Reference */}
                    {lessonDetail.sourceReference && (
                        <p className="text-sm italic">
                            Source for Questions: {lessonDetail.sourceReference}
                        </p>
                    )}

                    {/* Key Verse */}
                    {lessonDetail.keyVerse && (
                        <div className="my-6 p-4 border-l-4 border-gold bg-gray-900/50 rounded">
                            <h3 className="!text-gold !mt-0 !mb-2 text-base font-semibold uppercase tracking-wider">Key Verse</h3>
                            <blockquote className="!mt-0 !border-none !pl-0 italic">
                                &quot;{lessonDetail.keyVerse.text}&quot;
                                <footer className="text-sm not-italic text-cream/80 mt-1 block">
                                    - {lessonDetail.keyVerse.reference}
                                </footer>
                            </blockquote>
                        </div>
                    )}

                    {/* Background */}
                    {lessonDetail.background && (
                        <div>
                            <h2 className="!text-gold !mb-3 !mt-8">Background</h2>
                            <div dangerouslySetInnerHTML={{ __html: lessonDetail.background }} />
                        </div>
                    )}

                     {/* Lesson Body (Render if available and distinct) */}
                     {lessonDetail.body && lessonDetail.body !== lessonDetail.background && lessonDetail.body !== lessonDetail.conclusion && (
                        <div className="mt-5" dangerouslySetInnerHTML={{ __html: lessonDetail.body }} />
                     )}


                    {/* Questions */}
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

                    {/* Conclusion */}
                    {lessonDetail.conclusion && (
                        <div>
                            <h2 className="!text-gold !mb-3 !mt-8">Conclusion</h2>
                            <div dangerouslySetInnerHTML={{ __html: lessonDetail.conclusion }} />
                        </div>
                    )}

                    {/* Optional: Link back to source */}
                    {lessonDetail.sourceLink && (
                        <p className="text-center text-sm pt-8">
                            <Link href={lessonDetail.sourceLink} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                                View Original Lesson Source
                            </Link>
                        </p>
                    )}

                    {/* Link back to the main lessons list */}
                     <p className="text-center pt-8">
                         <Link href="/library/this-weeks-lessons" className="text-gold hover:underline">
                           ← Back to All Weekly Lessons
                         </Link>
                     </p>

                </div> {/* End Prose */}
            </div> {/* End Container */}
             <p className="text-center text-xs text-gray-500 pt-10 mt-4">
                Lesson content reflects schedule at time of last website update.
            </p>
        </div> // End Page Wrapper
    );
}

// Define which paths to pre-render at build time
export async function getStaticPaths() {
    // Generate paths based on the category keys
    const paths = lessonCategories.map((cat) => ({
        params: { lessonKey: cat.key }, // Parameter name matches filename [lessonKey].js
    }));
    // console.log("Generated Paths for Lessons:", JSON.stringify(paths, null, 2)); // Keep for debugging if needed
    // fallback: false means pages for paths not listed here will result in 404
    // This is required for output: 'export'
    return { paths, fallback: false };
}

// Fetch data for a specific lesson category at build time
export async function getStaticProps(context) {
    const { params } = context;
    const lessonKey = params?.lessonKey; // Get the specific key from the URL path

    // Basic check for the key
    if (!lessonKey || typeof lessonKey !== 'string') {
        console.error(`Invalid or missing lessonKey in params: ${params}`);
        return { notFound: true };
    }

    // Find the category details (title, dayOfWeek) based on the key
    const categoryInfo = lessonCategories.find(cat => cat.key === lessonKey);
    if (!categoryInfo) {
         console.error(`No category info found for lessonKey: ${lessonKey}`);
        return { notFound: true }; // No matching category definition
    }

    // Fetch the current content for this specific category
    // This function now needs to exist and work correctly in eventUtils.js
    const content = await getCurrentLessonContent(lessonKey);

    // If no current content was found for the build date, return 404 for this page
    if (!content) {
        console.warn(`No current content found via getCurrentLessonContent for lessonKey: ${lessonKey}`);
        return { notFound: true };
    }

    // Calculate the next date this lesson occurs
    // This function also needs to exist and work correctly in eventUtils.js
    const now = new Date();
    const nextDate = getNextDayDate(categoryInfo.dayOfWeek, now);

    // Construct the lesson detail object, ensuring serializability
    const lessonDetail = {
        id: `${categoryInfo.key}-${content.effectiveDate}`,
        categoryKey: categoryInfo.key,
        title: categoryInfo.title, // Use the defined title from categoryInfo
        dayOfWeek: categoryInfo.dayOfWeek,
        topic: content.topic ?? 'Topic Not Available',
        body: content.body ?? null,
        sourceReference: content.sourceReference ?? null,
        keyVerse: content.keyVerse ?? null,
        background: content.background ?? null,
        questions: content.questions ?? [],
        conclusion: content.conclusion ?? null,
        sourceLink: content.sourceLink ?? null,
        effectiveDate: content.effectiveDate, // This MUST exist if content was found
        nextOccurrenceDate: nextDate.toISOString(), // Ensure nextDate was calculated
    };

    return {
        props: {
            lessonDetail, // Pass the single lesson object
        },
    };
}