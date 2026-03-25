import {
  regionalPrayerContacts,
  regionalWebcastDetails,
} from './regionalMinistryData';

export const webcastPage = {
  eyebrow: 'Worship With Us',
  title: 'Live Webcast',
  lead:
    'Join our global community for live worship, inspired Bible teaching, and unified prayer services broadcast directly from our regional centers.',
};

export const featuredStream = {
  title: 'Main Service Sanctuary',
  provider: 'Zoom',
  streamUrl: regionalWebcastDetails.zoomUrl,
  accessLabel: 'Enter Live Sanctuary',
  meetingId: regionalWebcastDetails.zoomMeetingId,
  passcode: regionalWebcastDetails.zoomPasscode,
  status: 'Live Broadcast Active',
  note:
    'Our primary digital sanctuary is open for all scheduled services. Join us as we seek God together through the Word and prayer.',
};

export const webcastSteps = [
  'Access the Zoom sanctuary a few minutes before the service begins using the direct link or meeting details provided.',
  'For services broadcast on YouTube or Facebook, follow our official regional channels to participate in the live stream.',
  'Prepare your heart with prayer and keep your Bible ready for an impactful encounter with the Word of God.',
  'Special conference and camp meeting broadcasts will be announced on the Events page with dedicated access links.',
];

export const webcastSupport = [
  ...regionalPrayerContacts.map(contact => ({
    id: contact.id,
    label: contact.label,
    value: contact.value,
    href: contact.href
  })),
  {
    id: 'regional-email',
    label: 'Regional Office',
    value: 'contact@apostolicfaith-sear.org',
    href: 'mailto:contact@apostolicfaith-sear.org',
  },
];

export const webcastPlatforms = [
  {
    id: 'zoom',
    label: 'Zoom',
    name: 'Digital Sanctuary',
    href: regionalWebcastDetails.zoomUrl,
    detail: `Meeting ID ${regionalWebcastDetails.zoomMeetingId} | Passcode ${regionalWebcastDetails.zoomPasscode}`,
  },
  {
    id: 'youtube',
    label: 'YouTube',
    name: 'APOSTOLIC FAITH MISSION Official',
    href: regionalWebcastDetails.youtubeUrl,
    detail: 'Live service broadcasts and sermon archives for seasonal reflection.',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    name: 'Apostolic Faith Church SEAR',
    href: regionalWebcastDetails.facebookUrl,
    detail: 'Stay connected through live updates and unified prayer streaming.',
  },
];

export const webcastNotes = [
  'Worship times align with our regional schedule. We invite you to join us regularly for spiritual nourishment and fellowship.',
  'All digital services are coordinated to support our local branches and global family in unified worship.',
];
