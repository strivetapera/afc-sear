// data/eventsData.js
import { legacyZimbabweWebcast } from './legacyZimbabweSiteData';

const zoomLink = legacyZimbabweWebcast.zoomUrl;
const zoomPasscode = legacyZimbabweWebcast.zoomPasscode;
const youtubeLink = legacyZimbabweWebcast.youtubeUrl;
const facebookLink = legacyZimbabweWebcast.facebookUrl;
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
    title: 'Tuesday Evangelical Service',
    description: 'Legacy Zimbabwe weekly service schedule restored from the previous website.',
    recurrence: {
      type: 'weekly',
      dayOfWeek: 2,
      time: '18:00',
      durationMinutes: 90,
    },
  },
   {
    id: 'wed-bible-study',
    title: 'Mid-Week Bible Study (Online)',
    description: `Deepen your understanding of God's Word. ${zoomDetails}`,
    recurrence: {
      type: 'weekly',
      dayOfWeek: 3,
      time: '18:30',
      durationMinutes: 60,
    },
    link: zoomLink,
  },
  {
    id: 'fri-service',
    title: 'Friday Bible Teaching',
    description: 'Legacy Zimbabwe weekly service schedule restored from the previous website.',
    recurrence: {
      type: 'weekly',
      dayOfWeek: 5,
      time: '18:00',
      durationMinutes: 90,
    },
  },
  {
    id: 'sun-school',
    title: 'Sunday School',
    description: 'Bible classes for all ages.',
    recurrence: {
      type: 'weekly',
      dayOfWeek: 0,
      time: '09:00',
      durationMinutes: 60,
    },
  },
  {
    id: 'sun-devotional',
    title: 'Sunday Devotional Service',
    description: 'Watch through the restored YouTube channel when this service is streamed online.',
    recurrence: {
      type: 'weekly',
      dayOfWeek: 0,
      time: '10:30',
      durationMinutes: 120,
    },
    link: youtubeLink,
  },
  {
    id: 'sun-youth',
    title: 'Sunday Youth Service',
    description: 'This service was listed at 2:00 PM on the previous Zimbabwe schedule page.',
    recurrence: {
      type: 'weekly',
      dayOfWeek: 0,
      time: '14:00',
      durationMinutes: 90,
    },
    link: facebookLink,
  },
];
