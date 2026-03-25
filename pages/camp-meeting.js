import PageShell from '../components/PageShell';
import {
  legacyCampMeetingRecordings,
  legacyZimbabweCalendar,
} from '../data/legacyZimbabweSiteData';

export default function CampMeetingPage({ campDates, highlights }) {
  return (
    <PageShell
      eyebrow="Sanctuary Gatherings"
      title="Camp Meeting"
      lead="Our regional spiritual summits and holy convocations. Explore preserved archival materials from historical Zimbabwe camp meetings and access replays of our most recent unified ministry services."
      actions={[
        { href: '/video-archive', label: 'Explore Media Archive' },
        { href: '/calendar', label: 'Regional Outlook', variant: 'secondary' },
      ]}
    >
      <div className="max-w-5xl space-y-24">
        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Historical Timeline</h2>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-10 max-w-3xl">
            These liturgical dates represent the preserved 2025 cycle. They remain available for ministry planning and historical alignment with our regional heritage.
          </p>
          <div className="not-prose grid gap-6 md:grid-cols-2">
            {campDates.map((item) => (
              <article key={`${item.month}-${item.title}`} className="rounded-3xl border border-foreground/5 bg-card/30 p-8 backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-card/50">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4">
                  {item.month}
                </p>
                <h3 className="text-2xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[10px]">{item.time}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Ministry Replays</h2>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-10 max-w-3xl">
            Stream the December services which marked our regional unification. Full cinematic archives are available in the integrated Media Center.
          </p>
          <div className="not-prose grid gap-8 md:grid-cols-2">
            {highlights.map((recording) => (
              <article
                key={recording.id}
                className="group rounded-3xl border border-foreground/5 bg-card/30 p-8 backdrop-blur-md transition-all hover:bg-card/50"
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
                  <a
                    href={recording.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent hover:tracking-[0.2em] transition-all"
                  >
                    Watch Cinema →
                  </a>
                  <a
                    href={recording.audioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
                  >
                    Listen Audio
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
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
