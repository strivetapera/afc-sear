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
      <div className="max-w-5xl space-y-24">
        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Restored Regional Records</h2>
          <div className="not-prose grid gap-8 md:grid-cols-3">
            {restoredRecords.map((record) => (
              <article key={record.title} className="flex flex-col rounded-3xl border border-foreground/5 bg-card/30 p-8 backdrop-blur-md transition-all hover:bg-card/50">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-6">
                  {record.label}
                </span>
                <h3 className="text-xl font-bold text-foreground mb-4 heading-premium">{record.title}</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-10 flex-grow">{record.description}</p>
                <Link href={record.href} className="inline-flex text-[10px] font-black uppercase tracking-widest text-accent hover:tracking-[0.2em] transition-all">
                  Inspect Record →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Dated Archive Snapshots</h2>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-10 max-w-3xl">
            Real historical moments preserved from our regional archives, providing a dated public record of ministerial growth.
          </p>
          <div className="not-prose grid gap-8 md:grid-cols-3">
            {sampleMoments.map((item) => (
              <article key={item.id} className="rounded-3xl border border-foreground/5 bg-card/30 p-8 backdrop-blur-md transition-all hover:bg-card/50 hover:shadow-premium border-b-4 border-b-accent/20">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-6 block">
                  {item.date}
                </span>
                <h3 className="text-xl font-bold text-foreground mb-4 heading-premium leading-tight">{item.title}</h3>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest italic mb-2">{item.speaker}</p>
                <p className="text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest mb-10">{item.sessionName}</p>
                <div className="flex flex-col gap-4 pt-6 border-t border-foreground/5">
                  <a
                    href={item.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-black uppercase tracking-widest text-accent hover:tracking-[0.2em] transition-all"
                  >
                    View Cinema Hub
                  </a>
                  <a
                    href={item.audioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-all"
                  >
                    Listen Audio Record
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Regional Visual Memory</h2>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-10 max-w-3xl">
            Recovered legacy imagery from our regional sanctuaries, surfacing the visual history behind our unified fellowship.
          </p>
          <div className="not-prose grid gap-8 md:grid-cols-3">
            {gallery.map((image) => (
              <figure
                key={image.src}
                className="group overflow-hidden rounded-3xl border border-foreground/5 bg-card/30 backdrop-blur-md shadow-premium transition-all hover:scale-[1.02]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-all group-hover:scale-110 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <figcaption className="p-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-relaxed italic border-t border-foreground/5">
                    {image.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="pt-24 border-t border-foreground/5">
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Archive Protocols</h2>
          <div className="not-prose grid gap-8 md:grid-cols-3">
            {readingPrompts.map((item) => (
              <article key={item.title} className="rounded-3xl border border-foreground/5 bg-foreground/5 p-8 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-foreground mb-4 italic heading-premium">{item.title}</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed leading-relaxed">{item.description}</p>
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
