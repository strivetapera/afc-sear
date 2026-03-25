import {
  legacyPrayerContacts,
  legacyZimbabweWebcast,
} from './legacyZimbabweSiteData';

export const contactPage = {
  eyebrow: 'Contact',
  title: 'Contact The Apostolic Faith Church SEAR',
  lead:
    'We are here to support your spiritual journey. Connect with our regional ministry team for prayer requests, local church information, and worship resources.',
};

export const contactChannels = [
  {
    id: 'regional-email',
    label: 'Regional Office',
    value: 'contact@apostolicfaith-sear.org',
    href: 'mailto:contact@apostolicfaith-sear.org',
    note: 'Primary channel for general inquiries and regional administration.',
  },
  ...legacyPrayerContacts.map((contact) => ({
    id: contact.id,
    label: 'WhatsApp Support',
    value: contact.value,
    href: contact.href,
    note: 'Direct link for sharing prayer requests and branch introductions on WhatsApp.',
  })),
  {
    id: 'harare-address',
    label: 'Main Office Address',
    value: 'Stand 10466, Lusaka, Highfields, Harare',
    note: 'Apostolic Faith Church Southern & Eastern Africa Headquarters.',
  },
];

export const ministryContacts = [
  {
    id: 'webcast-help',
    title: 'Worship Support',
    description:
      'Access our live and archived services through our verified digital channels including Zoom, YouTube, and Facebook.',
    destination: legacyZimbabweWebcast.zoomMeetingId,
  },
  {
    id: 'locations-help',
    title: 'Congregational Life',
    description:
      'Explore our fellowship locations across the region. Our team can help introduce you to a local branch or pastor in your community.',
    destination: 'Find your nearest assembly',
  },
  {
    id: 'resource-help',
    title: 'Media Ministry',
    description:
      'Watch and listen to recent sermons, choir recordings, and special conference sessions from our regional media archive.',
    destination: legacyZimbabweWebcast.youtubeLabel,
  },
];

export const contactNextSteps = [
  'Visit our Locations page to find the assembly nearest to you.',
  'Mention your city or region when contacting us so we can route your inquiry to the right local team.',
  'Join our live webcast sessions for weekly prayer meetings and Bible study.',
];
