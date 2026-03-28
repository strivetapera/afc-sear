import { contactChannels, contactNextSteps, contactPage, ministryContacts } from './contactData.js';
import { churchLocations } from './locationsData.js';
import { newsPage } from './newsData.js';
import { structuredPages } from './structuredPagesData.js';

const eventsPageBody = {
  eyebrow: 'Events',
  title: 'Upcoming Events',
  lead:
    'Join our recurring services and regional gatherings. Worship, prayer, and unified ministry events across the Southern and Eastern Africa Region.',
  actions: [
    { href: '/calendar', label: 'View Yearly Calendar', variant: 'secondary' },
    { href: '/live-webcast', label: 'Join Live Webcast' },
  ],
  sections: [
    {
      heading: 'Gather With The Fellowship',
      paragraphs: [
        'Our public events page highlights currently published conferences, meetings, and special services that are open through the platform.',
        'As the regional scheduling system expands, this page remains the live public source for what visitors can attend, register for, and share.',
      ],
    },
    {
      heading: 'How To Use This Page',
      list: [
        'Open an event to view venue, schedule, and registration details.',
        'Use the live webcast page for current online worship access.',
        'Check the yearly calendar for broader ministry rhythm and seasonal planning.',
      ],
    },
  ],
};

const newsLandingBody = {
  eyebrow: newsPage.eyebrow,
  title: newsPage.title,
  lead: newsPage.lead,
  actions: [
    { href: '/world-report', label: 'World Report' },
    { href: '/contact', label: 'Regional Office', variant: 'secondary' },
  ],
  sections: [
    {
      heading: 'Verified Regional Updates',
      paragraphs: [
        'This stream carries public announcements, ministry milestones, and operational updates that are safe to publish across the platform.',
        'Every item shown here is intended to be manageable from the platform itself so administrators can edit, publish, or remove updates without changing application code.',
      ],
    },
  ],
};

const contactStructuredPage = {
  eyebrow: contactPage.eyebrow,
  title: contactPage.title,
  lead: contactPage.lead,
  actions: [
    { href: '/live-webcast', label: 'Join Live Webcast' },
    { href: '/about', label: 'About AFC SEAR', variant: 'secondary' },
  ],
  sections: [
    {
      heading: 'Regional Contact Channels',
      cards: contactChannels.map((channel) => ({
        title: `${channel.label}: ${channel.value}`,
        description: channel.note,
      })),
    },
    {
      heading: 'Ministry Support',
      cards: ministryContacts.map((ministry) => ({
        title: ministry.title,
        description: `${ministry.description} ${ministry.destination}`.trim(),
      })),
    },
    {
      heading: 'Contact Protocol',
      list: contactNextSteps,
    },
    {
      heading: 'Directory Snapshot',
      paragraphs: [
        'The restored platform already carries forward the Zimbabwe branch directory as system data, with branch names, pastors, and contact context managed inside the current data model.',
      ],
      cards: churchLocations.slice(0, 6).map((branch) => ({
        title: branch.congregation,
        description: `${branch.city} • ${branch.pastor} • ${branch.address}`,
      })),
    },
  ],
};

const lessonsLandingBody = {
  eyebrow: 'Unified Teaching',
  title: 'Weekly Lessons',
  lead:
    'Our regional curriculum for personal study and sanctuary teaching. These lessons provide a consistent biblical foundation across our fellowship and are managed through the platform content system.',
  actions: [
    { href: '/library/curriculum', label: 'Curriculum' },
    { href: '/live-webcast', label: 'Join Our Webcast', variant: 'secondary' },
  ],
  sections: [
    {
      heading: 'Current Lesson Flow',
      paragraphs: [
        'Lesson entries on this page are sourced from published lesson content in the platform, so administrators can revise, publish, and remove them without touching application code.',
      ],
    },
    {
      heading: 'How To Use The Curriculum',
      list: [
        'Open any published lesson to read the full teaching content.',
        'Use the curriculum page for the broader doctrinal map behind the lesson cycle.',
        'Coordinate weekly study with live webcast teaching and local branch fellowship.',
      ],
    },
  ],
};

function buildPageDefinition(slug, body) {
  const title =
    body?.title ??
    body?.hero?.title ??
    body?.metadata?.title ??
    slug.replaceAll('-', ' ');
  const summary =
    body?.lead ??
    body?.aboutSection?.paragraphs?.[0] ??
    body?.sections?.[0]?.paragraphs?.[0] ??
    title;

  return { slug, title, summary, body };
}

export const corePageImports = [
  buildPageDefinition('home', structuredPages.homePage),
  buildPageDefinition('about', structuredPages.about),
  buildPageDefinition('our-faith', structuredPages.ourFaith),
  buildPageDefinition('apostolic-faith-magazine', structuredPages.apostolicFaithMagazine),
  buildPageDefinition('daily-devotional-daybreak', structuredPages.dailyDevotional),
  buildPageDefinition('library/curriculum', structuredPages.curriculum),
  buildPageDefinition('library/doctrinal-resources', structuredPages.doctrinalResources),
  buildPageDefinition('library/foreign-languages', structuredPages.foreignLanguages),
  buildPageDefinition('library/historical-materials', structuredPages.historicalMaterials),
  buildPageDefinition('library/this-weeks-lessons', lessonsLandingBody),
  buildPageDefinition('minister-resources', structuredPages.ministerResources),
  buildPageDefinition('music-resources', structuredPages.musicResources),
  buildPageDefinition('privacy-policy', structuredPages.privacyPolicy),
  buildPageDefinition('terms-of-use', structuredPages.termsOfUse),
  buildPageDefinition('world-report', structuredPages.worldReport),
  buildPageDefinition('video-archive', structuredPages.videoArchive),
  buildPageDefinition('calendar', structuredPages.calendar),
  buildPageDefinition('camp-meeting', structuredPages.campMeeting),
  buildPageDefinition('contact', contactStructuredPage),
  buildPageDefinition('news', newsLandingBody),
  buildPageDefinition('events', eventsPageBody),
];
