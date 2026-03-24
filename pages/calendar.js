import PageShell from '../components/PageShell';
import {
  legacyZimbabweCalendar,
  legacyZimbabweWebcast,
} from '../data/legacyZimbabweSiteData';

export default function CalendarPage({ calendar }) {
  return (
    <PageShell
      eyebrow="Planning"
      title="Calendar"
      lead="This page now preserves the 2024-2025 church calendar that was published on the older Zimbabwe website. Because those dated entries are historical as of March 23, 2026, they are shown here as archived planning reference rather than current upcoming events."
      actions={[
        { href: '/events', label: 'View Current Recurring Events' },
        { href: '/live-webcast', label: 'Open Live Webcast', variant: 'secondary' },
      ]}
    >
      <p>
        <strong>{calendar.title}</strong> came from the legacy schedule dataset. For current weekly
        services, use the Events page. For dated special-event reference from the older site, use
        the archived entries below.
      </p>

      <div className="not-prose mt-8 rounded-2xl border border-gold/20 bg-white/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
          Legacy note
        </p>
        <p className="mt-3 text-sm leading-6 text-cream/80">{calendar.note}</p>
        <p className="mt-4 text-sm leading-6 text-cream/70">
          The same old schedule page also linked viewers to the restored webcast channels on{' '}
          <a href={legacyZimbabweWebcast.youtubeUrl} target="_blank" rel="noreferrer">
            YouTube
          </a>{' '}
          and{' '}
          <a href={legacyZimbabweWebcast.facebookUrl} target="_blank" rel="noreferrer">
            Facebook
          </a>
          .
        </p>
      </div>

      <div className="not-prose mt-8 grid gap-4 md:grid-cols-2">
        {calendar.months.map((month) => (
          <section key={month.month} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <h2 className="text-2xl font-semibold text-gold">{month.month}</h2>
            <ul className="mt-4 space-y-3">
              {month.items.map((item) => (
                <li key={`${month.month}-${item.title}`} className="rounded-2xl bg-black/20 p-4">
                  <p className="text-base font-semibold text-cream">{item.title}</p>
                  <p className="mt-1 text-sm text-cream/75">{item.time}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

export function getStaticProps() {
  return {
    props: {
      calendar: legacyZimbabweCalendar,
    },
  };
}
