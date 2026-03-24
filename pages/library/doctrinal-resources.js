import Link from 'next/link';
import PageShell from '../../components/PageShell';
import { doctrinalStudyGroups } from '../../data/resourceCollectionsData';

export default function DoctrinalResourcesPage({ studyGroups }) {
  return (
    <PageShell
      eyebrow="Study"
      title="Doctrinal Resources"
      lead="This page now carries real doctrinal study material compiled from the restored doctrine outline on the former Zimbabwe website. The summaries are concise, but the original Scripture emphasis is preserved so readers can study each doctrine from the Bible itself."
      actions={[
        { href: '/our-faith', label: 'Read Our Faith Summary' },
        { href: '/library/this-weeks-lessons', label: 'Pair With Weekly Lessons', variant: 'secondary' },
      ]}
    >
      <h2>How to use this page</h2>
      <p>
        These notes are best used as a study pathway, not as a replacement for Scripture. Each
        topic keeps the major headings and Bible references restored from the older site while
        presenting them in a clearer, easier-to-scan library format.
      </p>

      {studyGroups.map((group) => (
        <section key={group.id} className="not-prose mt-10">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              {group.label}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-gold">{group.label}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-cream/75">{group.description}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {group.topics.map((topic) => (
              <article key={topic.title} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
                <h3 className="text-xl font-semibold text-cream">{topic.title}</h3>
                <p className="mt-3 text-sm leading-6 text-cream/80">{topic.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {topic.references.map((reference) => (
                    <span
                      key={reference}
                      className="rounded-full border border-gold/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-gold/80"
                    >
                      {reference}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <h2>Keep the study connected</h2>
      <p>
        Doctrine is strongest when it remains connected to worship, teaching, and holy living. Use
        the faith summary for a shorter overview, then continue into the weekly lessons if you want
        a more active reading flow through the current site.
      </p>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-gold/20 bg-white/5 p-5">
          <h3 className="text-xl font-semibold text-cream">Our Faith</h3>
          <p className="mt-3 text-sm leading-6 text-cream/75">
            Read the shorter fellowship-wide summary page that introduces the beliefs behind this
            doctrinal library.
          </p>
          <p className="mt-4">
            <Link href="/our-faith" className="text-sm font-semibold text-gold no-underline hover:underline">
              Open Our Faith
            </Link>
          </p>
        </article>
        <article className="rounded-2xl border border-gold/20 bg-white/5 p-5">
          <h3 className="text-xl font-semibold text-cream">This Week&apos;s Lessons</h3>
          <p className="mt-3 text-sm leading-6 text-cream/75">
            Use the current lessons flow to keep doctrine connected to the church&apos;s active
            teaching rhythm instead of treating it as a stand-alone archive.
          </p>
          <p className="mt-4">
            <Link
              href="/library/this-weeks-lessons"
              className="text-sm font-semibold text-gold no-underline hover:underline"
            >
              Open lessons
            </Link>
          </p>
        </article>
      </div>
    </PageShell>
  );
}

export function getStaticProps() {
  return {
    props: {
      studyGroups: doctrinalStudyGroups,
    },
  };
}
