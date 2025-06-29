// /lib/eventUtils.js
import { format, parseISO } from 'date-fns';
// *** ADD THIS IMPORT ***
import { getLessonForDate, transformArchivedLesson } from './lessonArchiveUtils';

// ==========================================================================
// 1. General Event Calculation & Formatting (For eventsData.js)
// ==========================================================================

// ... (Your calculateNextOccurrence, getUpcomingEvents, and formatEventDate functions remain here, unchanged)
/**
 * Calculates the next occurrence of a recurring event based on the current date.
 * NOTE: Assumes local timezone for simplicity with static export build time.
 * @param {object} recurrence - The recurrence rule { type, dayOfWeek, time }
 * @param {Date} now - The current date object (build time)
 * @returns {Date | null} - The Date object for the next occurrence or null
 */
function calculateNextOccurrence(recurrence, now) {
  if (!recurrence || !recurrence.time) return null;
  try {
    const [hour, minute] = recurrence.time.split(':').map(Number);
    if (isNaN(hour) || isNaN(minute)) throw new Error("Invalid time format");

    let nextDate = new Date(now); // Clone 'now' to avoid modifying original

    if (recurrence.type === 'weekly') {
      if (typeof recurrence.dayOfWeek !== 'number') return null;
      const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
      let daysUntilNext = recurrence.dayOfWeek - currentDay;
      if (daysUntilNext < 0) { daysUntilNext += 7; }

      nextDate.setDate(now.getDate() + daysUntilNext);
      nextDate.setHours(hour, minute, 0, 0); // Set time for that day

      // If we calculated for today BUT the time has already passed, calculate for next week
      if (daysUntilNext === 0 && nextDate.getTime() < now.getTime()) {
        nextDate.setDate(nextDate.getDate() + 7);
      }
    } else if (recurrence.type === 'daily') {
      nextDate.setHours(hour, minute, 0, 0); // Set time for today
      // If calculated time for today has passed, set for tomorrow
      if (nextDate.getTime() < now.getTime()) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
    } else {
      console.warn(`Unsupported recurrence type: ${recurrence.type}`);
      return null; // Unsupported recurrence type
    }
    return nextDate;
  } catch (error) {
    console.error("Error in calculateNextOccurrence:", error, recurrence);
    return null;
  }
}

/**
 * Fetches and processes general event data (from eventsData.js) to get upcoming events.
 * @param {number | null} limit - Max number of events to return (null for all)
 * @returns {Promise<Array>} - Sorted array of upcoming event objects
 */
export async function getUpcomingEvents(limit = null) {
  let events = [];
  try {
      const eventsModule = await import('../data/eventsData');
      events = eventsModule.events;
      if (!Array.isArray(events)) throw new Error("eventsData did not contain an array.");
  } catch (error) {
      console.error("Error loading or parsing eventsData.js:", error);
      return []; // Return empty array on error
  }

  const now = new Date();
  const upcoming = [];

  events.forEach((event) => {
    if (!event || typeof event !== 'object') return;

    let nextOccurrenceDate = null;
    if (event.recurrence) {
      nextOccurrenceDate = calculateNextOccurrence(event.recurrence, now);
    } else if (event.startDateTime) {
      try {
        nextOccurrenceDate = new Date(event.startDateTime);
        if (isNaN(nextOccurrenceDate.getTime())) throw new Error("Invalid date");
      } catch (e) {
        console.error(`Invalid date format for event ${event.id || 'UNKNOWN'}: ${event.startDateTime}`, e);
        nextOccurrenceDate = null;
      }
    }

    if (nextOccurrenceDate && nextOccurrenceDate.getTime() >= now.getTime()) {
      upcoming.push({
        id: event.id ?? `event-${Math.random().toString(36).substring(2)}`,
        title: event.title ?? 'Untitled Event',
        description: event.description ?? null,
        recurrence: event.recurrence ?? null,
        startDateTime: event.startDateTime ?? null,
        link: event.link ?? null,
        calculatedNextOccurrence: nextOccurrenceDate.toISOString(),
      });
    }
  });

  upcoming.sort(
    (a, b) =>
      new Date(a.calculatedNextOccurrence).getTime() -
      new Date(b.calculatedNextOccurrence).getTime()
  );

  return limit ? upcoming.slice(0, limit) : upcoming;
}

/**
 * Helper function to format general event dates using date-fns.
 * @param {string | null} isoDateString - The ISO date string to format.
 * @param {object | undefined | null} recurrence - The recurrence rule object.
 * @returns {string} - The formatted date string.
 */
export function formatEventDate(isoDateString, recurrence) {
  if (!isoDateString) return 'Date TBD';
  try {
    const date = parseISO(isoDateString);
    if (isNaN(date.getTime())) throw new Error("Invalid date parsed");

    if (recurrence?.type === 'weekly') {
      return `Every ${format(date, 'eeee')} at ${format(date, 'p')}`;
    }
    if (recurrence?.type === 'daily') {
      return `Daily at ${format(date, 'p')}`;
    }
    return format(date, 'PPp');

  } catch (error) {
    console.error("Error formatting event date:", isoDateString, error);
    return "Invalid Date";
  }
}

// ==========================================================================
// 2. Weekly Lesson Calculation & Formatting
// ==========================================================================
/**
 * Finds the most current lesson content for a specific category
 * based on effective date from its JSON file.
 * @param {string} category - The category key (e.g., 'discovery', 'beginners')
 * @returns {Promise<object | null>} - The latest applicable lesson content object or null.
 */
export async function getCurrentLessonContent(category) {
  let lessonData = [];
  try {
    const dataModule = await import(`../data/lessons-${category}.json`);
    lessonData = dataModule.default || dataModule;
    if (!Array.isArray(lessonData)) throw new Error(`Lesson data for ${category} is not an array.`);
  } catch (error) {
    console.error(`Error importing or parsing lesson data for category: ${category}`, error);
    return null;
  }

  if (lessonData.length === 0) {
    return null;
  }

  const now = new Date();
  let currentContent = null;

  const sortedContent = [...lessonData].sort((a, b) => {
      try {
        const dateA = new Date(a.effectiveDate + 'T00:00:00Z');
        const dateB = new Date(b.effectiveDate + 'T00:00:00Z');
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
        return dateB.getTime() - dateA.getTime();
      } catch { return 0; }
  });

  for (const contentEntry of sortedContent) {
    if (!contentEntry || typeof contentEntry.effectiveDate !== 'string') {
        console.warn(`Skipping invalid content entry in ${category} JSON:`, contentEntry);
        continue;
    }
    try {
        const effectiveDate = new Date(contentEntry.effectiveDate + 'T00:00:00Z');
        if (isNaN(effectiveDate.getTime())) throw new Error("Invalid effective date string");
        const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        if (effectiveDate.getTime() <= startOfToday.getTime()) {
          currentContent = contentEntry;
          break;
        }
    } catch(error) {
         console.error(`Error processing effective date '${contentEntry.effectiveDate}' for entry in ${category}:`, error);
         continue;
    }
  }

  if (!currentContent) {
      console.warn(`No current lesson content found for category: ${category} based on build date ${now.toISOString()}. Check effective dates in JSON.`);
  }

  return currentContent;
}

/**
 * Calculates the next occurrence date for a given day of the week.
 * @param {number} targetDayOfWeek - 0 for Sunday, 3 for Wednesday, etc.
 * @param {Date} now - The current date object (build time)
 * @returns {Date} - The Date object for the next occurrence.
 */
export function getNextDayDate(targetDayOfWeek, now) {
  let nextDate = new Date(now);
  const currentDay = now.getDay();
  let daysUntilNext = targetDayOfWeek - currentDay;
  if (daysUntilNext < 0) { daysUntilNext += 7; }
  nextDate.setDate(now.getDate() + daysUntilNext);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

/**
 * Fetches and combines the current lessons for all categories.
 * This is the primary function used by getStaticProps for lesson pages.
 * @returns {Promise<Array>} - Array of current lesson objects with next date.
 */
export async function getThisWeeksLessonsStructured() {
  const now = new Date();
  const categories = [
    { key: 'discovery', title: 'Discovery Lesson (Wed)', dayOfWeek: 3 },
    { key: 'beginners', title: 'Beginners (Sun, Ages 2-5)', dayOfWeek: 0 },
    { key: 'primary', title: 'Primary Pals (Sun, 1st-3rd)', dayOfWeek: 0 },
    { key: 'answer', title: 'Answer Class (Sun, 4th-8th)', dayOfWeek: 0 },
    { key: 'search', title: 'Search Class (Sun, High School+)', dayOfWeek: 0 },
  ];

  const currentLessonsPromises = categories.map(async (cat) => {
    let content = null;
    const nextDate = getNextDayDate(cat.dayOfWeek, now);
    const placeholderBody = "<p>Lesson details coming soon. Please check back later.</p>";

    // *** START OF MODIFICATION ***
    if (cat.key === 'search') {
      // For the 'search' class, get the current lesson from the archive
      const archivedLesson = getLessonForDate(now);
      if (archivedLesson) {
        content = transformArchivedLesson(archivedLesson);
      }
    } else {
      // For all other classes, use the original logic
      content = await getCurrentLessonContent(cat.key);
    }
    // *** END OF MODIFICATION ***

    return {
      id: `${cat.key}-${content?.effectiveDate || 'placeholder'}`,
      categoryKey: cat.key,
      title: cat.title,
      dayOfWeek: cat.dayOfWeek,
      topic: content?.topic ?? "Lesson details coming soon.",
      body: content?.body ?? (content ? null : placeholderBody),
      sourceReference: content?.sourceReference ?? null,
      keyVerse: content?.keyVerse ?? null,
      background: content?.background ?? null,
      questions: content?.questions ?? [],
      conclusion: content?.conclusion ?? null,
      sourceLink: content?.sourceLink ?? null,
      effectiveDate: content?.effectiveDate ?? null,
      nextOccurrenceDate: nextDate.toISOString(),
    };
  });

  const resolvedLessons = await Promise.all(currentLessonsPromises);

  resolvedLessons.sort((a, b) => {
    const dayA = a.dayOfWeek === 3 ? -1 : a.dayOfWeek;
    const dayB = b.dayOfWeek === 3 ? -1 : b.dayOfWeek;
    if (dayA !== dayB) { return dayA - dayB; }

    const titleOrder = ['Beginners', 'Primary', 'Answer', 'Search'];
    const indexA = titleOrder.findIndex(t => a.title.includes(t));
    const indexB = titleOrder.findIndex(t => b.title.includes(t));
    if (indexA !== -1 && indexB !== -1) {
        if (indexA !== indexB) return indexA - indexB;
    }
    return a.title.localeCompare(b.title);
  });

  return resolvedLessons;
}

/**
 * Formats the header for a lesson display (Topic + Effective Date).
 * @param {object | null} lesson - The processed lesson object.
 * @returns {string} - Formatted header string.
 */
export function formatLessonHeader(lesson) {
    if (!lesson) return 'Lesson Topic';
     try {
        let effectiveDateStr = '';
        if (lesson.effectiveDate && !lesson.effectiveDate.startsWith('archive-')) {
             const effectiveDate = parseISO(lesson.effectiveDate + 'T00:00:00Z');
             if (!isNaN(effectiveDate.getTime())) {
                 effectiveDateStr = format(effectiveDate, 'MMM d');
             } else {
                 console.warn(`Could not parse effective date: ${lesson.effectiveDate}`);
             }
        }
        const topic = lesson.topic || "Topic TBD";
        return `${topic}${effectiveDateStr ? ` (Effective ${effectiveDateStr})` : ''}`;
     } catch (error) {
        console.error("Error formatting lesson header:", lesson, error);
        return lesson?.topic || "Topic TBD";
     }
}