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
      eyebrow="Spiritual Nourishment"
      title="Daily Devotional"
      lead="A path of daily reflection and biblical depth. We have integrated our historical study archives with the current weekly lessons and the live worship rhythm of our regional ministry."
      actions={[
        { href: featuredGuide.href, label: 'Open Study Guide' },
        { href: '/library/this-weeks-lessons', label: 'Weekly Lessons', variant: 'secondary' },
      ]}
    >
      <section className="mb-24">
        <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Archival Companion</h2>
        <div className="not-prose grid gap-0 overflow-hidden rounded-3xl border border-foreground/5 bg-card/30 backdrop-blur-md shadow-premium md:grid-cols-[1.2fr_0.8fr]">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-6">
              Restored Ministry Tool
            </span>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-foreground italic heading-premium mb-6">
                {featuredGuide.title}
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed font-medium mb-4">
                {featuredGuide.description}
            </p>
            <p className="text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest italic mb-10">
                {featuredGuide.meta}
            </p>
            <div className="flex flex-wrap gap-6">
              <a
                href={featuredGuide.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-accent text-accent-foreground px-8 py-4 text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.05]"
              >
                Read Document
              </a>
              <Link
                href="/apostolic-faith-magazine"
                className="inline-flex items-center justify-center rounded-full border border-foreground/10 bg-foreground/5 px-8 py-4 text-sm font-black uppercase tracking-widest text-foreground transition-all hover:bg-foreground hover:text-background"
              >
                Library Hub
              </Link>
            </div>
          </div>
          <div className="relative min-h-[350px] md:min-h[full] border-l border-foreground/5">
            <Image
              src={featuredGuide.imageSrc}
              alt={featuredGuide.imageAlt}
              fill
              priority
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover opacity-80"
            />
          </div>
        </div>
      </section>

      <section className="mb-24">
        <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">This Week&apos;s Lessons</h2>
        <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-10 max-w-3xl">
          Current study materials for unified church teaching and personal growth.
        </p>
        <div className="not-prose grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {devotionalLessons.map((lesson) => (
            <article key={lesson.id} className="rounded-3xl border border-foreground/5 bg-card/30 p-8 backdrop-blur-md transition-all hover:bg-card/50">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4 block">
                {lesson.title}
              </span>
              <h3 className="text-2xl font-bold text-foreground mb-4">{lesson.topic}</h3>
              {lesson.keyVerse && (
                <p className="text-muted-foreground text-sm italic leading-relaxed mb-4 border-l-2 border-accent/20 pl-4">
                  &quot;{lesson.keyVerse.text}&quot; — {lesson.keyVerse.reference}
                </p>
              )}
              {lesson.sourceReference && (
                <p className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-widest mb-8">
                    Reading: {lesson.sourceReference}
                </p>
              )}
              <Link
                href={`/library/lessons/${lesson.categoryKey}`}
                className="inline-flex text-[10px] font-black uppercase tracking-widest text-accent hover:tracking-[0.2em] transition-all"
              >
                Open Lesson →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-20">
        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Worship Rhythm</h2>
          <div className="space-y-6">
            {worshipRhythm.map((event) => (
              <article key={event.id} className="rounded-3xl border border-foreground/5 bg-card/30 p-8 backdrop-blur-md transition-all hover:bg-card/50">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">
                  {event.providerLabel}
                </span>
                <h3 className="text-2xl font-bold text-foreground mb-4">{event.title}</h3>
                <div className="flex flex-col gap-1 mb-8">
                    <span className="text-muted-foreground font-semibold text-sm">{event.occurrenceLabel}</span>
                    <span className="text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">{event.durationLabel}</span>
                </div>
                <a
                  href={event.joinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block w-full text-center py-4 bg-foreground/5 border border-foreground/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  Enter Sanctuary
                </a>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Suggested Rhythm</h2>
          <div className="space-y-6">
            {practiceWindows.map((item) => (
              <article key={item.title} className="rounded-3xl border border-foreground/5 bg-foreground/5 p-8 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-foreground mb-4 italic">{item.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>
        </section>
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
