import PageShell from '../components/PageShell';
import { newsItems } from '../data/newsData';

function formatPublishedAt(value) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

export default function ApostolicFaithMagazinePage({
  featuredDownload,
  readingStreams,
  updates,
}) {
  return (
    <PageShell
      eyebrow="Sanctuary Press"
      title="Global Magazine"
      lead="The definitive record of our regional spiritual heritage and current instruction. We provide access to recovered study documents alongside the integrated reading streams maintained within this digital sanctuary."
      actions={[
        { href: featuredDownload.href, label: 'Retrieve Document' },
        { href: '/news', label: 'View Recent Press', variant: 'secondary' },
      ]}
    >
      <div className="max-w-5xl space-y-24">
        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Archival Highlights</h2>
          <div className="not-prose rounded-3xl border border-foreground/5 bg-card/40 p-10 md:p-12 backdrop-blur-xl shadow-premium">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-6 block">
              Restored Ministry Asset
            </span>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-foreground italic heading-premium mb-6">
                {featuredDownload.title}
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed font-medium mb-4">
                {featuredDownload.description}
            </p>
            <p className="text-muted-foreground/30 text-[10px] font-bold uppercase tracking-widest italic mb-10">
                {featuredDownload.meta}
            </p>
            <a
              href={featuredDownload.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-accent text-accent-foreground px-12 py-5 text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.05]"
            >
              Open Ministry PDF
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Digital Sanctuary Streams</h2>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-10 max-w-3xl">
            While our regional print archives undergo cinematic restoration, readers can engage with these primary instruction channels.
          </p>
          <div className="not-prose grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {readingStreams.map((stream) => (
              <article key={stream.href} className="flex flex-col rounded-3xl border border-foreground/5 bg-card/30 p-8 backdrop-blur-md hover:bg-card/50 transition-all border-b-4 border-b-accent/20">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-6">
                  {stream.label}
                </span>
                <p className="text-muted-foreground font-medium leading-relaxed mb-10 flex-grow">{stream.description}</p>
                <Link
                  href={stream.href}
                  className="inline-flex text-[10px] font-black uppercase tracking-widest text-foreground hover:text-accent transition-all"
                >
                  Enter Stream →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Sanctuary Press Updates</h2>
          <div className="not-prose space-y-6">
            {updates.map((item) => (
              <article key={item.id} className="rounded-3xl border border-foreground/5 bg-foreground/5 p-8 backdrop-blur-sm transition-all hover:bg-foreground/[0.08]">
                <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-6">
                  <span className="bg-accent/10 px-3 py-1 rounded-full border border-accent/20">{item.category}</span>
                  <span className="py-1 text-muted-foreground/40">{formatPublishedAt(item.publishedAt)}</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4 heading-premium italic">{item.title}</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed italic">{item.summary}</p>
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
      featuredDownload: {
        title: 'Bible Study Guide',
        description:
          'A 6-page PDF recovered from the legacy website and now restored into the new webapp as a downloadable reading document.',
        meta: 'PDF document | 6 pages | restored from archived site files',
        href: '/restored/bible_study.pdf',
      },
      readingStreams: [
        {
          label: 'Daily Devotional',
          href: '/daily-devotional-daybreak',
          description:
            'Use this page for devotional reading direction and links into the current teaching flow.',
        },
        {
          label: "This Week's Lessons",
          href: '/library/this-weeks-lessons',
          description:
            'The strongest structured teaching content already maintained on the site lives in the weekly lessons flow.',
        },
        {
          label: 'Media Center',
          href: '/video-archive',
          description:
            'Recovered sermon videos and camp recordings provide real listening and viewing material alongside written reading.',
        },
      ],
      updates: newsItems.slice(0, 3),
    },
  };
}
