import Image from 'next/image';
import Link from 'next/link';
import PageShell from '../components/PageShell';
import { devotionalPracticeWindows } from '../data/resourceCollectionsData';
import {
  getOnlineEventsStructured,
  getThisWeeksLessonsStructured,
} from '../lib/eventUtils';

export default function DailyDevotionalPage({
  featuredGuide,
  devotionalLessons,
  worshipRhythm,
  practiceWindows,
}) {
  return (
    <PageShell
      eyebrow="Daily Reading"
      title="Daily Devotional"
      lead="This page now gives readers a real devotional path through the rebuilt site. It pairs a restored Bible study guide from the older website with the current weekly lessons and online worship rhythm already maintained in this webapp."
      actions={[
        { href: featuredGuide.href, label: 'Open Bible Study Guide' },
        { href: '/library/this-weeks-lessons', label: 'Browse Weekly Lessons', variant: 'secondary' },
      ]}
    >
      <h2>Restored study companion</h2>
      <div className="not-prose mt-4 grid gap-6 overflow-hidden rounded-3xl border border-gold/20 bg-white/5 md:grid-cols-[1.15fr_0.85fr]">
        <div className="p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
            Restored archive download
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-cream">{featuredGuide.title}</h3>
          <p className="mt-4 text-sm leading-6 text-cream/80">{featuredGuide.description}</p>
          <p className="mt-4 text-sm text-cream/65">{featuredGuide.meta}</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href={featuredGuide.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-semibold text-black no-underline transition hover:bg-[#f2cc00]"
            >
              Read the PDF
            </a>
            <Link
              href="/apostolic-faith-magazine"
              className="inline-flex rounded-full border border-gold/40 px-5 py-3 text-sm font-semibold text-gold no-underline transition hover:border-gold hover:bg-gold/10"
            >
              Open reading hub
            </Link>
          </div>
        </div>
        <div className="relative min-h-[260px]">
          <Image
            src={featuredGuide.imageSrc}
            alt={featuredGuide.imageAlt}
            fill
            priority
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <h2>This week&apos;s devotional companions</h2>
      <p>
        These current lessons give homes, teachers, and ministry teams something real to read with
        this week instead of waiting for a future devotional archive.
      </p>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {devotionalLessons.map((lesson) => (
          <article key={lesson.id} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              {lesson.title}
            </p>
            <h3 className="mt-3 text-xl font-semibold text-cream">{lesson.topic}</h3>
            {lesson.keyVerse ? (
              <p className="mt-3 text-sm italic leading-6 text-cream/75">
                &quot;{lesson.keyVerse.text}&quot; - {lesson.keyVerse.reference}
              </p>
            ) : null}
            {lesson.sourceReference ? (
              <p className="mt-3 text-sm text-cream/65">Reading: {lesson.sourceReference}</p>
            ) : null}
            <p className="mt-4">
              <Link
                href={`/library/lessons/${lesson.categoryKey}`}
                className="text-sm font-semibold text-gold no-underline hover:underline"
              >
                Open lesson
              </Link>
            </p>
          </article>
        ))}
      </div>

      <h2>Prayer and worship rhythm</h2>
      <p>
        Online services already give this devotional page a real weekly rhythm. Readers can pair
        personal study with the live prayer, Bible study, and worship schedule shown here.
      </p>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-3">
        {worshipRhythm.map((event) => (
          <article key={event.id} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              {event.providerLabel}
            </p>
            <h3 className="mt-3 text-xl font-semibold text-cream">{event.title}</h3>
            <p className="mt-3 text-sm leading-6 text-cream/80">{event.occurrenceLabel}</p>
            <p className="mt-2 text-sm text-cream/65">{event.durationLabel}</p>
            {event.description ? (
              <p className="mt-3 text-sm leading-6 text-cream/75">{event.description}</p>
            ) : null}
            <p className="mt-4">
              <a
                href={event.joinUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-gold no-underline hover:underline"
              >
                Join online
              </a>
            </p>
          </article>
        ))}
      </div>

      <h2>Suggested devotional rhythm</h2>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-3">
        {practiceWindows.map((item) => (
          <article key={item.title} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <h3 className="text-xl font-semibold text-cream">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-cream/75">{item.description}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export async function getStaticProps() {
  const lessons = await getThisWeeksLessonsStructured();
  const worshipRhythm = await getOnlineEventsStructured(3);

  return {
    props: {
      featuredGuide: {
        title: 'Bible Study Guide',
        description:
          'This restored PDF from the earlier website now gives the devotional page a genuine reading companion instead of a purely descriptive introduction.',
        meta: 'Recovered archive document | PDF download | restored from legacy site files',
        href: '/restored/bible_study.pdf',
        imageSrc: '/restored/study.jpg',
        imageAlt: 'Bible study image restored from the archived church website',
      },
      devotionalLessons: lessons.slice(0, 5),
      worshipRhythm,
      practiceWindows: devotionalPracticeWindows,
    },
  };
}
