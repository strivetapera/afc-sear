import {
  legacyPrayerContacts,
  legacyZimbabweBranches,
} from './legacyZimbabweSiteData';

export const locationsPage = {
  eyebrow: 'Locations',
  title: 'Zimbabwe Branch Directory',
  lead:
    'This directory now carries forward the 54-branch Zimbabwe listing from the legacy church website while the wider Southern and Eastern Africa regional map is still being rebuilt.',
};

export const locationsOverview = {
  intro:
    'The previous Zimbabwe website included 54 branch entries. Those verified legacy listings are preserved here first so visitors can still find assemblies, pastors, and the main Harare address while broader regional data is added carefully.',
  contactPrompt:
    'If you do not yet see your nearest congregation outside Zimbabwe, use the Contact page and we will help route you while the larger regional directory is expanded.',
};

export const regionContacts = [
  {
    id: 'harare-address',
    label: 'Harare Assembly',
    value: 'Stand 10466, Lusaka, Highfields',
    note: 'This is the specific address preserved from the legacy Zimbabwe branch directory.',
  },
  {
    id: legacyPrayerContacts[0].id,
    label: 'Visitor Support WhatsApp',
    value: legacyPrayerContacts[0].value,
    href: legacyPrayerContacts[0].href,
    note: 'Legacy visitor and prayer-request WhatsApp contact carried over from the previous website.',
  },
];

export const churchLocations = legacyZimbabweBranches.map((branch) => ({
  id: `${branch.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${branch.id}`,
  country: 'Zimbabwe',
  city: branch.name,
  congregation: `${branch.name} Assembly`,
  address:
    branch.address === 'TBC' ? 'Address details are being updated.' : branch.address,
  serviceTimes: [
    'Sunday School - 9:00 AM',
    'Sunday Devotional Service - 10:30 AM',
    'Tuesday Evangelical Service - 6:00 PM',
    'Friday Bible Teaching - 6:00 PM',
  ],
  contact: 'Use the Contact page for an introduction to this branch.',
  pastor: branch.pastor,
  notes:
    branch.address === 'TBC'
      ? 'This branch came from the legacy Zimbabwe directory and is waiting for a refreshed street address.'
      : 'This branch entry was preserved from the legacy Zimbabwe church directory.',
  livestream: branch.name === 'Harare',
}));
