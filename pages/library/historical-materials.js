import Image from 'next/image';
import Link from 'next/link';
import PageShell from '../../components/PageShell';
import {
  historicalGallery,
  historicalReadingPrompts,
} from '../../data/resourceCollectionsData';
import {
  legacyCampMeetingRecordings,
  legacyZimbabweBranches,
  legacyZimbabweCalendar,
} from '../../data/legacyZimbabweSiteData';

export default function HistoricalMaterialsPage({
  restoredRecords,
  sampleMoments,
  gallery,
  readingPrompts,
}) {
  return (
    <PageShell
      eyebrow="Archive"
      title="Historical Materials"
      lead="Historical Materials now points to real recovered records from the former Zimbabwe website instead of speaking only in future tense. It gathers the public directory, dated calendar references, restored recordings, and legacy imagery that have already been carried into the rebuilt webapp."
      actions={[
        { href: '/video-archive', label: 'Open Media Archive' },
        { href: '/our-churches-map-of-locations', label: 'View Branch Directory', variant: 'secondary' },
      ]}
    >
      <h2>Restored public record</h2>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-3">
        {restoredRecords.map((record) => (
          <article key={record.title} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              {record.label}
            </p>
            <h3 className="mt-3 text-xl font-semibold text-cream">{record.title}</h3>
            <p className="mt-3 text-sm leading-6 text-cream/75">{record.description}</p>
            <p className="mt-4">
              <Link href={record.href} className="text-sm font-semibold text-gold no-underline hover:underline">
                Open record
              </Link>
            </p>
          </article>
        ))}
      </div>

      <h2>Dated archive moments</h2>
      <p>
        These sample entries show how the restored archive now carries real dated material instead
        of vague references to a history section that has not been built yet.
      </p>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-3">
        {sampleMoments.map((item) => (
          <article key={item.id} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              {item.date}
            </p>
            <h3 className="mt-3 text-xl font-semibold text-cream">{item.title}</h3>
            <p className="mt-3 text-sm text-cream/75">{item.speaker}</p>
            <p className="mt-2 text-sm leading-6 text-cream/70">{item.sessionName}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
              <a
                href={item.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-gold no-underline hover:underline"
              >
                Watch video
              </a>
              <a
                href={item.audioUrl}
                target="_blank"
                rel="noreferrer"
                className="text-gold no-underline hover:underline"
              >
                Play audio
              </a>
            </div>
          </article>
        ))}
      </div>

      <h2>Recovered visual memory</h2>
      <p>
        These restored legacy images are kept here as part of the public historical layer of the
        rebuilt site, not as claims of a complete archive.
      </p>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-3">
        {gallery.map((image) => (
          <figure
            key={image.src}
            className="overflow-hidden rounded-2xl border border-gold/20 bg-white/5"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="p-4 text-sm leading-6 text-cream/75">{image.caption}</figcaption>
          </figure>
        ))}
      </div>

      <h2>Read the archive carefully</h2>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-3">
        {readingPrompts.map((item) => (
          <article key={item.title} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <h3 className="text-xl font-semibold text-cream">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-cream/75">{item.description}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function getStaticProps() {
  return {
    props: {
      restoredRecords: [
        {
          label: 'Directory',
          title: `${legacyZimbabweBranches.length} branch listings restored`,
          description:
            'The public branch list carried over from the earlier Zimbabwe site remains the strongest restored directory record now available in the rebuilt app.',
          href: '/our-churches-map-of-locations',
        },
        {
          label: 'Calendar',
          title: legacyZimbabweCalendar.title,
          description:
            'The recovered calendar preserves dated ministry planning references from the older site and is now surfaced clearly as a legacy record.',
          href: '/calendar',
        },
        {
          label: 'Recordings',
          title: `${legacyCampMeetingRecordings.length} camp sessions restored`,
          description:
            'The December 2023 camp archive gives this site a real body of dated preaching and teaching material to preserve.',
          href: '/video-archive',
        },
      ],
      sampleMoments: legacyCampMeetingRecordings.slice(0, 3),
      gallery: historicalGallery,
      readingPrompts: historicalReadingPrompts,
    },
  };
}
