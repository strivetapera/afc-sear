// data/eventsData.js

// Helper to add Zoom details consistently
const zoomLink = "https://us02web.zoom.us/j/85088056383?pwd=cXBFemhLU2c0aTZ3MC9JMU0wM2laZz09";
const zoomPasscode = "111";
const zoomDetails = `Join via Zoom: ${zoomLink} (Passcode: ${zoomPasscode})`;

export const events = [
  {
    id: 'daily-prayer',
    title: 'Morning Prayer (Online)',
    description: `Start your day with prayer and devotion. ${zoomDetails}`,
    // Recurring Daily: 5:00 AM - 6:00 AM local time
    recurrence: {
      type: 'daily', // Changed from weekly
      // dayOfWeek not needed for daily
      time: '05:00', // Start time HH:MM format (24-hour)
      // Optional: add duration or end time if needed for display
      durationMinutes: 60,
    },
    link: zoomLink, // Add link field for easier access
  },
  {
    id: 'tue-service',
    title: 'Tuesday Evening Service',
    description: 'Join us for worship and teaching.',
    // Recurring Weekly: Tuesday at 18:00 (6:00 PM) - 19:30 local time
    recurrence: {
      type: 'weekly',
      dayOfWeek: 2, // 0=Sun, 1=Mon, 2=Tue
      time: '18:00',
      durationMinutes: 90,
    },
  },
   {
    id: 'wed-bible-study',
    title: 'Mid-Week Bible Study (Online)',
    description: `Deepen your understanding of God's Word. ${zoomDetails}`,
    // Recurring Weekly: Wednesday at 18:00 (6:00 PM) - 19:00 local time
    recurrence: {
      type: 'weekly',
      dayOfWeek: 3, // Wednesday
      time: '18:00',
      durationMinutes: 60,
    },
    link: zoomLink, // Add link field
  },
  {
    id: 'fri-service',
    title: 'Friday Evening Service',
    description: 'A time of fellowship and spiritual focus.',
    // Recurring Weekly: Friday at 18:00 (6:00 PM) - 19:30 local time
    recurrence: {
      type: 'weekly',
      dayOfWeek: 5, // Friday
      time: '18:00',
      durationMinutes: 90,
    },
  },
  {
    id: 'sun-school',
    title: 'Sunday School',
    description: 'Bible classes for all ages.',
    // Recurring Weekly: Sunday at 09:00 AM - 09:45 AM local time
    recurrence: {
      type: 'weekly',
      dayOfWeek: 0, // Sunday
      time: '09:00',
      durationMinutes: 45,
    },
  },
  {
    id: 'sun-devotional',
    title: 'Sunday Devotional Service',
    description: 'Begin the main service with worship and devotion.',
     // Recurring Weekly: Sunday at 10:00 AM local time
    recurrence: {
      type: 'weekly',
      dayOfWeek: 0, // Sunday
      time: '10:00',
      // Duration implied until next service starts
    },
  },
   {
    id: 'sun-evangelistic',
    title: 'Sunday Evangelistic Service',
    description: 'Experience uplifting worship and Gospel preaching.',
    // Recurring Weekly: Sunday at 14:00 (2:00 PM) local time
    recurrence: {
      type: 'weekly',
      dayOfWeek: 0, // Sunday
      time: '14:00',
      // Duration not specified
    },
  },
  // Keep other one-time events if you still have them:
  /*
  {
    id: 'revival-july',
    title: 'Special Revival Service',
    description: 'Guest Speaker: Pastor John Doe.',
    startDateTime: '2024-07-20T19:00:00',
  },
   {
    id: 'revival-aug',
    title: 'August Healing Crusade',
    description: 'A special weekend focused on healing.',
    startDateTime: '2024-08-15T18:30:00',
  },
  */
];

// Ensure the export is correct if using ES Modules
// export { events }; // Use this if you didn't use 'export const events = ...' above