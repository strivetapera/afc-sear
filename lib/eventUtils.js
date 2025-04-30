// lib/eventUtils.js
import { format, parseISO } from 'date-fns'; // Import functions from date-fns

// ==========================================================================
// 1. General Event Calculation & Formatting (For eventsData.js)
// ==========================================================================

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
      // Dynamically import to handle potential file not found or JSON errors
      const eventsModule = await import('../data/eventsData');
      events = eventsModule.events; // Assuming named export 'events'
      if (!Array.isArray(events)) throw new Error("eventsData did not contain an array.");
  } catch (error) {
      console.error("Error loading or parsing eventsData.js:", error);
      return []; // Return empty array on error
  }

  const now = new Date(); // Date/Time AT BUILD TIME
  const upcoming = [];

  events.forEach((event) => {
    if (!event || typeof event !== 'object') return; // Skip invalid entries

    let nextOccurrenceDate = null;
    if (event.recurrence) {
      nextOccurrenceDate = calculateNextOccurrence(event.recurrence, now);
    } else if (event.startDateTime) {
      try {
        // Use Date constructor for flexibility, but know its timezone quirks
        nextOccurrenceDate = new Date(event.startDateTime);
        // Optionally use parseISO if format is guaranteed ISO 8601
        // nextOccurrenceDate = parseISO(event.startDateTime);
        if (isNaN(nextOccurrenceDate.getTime())) throw new Error("Invalid date");
      } catch (e) { // Catch specific error
        console.error(`Invalid date format for event ${event.id || 'UNKNOWN'}: ${event.startDateTime}`, e);
        nextOccurrenceDate = null;
      }
    }

    // Only add if the event occurrence is in the future (or calculation succeeded)
    if (nextOccurrenceDate && nextOccurrenceDate.getTime() >= now.getTime()) {
      // Ensure the returned object is serializable
      upcoming.push({
        id: event.id ?? `event-${Math.random().toString(36).substring(2)}`, // Ensure ID exists
        title: event.title ?? 'Untitled Event',
        description: event.description ?? null,
        recurrence: event.recurrence ?? null,
        startDateTime: event.startDateTime ?? null, // Original start if one-time
        link: event.link ?? null, // Include link if present
        calculatedNextOccurrence: nextOccurrenceDate.toISOString(), // Serializable date
      });
    }
  });

  // Sort events chronologically by their next occurrence
  upcoming.sort(
    (a, b) =>
      new Date(a.calculatedNextOccurrence).getTime() -
      new Date(b.calculatedNextOccurrence).getTime()
  );

  // Apply limit if provided
  return limit ? upcoming.slice(0, limit) : upcoming;
}

/**
 * Helper function to format general event dates using date-fns.
 * @param {string | null} isoDateString - The ISO date string to format.
 * @param {object | undefined | null} recurrence - The recurrence rule object.
 * @returns {string} - The formatted date string.
 */
export function formatEventDate(isoDateString, recurrence) {
  if (!isoDateString) return 'Date TBD'; // Handle null/undefined input
  try {
    const date = parseISO(isoDateString); // Use parseISO for reliability
    if (isNaN(date.getTime())) throw new Error("Invalid date parsed");

    if (recurrence?.type === 'weekly') {
      return `Every ${format(date, 'eeee')} at ${format(date, 'p')}`;
    }
    if (recurrence?.type === 'daily') {
      return `Daily at ${format(date, 'p')}`;
    }
    // Format for one-time events
    return format(date, 'PPp'); // e.g., Jul 20, 2024, 7:00 PM

  } catch (error) {
    console.error("Error formatting event date:", isoDateString, error);
    return "Invalid Date"; // Provide a fallback string
  }
}


// ==========================================================================
// 2. Weekly Lesson Calculation & Formatting (For lesson JSON files)
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
    // Ensure the path is correct relative to this utils file
    const dataModule = await import(`../data/lessons-${category}.json`);
    lessonData = dataModule.default || dataModule; // Handle default export
    if (!Array.isArray(lessonData)) throw new Error(`Lesson data for ${category} is not an array.`);
  } catch (error) {
    // Log more specific error if import failed vs parsing failed
    console.error(`Error importing or parsing lesson data for category: ${category}`, error);
    return null;
  }

  if (lessonData.length === 0) {
    return null; // No data entries found
  }

  const now = new Date(); // Date/Time AT BUILD TIME
  let currentContent = null;

  // Sort content entries descending by date to easily find the latest applicable one
  const sortedContent = [...lessonData].sort((a, b) => {
      try {
        // Robust date comparison
        const dateA = new Date(a.effectiveDate + 'T00:00:00Z');
        const dateB = new Date(b.effectiveDate + 'T00:00:00Z');
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0; // Don't sort invalid dates
        return dateB.getTime() - dateA.getTime();
      } catch { return 0; } // Handle potential errors during date creation
  });


  for (const contentEntry of sortedContent) {
    // Basic validation of the entry structure
    if (!contentEntry || typeof contentEntry.effectiveDate !== 'string') {
        console.warn(`Skipping invalid content entry in ${category} JSON:`, contentEntry);
        continue; // Skip this entry
    }

    try {
        // Treat date as UTC start of day for consistent comparison
        const effectiveDate = new Date(contentEntry.effectiveDate + 'T00:00:00Z');
        if (isNaN(effectiveDate.getTime())) throw new Error("Invalid effective date string");

        // Compare against start of today UTC for consistency
        const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

        if (effectiveDate.getTime() <= startOfToday.getTime()) {
          currentContent = contentEntry;
          break; // Found the most recent applicable content
        }
    } catch(error) {
         console.error(`Error processing effective date '${contentEntry.effectiveDate}' for entry in ${category}:`, error);
         continue; // Skip entry with invalid date
    }
  }

  if (!currentContent) {
      console.warn(`No current lesson content found for category: ${category} based on build date ${now.toISOString()}. Check effective dates in JSON.`);
  }

  return currentContent; // Return the found content object or null
}

/**
 * Calculates the next occurrence date for a given day of the week.
 * Used to determine the date label for the current lesson content.
 * @param {number} targetDayOfWeek - 0 for Sunday, 3 for Wednesday, etc.
 * @param {Date} now - The current date object (build time)
 * @returns {Date} - The Date object for the next occurrence.
 */
export function getNextDayDate(targetDayOfWeek, now) {
  let nextDate = new Date(now); // Clone 'now'
  const currentDay = now.getDay();
  let daysUntilNext = targetDayOfWeek - currentDay;
  if (daysUntilNext < 0) { daysUntilNext += 7; }
  nextDate.setDate(now.getDate() + daysUntilNext);
  nextDate.setHours(0, 0, 0, 0); // Set to start of that day (local midnight based on build server time)
  return nextDate;
}

/**
 * Fetches and combines the current lessons for all categories.
 * Ensures all returned props are serializable (uses null for missing fields).
 * This is the primary function used by getStaticProps for lesson pages.
 * @returns {Promise<Array>} - Array of current lesson objects with next date.
 */
export async function getThisWeeksLessonsStructured() {
  const now = new Date();
  // Define categories to fetch lessons for
  const categories = [
    { key: 'discovery', title: 'Discovery Lesson (Wed)', dayOfWeek: 3 },
    { key: 'beginners', title: 'Beginners (Sun, Ages 2-5)', dayOfWeek: 0 },
    { key: 'primary', title: 'Primary Pals (Sun, 1st-3rd)', dayOfWeek: 0 },
    { key: 'answer', title: 'Answer Class (Sun, 4th-8th)', dayOfWeek: 0 },
    { key: 'search', title: 'Search Class (Sun, High School+)', dayOfWeek: 0 },
  ];

  // Fetch current content for each category in parallel
  const currentLessonsPromises = categories.map(async (cat) => {
    const content = await getCurrentLessonContent(cat.key); // Fetches the content object or null
    const nextDate = getNextDayDate(cat.dayOfWeek, now); // Calculate next occurrence date
    const placeholderBody = "<p>Lesson details coming soon. Please check back later.</p>";

    // Construct the lesson object, ensuring all fields are serializable
    return {
      id: `${cat.key}-${content?.effectiveDate || 'placeholder'}`, // Use optional chaining
      categoryKey: cat.key,
      title: cat.title, // Category title (e.g., "Discovery Lesson (Wed)")
      dayOfWeek: cat.dayOfWeek,
      // Use ?? to provide defaults ONLY if left side is null or undefined
      topic: content?.topic ?? "Lesson details coming soon.",
      body: content?.body ?? (content ? null : placeholderBody), // Use placeholder only if content is null
      sourceReference: content?.sourceReference ?? null,
      keyVerse: content?.keyVerse ?? null,
      background: content?.background ?? null,
      questions: content?.questions ?? [], // Default to empty array
      conclusion: content?.conclusion ?? null,
      sourceLink: content?.sourceLink ?? null,
      effectiveDate: content?.effectiveDate ?? null, // Store effective date or null
      nextOccurrenceDate: nextDate.toISOString(), // Store the calculated next date
    };
  });

  // Wait for all fetches to complete
  const resolvedLessons = await Promise.all(currentLessonsPromises);

  // Sort lessons: Wednesday first, then Sunday groups in specified order
  resolvedLessons.sort((a, b) => {
    // Prioritize Wednesday (day 3)
    const dayA = a.dayOfWeek === 3 ? -1 : a.dayOfWeek; // Make Wednesday sort first
    const dayB = b.dayOfWeek === 3 ? -1 : b.dayOfWeek;
    if (dayA !== dayB) { return dayA - dayB; }

    // If same day (Sunday), sort by predefined order
    const titleOrder = ['Beginners', 'Primary', 'Answer', 'Search'];
    const indexA = titleOrder.findIndex(t => a.title.includes(t));
    const indexB = titleOrder.findIndex(t => b.title.includes(t));
    if (indexA !== -1 && indexB !== -1) {
        if (indexA !== indexB) return indexA - indexB;
    }
    // Fallback sort by title if order isn't matched or days are different
    return a.title.localeCompare(b.title);
  });

  return resolvedLessons;
}


/**
 * Formats the header for a lesson display (Topic + Effective Date).
 * Uses date-fns for consistent formatting to prevent hydration errors.
 * @param {object | null} lesson - The processed lesson object.
 * @returns {string} - Formatted header string.
 */
export function formatLessonHeader(lesson) {
    if (!lesson) return 'Lesson Topic'; // Fallback for null/undefined lesson object
     try {
        let effectiveDateStr = '';
        if (lesson.effectiveDate) {
             // Parse the date string (assuming YYYY-MM-DD)
             const effectiveDate = parseISO(lesson.effectiveDate + 'T00:00:00Z'); // Treat as UTC date

             if (!isNaN(effectiveDate.getTime())) { // Check if parsing was successful
                 // *** USE date-fns/format FOR CONSISTENCY ***
                 effectiveDateStr = format(effectiveDate, 'MMM d'); // e.g., "Oct 27"
             } else {
                 console.warn(`Could not parse effective date in formatLessonHeader: ${lesson.effectiveDate}`);
             }
        }

        const topic = lesson.topic || "Topic TBD"; // Use placeholder if topic missing

        // Return formatted string, only include date part if it was valid
        return `${topic}${effectiveDateStr ? ` (Effective ${effectiveDateStr})` : ''}`;

     } catch (error) {
        console.error("Error formatting lesson header:", lesson, error);
        return lesson?.topic || "Topic TBD"; // Fallback using optional chaining
     }
}