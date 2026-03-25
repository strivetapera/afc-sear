import PageShell from '../components/PageShell';
import {
  legacyZimbabweCalendar,
  legacyZimbabweWebcast,
} from '../data/legacyZimbabweSiteData';

export default function CalendarPage({ calendar }) {
  return (
    <PageShell
      eyebrow="Spiritual Timeline"
      title="Church Calendar"
      lead="Our regional liturgical calendar and scheduled ministry gatherings. Use this timeline to stay synchronized with conferences, training weekends, and unified worship cycles."
      actions={[
        { href: '/events', label: 'Weekly Services' },
        { href: '/live-webcast', label: 'Online Sanctuary', variant: 'secondary' },
      ]}
    >
      <div className="max-w-5xl">
        <div className="p-10 md:p-12 rounded-3xl border border-accent/20 bg-accent/5 backdrop-blur-md mb-20 shadow-premium">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-6 italic">
            Ministry Synchronization Notice
          </p>
          <p className="text-muted-foreground text-xl leading-relaxed font-medium">
            {calendar.note}
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          {calendar.months.map((month) => (
            <section key={month.month} className="rounded-3xl border border-foreground/5 bg-card/30 p-10 backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-card/50 shadow-premium">
              <h2 className="text-4xl font-extrabold text-accent mb-8 heading-premium italic tracking-tighter">{month.month}</h2>
              <ul className="space-y-6">
                {month.items.map((item) => (
                  <li key={`${month.month}-${item.title}`} className="rounded-2xl bg-foreground/5 p-6 border border-foreground/5 transition-all hover:border-accent/40 hover:bg-foreground/[0.08]">
                    <p className="text-xl font-bold text-foreground leading-tight mb-2">{item.title}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">
                        {item.time}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
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
