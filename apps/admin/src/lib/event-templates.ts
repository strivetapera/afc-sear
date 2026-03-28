export type EventTemplateKey = 'service' | 'conference' | 'meeting' | 'concert';

export const eventTemplateOptions: Array<{
  key: EventTemplateKey;
  label: string;
  description: string;
  defaults: {
    eventType: string;
    visibility: string;
    registrationMode: string;
    summary: string;
  };
}> = [
  {
    key: 'service',
    label: 'Service',
    description: 'For regular worship services, prayer meetings, and open gatherings.',
    defaults: {
      eventType: 'SERVICE',
      visibility: 'PUBLIC',
      registrationMode: 'OPEN',
      summary: 'Public worship service.',
    },
  },
  {
    key: 'conference',
    label: 'Conference',
    description: 'For camp meetings, conventions, and regional conferences.',
    defaults: {
      eventType: 'CONFERENCE',
      visibility: 'PUBLIC',
      registrationMode: 'OPEN',
      summary: 'Regional conference or camp meeting.',
    },
  },
  {
    key: 'meeting',
    label: 'Meeting',
    description: 'For ministry meetings, branch meetings, or focused gatherings.',
    defaults: {
      eventType: 'MEETING',
      visibility: 'PUBLIC',
      registrationMode: 'OPEN',
      summary: 'Scheduled church meeting.',
    },
  },
  {
    key: 'concert',
    label: 'Concert',
    description: 'For choir presentations, music nights, and special singing services.',
    defaults: {
      eventType: 'CONCERT',
      visibility: 'PUBLIC',
      registrationMode: 'OPEN',
      summary: 'Music service or concert.',
    },
  },
];
