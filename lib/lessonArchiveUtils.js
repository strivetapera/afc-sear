// /lib/lessonArchiveUtils.js
import { differenceInWeeks } from 'date-fns'; // *** CHANGE THE IMPORT ***
import lessons from '../data/search_lessons.json';

// *** DEFINE THE OFFICIAL START DATE OF THE CURRICULUM ***
// We use 'Z' to specify UTC, ensuring the calculation is the same regardless of the server's timezone.
const LESSON_ARCHIVE_START_DATE = new Date('2024-08-28T00:00:00Z');

/**
 * Gets the lesson from the archive for a specific date by calculating the
 * number of weeks elapsed since a fixed start date.
 * @param {Date} now - The current date (used to determine weeks elapsed).
 * @returns {object | null} The lesson object for the current week or null.
 */
export function getLessonForDate(now = new Date()) {
  // Filter out any entries that might not be actual lessons (like theme thoughts)
  const actualLessons = lessons.filter(l => l.id && l.id.startsWith('lesson_'));

  if (!actualLessons || actualLessons.length === 0) {
    return null;
  }

  // *** NEW LOGIC: If the current date is before the curriculum starts, return nothing. ***
  if (now < LESSON_ARCHIVE_START_DATE) {
    return null;
  }

  // Calculate how many full weeks have passed since the start date.
  // weekStartsOn: 0 makes the week start on Sunday, so the lesson changes on Sunday.
  const weeksElapsed = differenceInWeeks(now, LESSON_ARCHIVE_START_DATE, { weekStartsOn: 0 });

  // If we are still in the first week, weeksElapsed will be 0, which is perfect for our index.

  // Use the modulo operator to loop through lessons if weeks > lesson count
  const lessonIndex = weeksElapsed % actualLessons.length;

  return actualLessons[lessonIndex];
}

/**
 * Transforms a lesson from the archive format to the structure expected by components.
 * (This function does not need to change).
 * @param {object} archivedLesson - The lesson object from search_lessons.json.
 * @returns {object} The transformed lesson object.
 */
export function transformArchivedLesson(archivedLesson) {
  if (!archivedLesson) {
    return null;
  }

  // Find the introductory text and conclusion text
  const introTextSection = archivedLesson.lessonSections.find(
    s => s.sectionType === 'text' && s.sectionTitle.toLowerCase().includes('text')
  );
  const conclusionTextSection = archivedLesson.lessonSections.find(
    s => s.sectionType === 'text' && s.sectionTitle.toLowerCase().includes('conclud')
  );

  // Collect all questions
  const questions = archivedLesson.lessonSections
    .filter(s => s.sectionType === 'question')
    .map(q => q.sectionContent);
  
  // Format the Bible reference string
  const sourceReference = archivedLesson.bibleReference
    .map(ref => `${ref.book} ${ref.chapter}:${ref.verses}`)
    .join('; ');

  return {
    topic: archivedLesson.lessonTitle,
    body: introTextSection ? introTextSection.sectionContent : null,
    sourceReference: sourceReference,
    keyVerse: archivedLesson.keyVerse, // Assumes it's an object { text, reference } or null
    background: introTextSection ? introTextSection.sectionContent : null,
    questions: questions,
    conclusion: conclusionTextSection ? conclusionTextSection.sectionContent : null,
    sourceLink: archivedLesson.resourceMaterial,
    // Add a synthetic effectiveDate for a unique ID in the component
    effectiveDate: `archive-${archivedLesson.id}` 
  };
}