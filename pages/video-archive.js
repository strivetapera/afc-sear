import React, { useState } from 'react';
import PageShell from '../components/PageShell';
import {
  legacyCampMeetingRecordings,
  legacyVideoArchive,
  legacyZimbabweWebcast,
} from '../data/legacyZimbabweSiteData';
import MediaCinema from '../components/MediaCinema';

export default function VideoArchivePage({ campRecordings, sermonVideos }) {
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
      eyebrow="Sanctuary Media"
      title="Media Center"
      lead="Our unified regional archive of cinematic sermons and spiritual summations. We have fully integrated the preserved history from the previous Zimbabwe website alongside our current live ministry streams."
      actions={[
        { href: legacyZimbabweWebcast.youtubeUrl, label: 'YouTube Archive' },
        { href: '/live-webcast', label: 'Join Live Feed', variant: 'secondary' },
      ]}
    >
      <div className="max-w-5xl space-y-24">
        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Restored Ministry Replays</h2>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-10 max-w-3xl">
            Legacy sermon archives recovered directly from the prior ministry site, preserved for teaching and historical edification.
          </p>
          <div className="not-prose grid gap-8 md:grid-cols-2">
            {sermonVideos.map((video) => (
              <article key={video.id} className="group rounded-3xl border border-foreground/5 bg-card/30 p-8 backdrop-blur-md transition-all hover:bg-card/50">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4 block">
                  {video.type}
                </span>
                <h3 className="text-2xl font-bold text-foreground mb-3">{video.title}</h3>
                <div className="flex flex-col gap-1 mb-8">
                    <span className="text-muted-foreground font-semibold text-sm">{video.date}</span>
                    <span className="text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest italic border-l-2 border-accent/20 pl-3">{video.speaker}</span>
                </div>
                <button
                  onClick={() => openCinema(video)}
                  className="inline-flex text-[10px] font-black uppercase tracking-widest text-accent hover:tracking-[0.2em] transition-all cursor-pointer"
                >
                  Stream via Cinema Hub →
                </button>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Regional Summits (2023)</h2>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-10 max-w-3xl">
            A comprehensive preservation of the December 2023 Camp Meetings, featuring unified regional ministry and sanctuary services.
          </p>
          <div className="not-prose grid gap-8 md:grid-cols-2">
            {campRecordings.map((recording) => (
              <article
                key={recording.id}
                className="rounded-3xl border border-foreground/5 bg-card/30 p-8 backdrop-blur-md transition-all hover:bg-card/50"
              >
                <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                        {recording.sessionName}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground/30 italic uppercase">
                        {recording.date}
                    </span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3 heading-premium">
                  {recording.title ?? 'Session recording'}
                </h3>
                {recording.speaker && (
                  <p className="text-muted-foreground font-medium italic mb-8 border-l-2 border-accent/20 pl-4">{recording.speaker}</p>
                )}
                <div className="flex flex-wrap gap-8 items-center pt-6 border-t border-foreground/5">
                  <button
                    onClick={() => openCinema(recording)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent hover:tracking-[0.2em] transition-all cursor-pointer"
                  >
                    Watch Cinema →
                  </button>
                  <button
                    onClick={() => openCinema(recording, 'audio')}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  >
                    Listen Audio
                  </button>
                </div>
              </article>
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
  return {
    props: {
      sermonVideos: legacyVideoArchive,
      campRecordings: legacyCampMeetingRecordings,
    },
  };
}
