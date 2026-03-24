import Image from 'next/image';
import PageShell from '../components/PageShell';
import { newsItems } from '../data/newsData';
import {
  legacyCampMeetingRecordings,
  legacyZimbabweWebcast,
} from '../data/legacyZimbabweSiteData';

function formatPublishedAt(value) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

export default function MusicResourcesPage({ featuredUpdate, musicRecordings, gallery }) {
  return (
    <PageShell
      eyebrow="Worship"
      title="Music Resources"
      lead="This page now includes real uploaded music-adjacent content from the restored site: choir imagery, a current choir-related update, and recovered music service recordings from the December 2023 camp archive."
      actions={[
        { href: '/video-archive', label: 'Open Media Center' },
        { href: legacyZimbabweWebcast.youtubeUrl, label: 'Open YouTube Channel', variant: 'secondary' },
      ]}
    >
      <h2>Current music ministry update</h2>
      <div className="not-prose rounded-2xl border border-gold/20 bg-white/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
          {featuredUpdate.category} | {formatPublishedAt(featuredUpdate.publishedAt)}
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-cream">{featuredUpdate.title}</h3>
        <p className="mt-3 text-sm leading-6 text-cream/75">{featuredUpdate.summary}</p>
        <p className="mt-3 text-sm text-cream/65">Status: {featuredUpdate.status}</p>
      </div>

      <h2>Recovered music recordings</h2>
      <p>
        These music-related sessions were recovered from the December 2023 camp meeting archive and
        now give this page real listening material.
      </p>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-2">
        {musicRecordings.map((recording) => (
          <article key={recording.id} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              {recording.sessionName}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-cream">
              {recording.title ?? 'Music session recording'}
            </h3>
            <p className="mt-3 text-sm text-cream/80">{recording.date}</p>
            {recording.speaker ? (
              <p className="mt-2 text-sm text-cream/75">{recording.speaker}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
              <a
                href={recording.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-gold no-underline hover:underline"
              >
                Watch video
              </a>
              <a
                href={recording.audioUrl}
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

      <h2>Choir gallery</h2>
      <p>
        These choir images were recovered from the old website assets and now help this page feel
        like a real ministry space rather than a text-only placeholder.
      </p>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-3">
        {gallery.map((image) => (
          <figure key={image.src} className="overflow-hidden rounded-2xl border border-gold/20 bg-white/5">
            <div className="relative aspect-[4/3]">
              <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="p-4 text-sm leading-6 text-cream/75">{image.caption}</figcaption>
          </figure>
        ))}
      </div>
    </PageShell>
  );
}

export function getStaticProps() {
  const featuredUpdate =
    newsItems.find((item) => item.id === 'choir-training-weekend') ?? newsItems[0];
  const musicRecordings = legacyCampMeetingRecordings.filter(
    (item) => /music/i.test(item.sessionName) || /music/i.test(item.title ?? '')
  );

  return {
    props: {
      featuredUpdate,
      musicRecordings,
      gallery: [
        {
          src: '/restored/choir_BG.jpg',
          alt: 'Choir group from restored church archive',
          caption: 'Recovered background image from the older website music assets.',
        },
        {
          src: '/restored/choir.png',
          alt: 'Choir photo from restored archive',
          caption: 'Choir image restored from the archived site files.',
        },
        {
          src: '/restored/choir2.png',
          alt: 'Second choir photo from restored archive',
          caption: 'Additional choir image restored from the archived site files.',
        },
      ],
    },
  };
}
