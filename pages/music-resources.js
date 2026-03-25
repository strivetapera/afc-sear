import Image from 'next/image';
import PageShell from '../components/PageShell';
import { newsItems } from '../data/newsData';
import {
  legacyCampMeetingRecordings,
  legacyZimbabweWebcast,
} from '../data/legacyZimbabweSiteData';
import { useState } from 'react';
import MediaCinema from '../components/MediaCinema';
import Link from 'next/link';

function formatPublishedAt(value) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
}

export default function MusicResourcesPage({ featuredUpdate, musicRecordings, gallery }) {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isCinemaOpen, setIsCinemaOpen] = useState(false);

  const openCinema = (media, type = 'video') => {
    setSelectedMedia({ ...media, type });
    setIsCinemaOpen(true);
  };

  const closeCinema = () => {
    setIsCinemaOpen(false);
    setSelectedMedia(null);
  };

  return (
    <PageShell
      eyebrow="Sacred Worship"
      title="Music Center"
      lead="A unified record of our regional choir ministry and worship archives. We have restored legacy imagery and sanctuary recordings from our December 2023 summits, preserving the melodic history of our fellowship."
      actions={[
        { href: '/video-archive', label: 'Sanctuary Archive' },
        { href: legacyZimbabweWebcast.youtubeUrl, label: 'Broadcast Channel', variant: 'secondary' },
      ]}
    >
      <div className="max-w-5xl space-y-24">
        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Sanctuary Choir Intelligence</h2>
          <div className="not-prose rounded-3xl border border-foreground/5 bg-card/40 p-10 md:p-12 backdrop-blur-xl shadow-premium">
            <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-6">
              <span className="bg-accent/10 px-3 py-1 rounded-full border border-accent/20">{featuredUpdate.category}</span>
              <span className="py-1 text-muted-foreground/40">{formatPublishedAt(featuredUpdate.publishedAt)}</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-foreground italic heading-premium mb-6">
                {featuredUpdate.title}
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed font-medium mb-10">
                {featuredUpdate.summary}
            </p>
            <div className="pt-6 border-t border-foreground/5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest italic">{featuredUpdate.status}</span>
                <Link href={`/news`} className="text-[10px] font-black uppercase tracking-widest text-accent hover:tracking-[0.2em] transition-all">Read Ministry Bulletin →</Link>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Recovered Worship Sessions</h2>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-10 max-w-3xl">
            Live worship recordings recovered from the December 2023 regional summits, providing a genuine auditory record of our sanctuary services.
          </p>
          <div className="not-prose grid gap-8 md:grid-cols-2">
            {musicRecordings.map((recording) => (
              <article key={recording.id} className="rounded-3xl border border-foreground/5 bg-card/30 p-8 backdrop-blur-md transition-all hover:bg-card/50 hover:shadow-premium border-b-4 border-b-accent/20">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-6 block">
                  {recording.sessionName}
                </span>
                <h3 className="text-2xl font-bold text-foreground mb-4 heading-premium leading-tight">
                  {recording.title ?? 'Music session recording'}
                </h3>
                <div className="flex justify-between items-center mb-10 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">
                    <span>{recording.date}</span>
                    {recording.speaker && <span className="border-l border-foreground/5 pl-4">{recording.speaker}</span>}
                </div>
                <div className="flex flex-wrap gap-6 pt-6 border-t border-foreground/5">
                  <button
                    onClick={() => openCinema(recording, 'video')}
                    className="text-[10px] font-black uppercase tracking-widest text-accent hover:tracking-[0.2em] transition-all cursor-pointer"
                  >
                    Watch Cinema Hub →
                  </button>
                  <button
                    onClick={() => openCinema(recording, 'audio')}
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-all cursor-pointer"
                  >
                    Listen Audio
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Choir Visual Archive</h2>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-10 max-w-3xl">
            Recovered visual memory of our regional choir ministry, preserved from our previous digital sanctuary archives.
          </p>
          <div className="not-prose grid gap-8 md:grid-cols-3">
            {gallery.map((image) => (
              <figure key={image.src} className="group overflow-hidden rounded-3xl border border-foreground/5 bg-card/30 backdrop-blur-md transition-all hover:scale-[1.02] shadow-premium">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-all group-hover:scale-110 opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <figcaption className="p-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic leading-relaxed border-t border-foreground/5">
                    {image.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>

      <MediaCinema 
        isOpen={isCinemaOpen} 
        onClose={closeCinema} 
        media={selectedMedia} 
      />
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
