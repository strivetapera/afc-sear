import {
  legacyPrayerContacts,
  legacyZimbabweWebcast,
} from './legacyZimbabweSiteData';

export const contactPage = {
  eyebrow: 'Contact',
  title: 'Contact The Apostolic Faith Church SEAR',
  lead:
    'Use this page for local church connections, prayer requests, and webcast support. The strongest verified contacts we have today come from the legacy Zimbabwe site, and they are preserved here while broader regional channels are still being finalized.',
};

export const contactChannels = [
  {
    id: 'regional-email',
    label: 'Regional Email',
    value: 'contact@apostolicfaith-sear.org',
    href: 'mailto:contact@apostolicfaith-sear.org',
    note: 'Best for general questions, visitor follow-up, and ministry inquiries.',
  },
  {
    id: legacyPrayerContacts[0].id,
    label: 'Prayer Requests WhatsApp',
    value: legacyPrayerContacts[0].value,
    href: legacyPrayerContacts[0].href,
    note: 'Legacy Zimbabwe WhatsApp prayer-request line carried into the new website.',
  },
  {
    id: legacyPrayerContacts[1].id,
    label: 'Visitor Support WhatsApp',
    value: legacyPrayerContacts[1].value,
    href: legacyPrayerContacts[1].href,
    note: 'Use this for follow-up help locating a branch or joining a service.',
  },
  {
    id: 'harare-address',
    label: 'Harare Assembly',
    value: 'Stand 10466, Lusaka, Highfields',
    note: 'This physical address comes directly from the legacy Zimbabwe branch directory.',
  },
];

export const ministryContacts = [
  {
    id: 'webcast-help',
    title: 'Live Webcast Support',
    description:
      'The previous Zimbabwe site routed online viewers through Zoom, YouTube, and Facebook. Those preserved links remain the clearest verified webcast channels today.',
    destination: legacyZimbabweWebcast.zoomMeetingId,
  },
  {
    id: 'locations-help',
    title: 'Local Church Connections',
    description:
      'The restored branch directory currently covers Zimbabwe most completely. Use the contact options above if you need help being introduced to a listed assembly.',
    destination: '54 preserved Zimbabwe branch listings',
  },
  {
    id: 'resource-help',
    title: 'Streaming Channels',
    description:
      'The archived YouTube and Facebook channels were used for live and replay ministry access on the old site and are now linked again from the webcast page.',
    destination: legacyZimbabweWebcast.youtubeLabel,
  },
];

export const contactNextSteps = [
  'If you are looking for a Zimbabwe assembly, start with the restored locations page and mention the branch or pastor name when you contact us.',
  'If you need help joining an online service, say whether you are using Zoom, YouTube, or Facebook so the team can guide you quickly.',
  'If you are contacting us from outside Zimbabwe, mention your country and nearest city so the regional team can route you while the broader directory is still being rebuilt.',
];
