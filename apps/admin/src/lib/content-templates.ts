export type ContentTemplateKey = 'standard_page' | 'home_page';

export type TemplateSectionForm = {
  heading: string;
  paragraphsText: string;
  listText: string;
};

export type ContentTemplateForm = {
  templateKey: ContentTemplateKey;
  eyebrow: string;
  lead: string;
  organizationName: string;
  regionName: string;
  welcomeMessage: string;
  welcomeLead: string;
  imageAlt: string;
  primaryActionLabel: string;
  primaryActionHref: string;
  secondaryActionLabel: string;
  secondaryActionHref: string;
  aboutTitle: string;
  aboutParagraphsText: string;
  sections: TemplateSectionForm[];
};

export const contentTemplateOptions: Array<{
  key: ContentTemplateKey;
  label: string;
  description: string;
}> = [
  {
    key: 'standard_page',
    label: 'Standard Page',
    description: 'Use simple fields for a title, intro text, actions, and content sections.',
  },
  {
    key: 'home_page',
    label: 'Homepage',
    description: 'Edit the welcome message, hero actions, and the introductory homepage copy.',
  },
];

function createEmptySection(heading = '', paragraphsText = '', listText = ''): TemplateSectionForm {
  return {
    heading,
    paragraphsText,
    listText,
  };
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinLines(values?: string[] | null) {
  return values?.filter(Boolean).join('\n') ?? '';
}

export function createContentTemplateForm(templateKey: ContentTemplateKey): ContentTemplateForm {
  if (templateKey === 'home_page') {
    return {
      templateKey,
      eyebrow: 'Welcome',
      lead: '',
      organizationName: 'APOSTOLIC FAITH MISSION',
      regionName: 'Southern & Eastern Africa',
      welcomeMessage: 'Welcome home to worship, Word, and fellowship.',
      welcomeLead:
        'This website provides access to church information, live webcast, news, and public events in Southern & Eastern Africa.',
      imageAlt: 'Interior of the sacred sanctuary',
      primaryActionLabel: 'Join a Service',
      primaryActionHref: '/live-webcast',
      secondaryActionLabel: 'About',
      secondaryActionHref: '/about',
      aboutTitle: 'About',
      aboutParagraphsText:
        'The Apostolic Faith Mission Southern & Eastern Africa is a Bible-centered Christian fellowship dedicated to spreading the Gospel of Jesus Christ and fostering true spiritual restoration.',
      sections: [],
    };
  }

  return {
    templateKey,
    eyebrow: '',
    lead: '',
    organizationName: '',
    regionName: '',
    welcomeMessage: '',
    welcomeLead: '',
    imageAlt: '',
    primaryActionLabel: '',
    primaryActionHref: '',
    secondaryActionLabel: '',
    secondaryActionHref: '',
    aboutTitle: '',
    aboutParagraphsText: '',
    sections: [createEmptySection('Section 1'), createEmptySection('Section 2'), createEmptySection('Section 3')],
  };
}

export function detectContentTemplateKey(slug: string, body: unknown): ContentTemplateKey {
  if (
    slug === 'home' ||
    (body &&
      typeof body === 'object' &&
      'hero' in body &&
      'aboutSection' in body)
  ) {
    return 'home_page';
  }

  return 'standard_page';
}

export function parseContentBodyToTemplateForm({
  slug,
  body,
}: {
  slug: string;
  body: unknown;
}): ContentTemplateForm {
  const templateKey = detectContentTemplateKey(slug, body);
  const fallback = createContentTemplateForm(templateKey);
  const bodyRecord = body && typeof body === 'object' ? (body as Record<string, any>) : {};

  if (templateKey === 'home_page') {
    const hero = bodyRecord.hero && typeof bodyRecord.hero === 'object' ? bodyRecord.hero : {};
    const aboutSection =
      bodyRecord.aboutSection && typeof bodyRecord.aboutSection === 'object'
        ? bodyRecord.aboutSection
        : {};

    return {
      ...fallback,
      eyebrow: hero.eyebrow ?? fallback.eyebrow,
      organizationName: hero.title ?? fallback.organizationName,
      regionName: hero.tagline ?? fallback.regionName,
      welcomeMessage: hero.welcomeMessage ?? fallback.welcomeMessage,
      welcomeLead: hero.welcomeLead ?? fallback.welcomeLead,
      imageAlt: hero.imageAlt ?? fallback.imageAlt,
      primaryActionLabel: hero.primaryAction?.label ?? fallback.primaryActionLabel,
      primaryActionHref: hero.primaryAction?.href ?? fallback.primaryActionHref,
      secondaryActionLabel:
        hero.secondaryAction?.label ?? aboutSection.cta?.label ?? fallback.secondaryActionLabel,
      secondaryActionHref:
        hero.secondaryAction?.href ?? aboutSection.cta?.href ?? fallback.secondaryActionHref,
      aboutTitle: aboutSection.title ?? fallback.aboutTitle,
      aboutParagraphsText: joinLines(aboutSection.paragraphs) || fallback.aboutParagraphsText,
    };
  }

  const actions = Array.isArray(bodyRecord.actions) ? bodyRecord.actions : [];
  const sections = Array.isArray(bodyRecord.sections) ? bodyRecord.sections : [];

  return {
    ...fallback,
    eyebrow: bodyRecord.eyebrow ?? '',
    lead: bodyRecord.lead ?? '',
    primaryActionLabel: actions[0]?.label ?? '',
    primaryActionHref: actions[0]?.href ?? '',
    secondaryActionLabel: actions[1]?.label ?? '',
    secondaryActionHref: actions[1]?.href ?? '',
    sections: sections.length
      ? sections.map((section: any) =>
          createEmptySection(
            section?.heading ?? '',
            joinLines(section?.paragraphs),
            joinLines(section?.list),
          ),
        )
      : fallback.sections,
  };
}

export function buildContentBodyFromTemplateForm({
  templateForm,
  title,
}: {
  templateForm: ContentTemplateForm;
  title: string;
}) {
  if (templateForm.templateKey === 'home_page') {
    return {
      hero: {
        eyebrow: templateForm.eyebrow,
        title: templateForm.organizationName,
        tagline: templateForm.regionName,
        welcomeMessage: templateForm.welcomeMessage,
        welcomeLead: templateForm.welcomeLead,
        imageAlt: templateForm.imageAlt,
        primaryAction: templateForm.primaryActionLabel && templateForm.primaryActionHref
          ? {
              label: templateForm.primaryActionLabel,
              href: templateForm.primaryActionHref,
            }
          : undefined,
        secondaryAction: templateForm.secondaryActionLabel && templateForm.secondaryActionHref
          ? {
              label: templateForm.secondaryActionLabel,
              href: templateForm.secondaryActionHref,
            }
          : undefined,
      },
      aboutSection: {
        title: templateForm.aboutTitle,
        paragraphs: splitLines(templateForm.aboutParagraphsText),
        cta:
          templateForm.secondaryActionLabel && templateForm.secondaryActionHref
            ? {
                label: templateForm.secondaryActionLabel,
                href: templateForm.secondaryActionHref,
              }
            : undefined,
      },
    };
  }

  const actions = [
    templateForm.primaryActionLabel && templateForm.primaryActionHref
      ? {
          label: templateForm.primaryActionLabel,
          href: templateForm.primaryActionHref,
        }
      : null,
    templateForm.secondaryActionLabel && templateForm.secondaryActionHref
      ? {
          label: templateForm.secondaryActionLabel,
          href: templateForm.secondaryActionHref,
          variant: 'secondary' as const,
        }
      : null,
  ].filter(Boolean);

  return {
    eyebrow: templateForm.eyebrow,
    title,
    lead: templateForm.lead,
    actions,
    sections: templateForm.sections
      .map((section) => ({
        heading: section.heading,
        paragraphs: splitLines(section.paragraphsText),
        list: splitLines(section.listText),
      }))
      .filter((section) => section.heading || section.paragraphs.length || section.list.length),
  };
}
