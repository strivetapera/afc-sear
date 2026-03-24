import {
  legacyPrayerContacts,
  legacyZimbabweWebcast,
} from './legacyZimbabweSiteData';

export const webcastPage = {
  eyebrow: 'Join Online',
  title: 'Live Webcast',
  lead:
    'Gather online for worship, prayer, Bible teaching, and special services. This page now restores the verified Zoom, YouTube, and Facebook access details that were published on the older Zimbabwe website.',
};

export const featuredStream = {
  title: 'Zimbabwe Online Service Room',
  provider: 'Zoom',
  streamUrl: legacyZimbabweWebcast.zoomUrl,
  accessLabel: 'Open Live Meeting',
  meetingId: legacyZimbabweWebcast.zoomMeetingId,
  passcode: legacyZimbabweWebcast.zoomPasscode,
  status: 'Legacy verified webcast access restored',
  note:
    'This Zoom room comes directly from the legacy Zimbabwe schedule page and is the clearest verified meeting room carried over into the new webapp.',
};

export const webcastSteps = [
  'Open the Zoom meeting link a few minutes before service starts, or use the meeting ID and passcode if your device does not open the link directly.',
  'For services streamed through social media, use the YouTube or Facebook channel links below and look for the current live broadcast.',
  'Keep your Bible and notebook ready so you can participate fully during the service.',
  'If a special service uses a different link, check the Events page first because the older site noted that some camp-meeting details were only added closer to the dates.',
];

export const webcastSupport = [
  {
    id: legacyPrayerContacts[0].id,
    label: legacyPrayerContacts[0].label,
    value: legacyPrayerContacts[0].value,
    href: legacyPrayerContacts[0].href,
  },
  {
    id: 'regional-email',
    label: 'Regional Email',
    value: 'contact@apostolicfaith-sear.org',
    href: 'mailto:contact@apostolicfaith-sear.org',
  },
];

export const webcastPlatforms = [
  {
    id: 'zoom',
    label: 'Zoom',
    name: 'Online Service Room',
    href: legacyZimbabweWebcast.zoomUrl,
    detail: `Meeting ID ${legacyZimbabweWebcast.zoomMeetingId} | Passcode ${legacyZimbabweWebcast.zoomPasscode}`,
  },
  {
    id: 'youtube',
    label: 'YouTube',
    name: legacyZimbabweWebcast.youtubeLabel,
    href: legacyZimbabweWebcast.youtubeUrl,
    detail: 'Use this channel for livestreams and replayed services.',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    name: legacyZimbabweWebcast.facebookLabel,
    href: legacyZimbabweWebcast.facebookUrl,
    detail: 'The previous site linked this page for live and follow-up streaming access.',
  },
];

export const webcastNotes = [
  'The platform links above come from the archived Zimbabwe schedule page, while the regular schedule below is generated from the shared event data used elsewhere in the new site.',
  legacyZimbabweWebcast.calendarNote,
];
