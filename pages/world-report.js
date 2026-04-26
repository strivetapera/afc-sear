import PageShell from '../components/PageShell';
import { newsItems } from '../data/newsData';
import Link from 'next/link';
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
      eyebrow="Global Ministry"
      title="World Report"
      lead="Unified updates from our regional sanctuaries and historical field records. We have synchronized our current verified reporting with the preserved public records from our regional archives."
      actions={[
        { href: '/news', label: 'Latest Intelligence' },
        { href: '/video-archive', label: 'Media Highlights', variant: 'secondary' },
      ]}
    >
      <div className="max-w-5xl space-y-24">
        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Verified Sanctuary Updates</h2>
          <div className="not-prose space-y-6">
            {latestReports.map((item) => (
              <article key={item.id} className="rounded-3xl border border-foreground/5 bg-card/30 p-8 backdrop-blur-md hover:bg-card/50 transition-all">
                <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-6">
                  <span className="bg-accent/10 px-3 py-1 rounded-full border border-accent/20">{item.category}</span>
                  <span className="py-1">{item.location}</span>
                  <span className="py-1 text-muted-foreground/40">{formatPublishedAt(item.publishedAt)}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 heading-premium italic leading-tight">{item.title}</h3>
                <p className="text-muted-foreground text-lg leading-relaxed font-medium mb-6">
                    {item.summary}
                </p>
                <div className="pt-6 border-t border-foreground/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest italic">{item.status}</span>
                    <Link href={`/news`} className="text-[10px] font-black uppercase tracking-widest text-accent hover:tracking-[0.2em] transition-all">Read Full Report →</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Archival Foundations</h2>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-10 max-w-3xl">
            These preserved records provide historical depth to our regional reporting, documenting the growth and unification of our ministry.
          </p>
          <div className="not-prose grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {restoredRecords.map((record) => (
              <article key={record.title} className="rounded-3xl border border-foreground/5 bg-card/30 p-8 backdrop-blur-md flex flex-col hover:bg-card/50 transition-all">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4">
                  {record.label}
                </span>
                <h3 className="text-xl font-bold text-foreground mb-4 leading-tight">{record.title}</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8 flex-grow">{record.description}</p>
                <a
                  href={record.href}
                  className="inline-flex text-[10px] font-black uppercase tracking-widest text-accent hover:tracking-[0.2em] transition-all"
                >
                  Inspect Archive →
                </a>
              </article>
            ))}
          </div>
        </section>
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
