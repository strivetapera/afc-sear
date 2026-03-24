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
      eyebrow="Publishing"
      title="Apostolic Faith Magazine"
      lead="This page now serves as a real reading and download hub instead of a guidance-only placeholder. The first recovered document is a Bible Study guide PDF from the old website, and the page also points readers to current streams of published content already maintained in this rebuild."
      actions={[
        { href: featuredDownload.href, label: 'Download Bible Study Guide' },
        { href: '/news', label: 'Read Latest Updates', variant: 'secondary' },
      ]}
    >
      <h2>Featured download</h2>
      <div className="not-prose mt-4 rounded-2xl border border-gold/20 bg-white/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
          Restored document
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-cream">{featuredDownload.title}</h3>
        <p className="mt-3 text-sm leading-6 text-cream/80">{featuredDownload.description}</p>
        <p className="mt-3 text-sm text-cream/70">{featuredDownload.meta}</p>
        <p className="mt-5">
          <a
            href={featuredDownload.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-semibold text-black no-underline transition hover:bg-[#f2cc00]"
          >
            Open PDF
          </a>
        </p>
      </div>

      <h2>Current reading streams</h2>
      <p>
        While a full magazine issue archive has not yet been recovered, readers can already use the
        live content streams below for teaching, devotional reading, and ministry updates.
      </p>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-3">
        {readingStreams.map((stream) => (
          <article key={stream.href} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              {stream.label}
            </p>
            <p className="mt-3 text-sm leading-6 text-cream/75">{stream.description}</p>
            <p className="mt-4">
              <a
                href={stream.href}
                className="text-sm font-semibold text-gold no-underline hover:underline"
              >
                Open {stream.label}
              </a>
            </p>
          </article>
        ))}
      </div>

      <h2>Recent publishable updates</h2>
      <p>
        These current site updates are the closest thing to an active publishing stream until a
        fuller magazine archive is uploaded.
      </p>
      <div className="not-prose mt-4 space-y-4">
        {updates.map((item) => (
          <article key={item.id} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              <span>{item.category}</span>
              <span>{formatPublishedAt(item.publishedAt)}</span>
            </div>
            <h3 className="mt-3 text-xl font-semibold text-cream">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-cream/75">{item.summary}</p>
          </article>
        ))}
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
