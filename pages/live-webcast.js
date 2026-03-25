import PageShell from '../components/PageShell';
import {
  featuredStream,
  webcastPage,
  webcastNotes,
  webcastPlatforms,
  webcastSteps,
  webcastSupport,
} from '../data/liveWebcastData';
import { getOnlineEventsStructured } from '../lib/eventUtils';
import { getLiveWebcastFromPlatform } from '../lib/platformPublicApi';
import YouTubeLiveStatus from '../components/YouTubeLiveStatus';
import { legacyZimbabweWebcast } from '../data/legacyZimbabweSiteData';

export default function LiveWebcastPage({
  metadata,
  featured,
  schedule,
  notes,
  platforms,
  steps,
  support,
}) {
  return (
    <PageShell
      eyebrow={metadata.eyebrow}
      title={metadata.title}
      lead={metadata.lead}
      actions={[
        { href: featured.streamUrl, label: featured.accessLabel },
        { href: '/contact', label: 'Spiritual Support', variant: 'secondary' },
      ]}
    >
      <YouTubeLiveStatus 
        scheduledEvents={schedule} 
        zoomDetails={legacyZimbabweWebcast} 
      />

      <div className="grid lg:grid-cols-2 gap-20">
        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Where to watch</h2>
          <div className="grid gap-6">
            {platforms.map((platform) => (
              <article key={platform.id} className="rounded-3xl border border-foreground/5 bg-card/30 p-8 backdrop-blur-md hover:bg-card/50 transition-all border-l-4 border-l-accent">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3">
                  {platform.label}
                </p>
                <h3 className="text-2xl font-bold text-foreground mb-3">{platform.name}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed mb-6">{platform.detail}</p>
                <a
                  href={platform.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-[10px] font-black uppercase tracking-widest text-accent hover:tracking-[0.2em] transition-all"
                >
                  Open {platform.label} Channel →
                </a>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Synchronized Schedule</h2>
          <div className="space-y-6">
            {schedule.map((item) => (
              <article key={item.id} className="rounded-3xl border border-foreground/5 bg-card/30 p-8 backdrop-blur-md hover:bg-card/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                        {item.providerLabel}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground/40 italic">
                        {item.occurrenceLabel}
                    </span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{item.title}</h3>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8">{item.description}</p>
                <a
                  href={item.joinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block w-full text-center py-4 bg-foreground/5 border border-foreground/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all"
                >
                  Enter Online Sanctuary
                </a>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-24 p-12 rounded-3xl border border-foreground/5 bg-foreground/5 backdrop-blur-sm">
        <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Support & Onboarding</h2>
        <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Instructions</p>
                <ol className="space-y-4">
                    {steps.map((step, i) => (
                        <li key={step} className="flex gap-4 text-muted-foreground font-medium">
                            <span className="text-accent font-black">0{i+1}</span>
                            {step}
                        </li>
                    ))}
                </ol>
            </div>
            <div className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Contact</p>
                <div className="grid gap-4">
                    {support.map((item) => (
                        <div key={item.id} className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{item.label}</span>
                            <span className="text-xl font-bold text-foreground tracking-tight mt-1">
                                {item.href ? (
                                    <a href={item.href} className="hover:text-accent transition-colors">{item.value}</a>
                                ) : item.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </PageShell>
  );
}

export async function getStaticProps() {
  const schedule = await getOnlineEventsStructured();
  const fallbackPayload = {
    metadata: webcastPage,
    featured: featuredStream,
    schedule,
    notes: webcastNotes,
    platforms: webcastPlatforms,
    steps: webcastSteps,
    support: webcastSupport,
  };
  const payload = await getLiveWebcastFromPlatform(fallbackPayload);

  return {
    props: payload,
  };
}
