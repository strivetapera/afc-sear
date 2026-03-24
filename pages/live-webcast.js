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
        { href: '/contact', label: 'Get Help Joining', variant: 'secondary' },
      ]}
    >
      <div className="not-prose rounded-3xl border border-gold/25 bg-white/5 p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold/75">
          {featured.provider}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-cream">{featured.title}</h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-cream/85">{featured.note}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-gold/15 bg-black/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              Meeting ID
            </p>
            <p className="mt-2 text-lg font-semibold text-cream">{featured.meetingId}</p>
          </div>
          <div className="rounded-2xl border border-gold/15 bg-black/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              Passcode
            </p>
            <p className="mt-2 text-lg font-semibold text-cream">{featured.passcode}</p>
          </div>
          <div className="rounded-2xl border border-gold/15 bg-black/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              Status
            </p>
            <p className="mt-2 text-lg font-semibold text-cream">{featured.status}</p>
          </div>
        </div>
        <p className="mt-6">
          <a
            href={featured.streamUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full bg-gold px-5 py-3 text-sm font-semibold text-black no-underline transition hover:bg-[#f2cc00]"
          >
            {featured.accessLabel}
          </a>
        </p>
      </div>

      <h2>Where to watch</h2>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-3">
        {platforms.map((platform) => (
          <article key={platform.id} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              {platform.label}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-cream">{platform.name}</h3>
            <p className="mt-3 text-sm leading-6 text-cream/75">{platform.detail}</p>
            <p className="mt-4">
              <a
                href={platform.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-gold no-underline hover:underline"
              >
                Open {platform.label}
              </a>
            </p>
          </article>
        ))}
      </div>

      <h2>Regular online schedule</h2>
      <p>{notes[0]}</p>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-3">
        {schedule.map((item) => (
          <article key={item.id} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              {item.providerLabel}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-cream">{item.title}</h3>
            <p className="mt-3 text-sm text-cream/80">{item.occurrenceLabel}</p>
            <p className="mt-2 text-sm text-cream/80">Duration: {item.durationLabel}</p>
            <p className="mt-2 text-sm text-cream/70">{item.description}</p>
            <p className="mt-4">
              <a
                href={item.joinUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-gold no-underline hover:underline"
              >
                Join this service
              </a>
            </p>
          </article>
        ))}
      </div>
      <p className="mt-5">{notes[1]}</p>

      <h2>How to join smoothly</h2>
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <h2>Support</h2>
      <div className="not-prose mt-4 grid gap-4 md:grid-cols-2">
        {support.map((item) => (
          <div key={item.id} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold/70">
              {item.label}
            </p>
            <p className="mt-2 text-lg font-semibold text-cream">
              {item.href ? (
                <a
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                >
                  {item.value}
                </a>
              ) : (
                item.value
              )}
            </p>
          </div>
        ))}
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
