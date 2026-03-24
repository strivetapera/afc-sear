import PageShell from '../components/PageShell';
import { newsItems } from '../data/newsData';
import {
  legacyCampMeetingRecordings,
  legacyZimbabweBranches,
  legacyZimbabweCalendar,
} from '../data/legacyZimbabweSiteData';

function formatPublishedAt(value) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

export default function WorldReportPage({ latestReports, restoredRecords }) {
  return (
    <PageShell
      eyebrow="Reports"
      title="World Report"
      lead="World Report now carries actual site-ready material instead of only editorial guidance. It brings together current verified updates and the strongest historical public records restored from the former Zimbabwe website."
      actions={[
        { href: '/news', label: 'Read Latest News' },
        { href: '/video-archive', label: 'Open Media Archive', variant: 'secondary' },
      ]}
    >
      <h2>Latest verified reports</h2>
      <p>
        These are the current public updates already maintained on the site and suitable for report
        reading today.
      </p>
      <div className="not-prose mt-4 space-y-4">
        {latestReports.map((item) => (
          <article key={item.id} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              <span>{item.category}</span>
              <span>{item.location}</span>
              <span>{formatPublishedAt(item.publishedAt)}</span>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-cream">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-cream/75">{item.summary}</p>
            <p className="mt-3 text-sm text-cream/65">Status: {item.status}</p>
          </article>
        ))}
      </div>

      <h2>Restored public record</h2>
      <p>
        The archived Zimbabwe website contained public records that now give this page some real
        historical depth instead of abstract reporting language.
      </p>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-3">
        {restoredRecords.map((record) => (
          <article key={record.title} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              {record.label}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-cream">{record.title}</h3>
            <p className="mt-3 text-sm leading-6 text-cream/75">{record.description}</p>
            <p className="mt-4">
              <a
                href={record.href}
                className="text-sm font-semibold text-gold no-underline hover:underline"
              >
                Open record
              </a>
            </p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function getStaticProps() {
  return {
    props: {
      latestReports: newsItems,
      restoredRecords: [
        {
          label: 'Directory',
          title: `${legacyZimbabweBranches.length} Zimbabwe branch listings`,
          description:
            'The restored branch directory is now the clearest public record of local church footprint carried over from the older site.',
          href: '/our-churches-map-of-locations',
        },
        {
          label: 'Media record',
          title: `${legacyCampMeetingRecordings.length} camp recordings restored`,
          description:
            'December 2023 camp meeting recordings now give the site a substantial body of dated public ministry record.',
          href: '/video-archive',
        },
        {
          label: 'Calendar record',
          title: legacyZimbabweCalendar.title,
          description:
            'The archived church calendar preserves dated planning references from the older website for historical context.',
          href: '/calendar',
        },
      ],
    },
  };
}
