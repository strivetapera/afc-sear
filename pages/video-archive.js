import PageShell from '../components/PageShell';
import {
  legacyCampMeetingRecordings,
  legacyVideoArchive,
  legacyZimbabweWebcast,
} from '../data/legacyZimbabweSiteData';

export default function VideoArchivePage({ campRecordings, sermonVideos }) {
  return (
    <PageShell
      eyebrow="Media"
      title="Media Center"
      lead="The old Zimbabwe website included sermon videos and a substantial 2023 camp meeting archive. That media has now been carried into the new site so the archive is useful again instead of empty."
      actions={[
        { href: legacyZimbabweWebcast.youtubeUrl, label: 'Open YouTube Archive' },
        { href: '/live-webcast', label: 'Go To Live Webcast', variant: 'secondary' },
      ]}
    >
      <h2>Legacy sermon videos</h2>
      <p>
        These sermon links came directly from the previous website&apos;s media dataset and are
        preserved here as the first restored replay library.
      </p>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-2">
        {sermonVideos.map((video) => (
          <article key={video.id} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              {video.type}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-cream">{video.title}</h3>
            <p className="mt-3 text-sm text-cream/80">{video.date}</p>
            <p className="mt-2 text-sm text-cream/75">{video.speaker}</p>
            <p className="mt-4">
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-gold no-underline hover:underline"
              >
                Watch on YouTube
              </a>
            </p>
          </article>
        ))}
      </div>

      <h2>2023 Camp Meeting archive</h2>
      <p>
        The legacy archive also included 30 audio and video entries from December 2023 Camp
        Meeting services. Those recordings now live here and on the Camp Meeting page.
      </p>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-2">
        {campRecordings.map((recording) => (
          <article
            key={recording.id}
            className="rounded-2xl border border-gold/20 bg-white/5 p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              {recording.sessionName}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-cream">
              {recording.title ?? 'Session recording'}
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
