import PageShell from '../components/PageShell';
import {
  legacyCampMeetingRecordings,
  legacyZimbabweCalendar,
} from '../data/legacyZimbabweSiteData';

export default function CampMeetingPage({ campDates, highlights }) {
  return (
    <PageShell
      eyebrow="Gatherings"
      title="Camp Meeting"
      lead="Camp Meeting now includes real preserved material from the previous Zimbabwe website: the December 2025 calendar reference and a replay archive from the December 2023 services."
      actions={[
        { href: '/video-archive', label: 'Open Full Camp Archive' },
        { href: '/calendar', label: 'See Legacy Calendar', variant: 'secondary' },
      ]}
    >
      <h2>Legacy calendar references</h2>
      <p>
        These are the camp-related dates carried over from the older website&apos;s 2025 church
        calendar. They are historical reference now, but they keep the prior planning information
        available in the right place.
      </p>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-2">
        {campDates.map((item) => (
          <article key={`${item.month}-${item.title}`} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              {item.month}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-cream">{item.title}</h3>
            <p className="mt-3 text-sm text-cream/75">{item.time}</p>
          </article>
        ))}
      </div>

      <h2>2023 Camp Meeting replay highlights</h2>
      <p>
        The prior site also contained December 2023 camp recordings. A highlight set is surfaced
        here, with the full archive available on the Media Center page.
      </p>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-2">
        {highlights.map((recording) => (
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
  const campDates = legacyZimbabweCalendar.months.flatMap((month) =>
    month.items
      .filter((item) => /camp/i.test(item.title))
      .map((item) => ({
        month: month.month,
        title: item.title,
        time: item.time,
      }))
  );

  return {
    props: {
      campDates,
      highlights: legacyCampMeetingRecordings.slice(0, 8),
    },
  };
}
