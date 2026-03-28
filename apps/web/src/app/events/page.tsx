import Link from 'next/link';
import { StructuredSections } from '@/components/StructuredSections';

function getApiOrigin() {
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/v1\/?$/, '');
}

function formatScheduleLabel(startsAt?: string) {
  if (!startsAt) {
    return 'Schedule to be announced';
  }

  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) {
    return 'Schedule to be announced';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
}

export default async function EventsPage() {
  const apiOrigin = getApiOrigin();
  const [listResponse, pageResponse] = await Promise.all([
    fetch(`${apiOrigin}/api/v1/public/events/list`, { cache: 'no-store' }),
    fetch(`${apiOrigin}/api/v1/public/pages/events`, { cache: 'no-store' }),
  ]);

  const payload = listResponse.ok ? await listResponse.json() : null;
  const pagePayload = pageResponse.ok ? await pageResponse.json() : null;
  const events = payload?.data ?? [];
  const pageBody = pagePayload?.data?.body ?? null;
  const eyebrow = pageBody?.eyebrow ?? 'Events';
  const title = pageBody?.title ?? 'Upcoming Public Events';
  const lead =
    pageBody?.lead ??
    'Browse conferences, special gatherings, and public services currently open on the platform.';
  const actions = pageBody?.actions ?? [];
  const sections = pageBody?.sections ?? [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
          <p className="max-w-3xl text-lg text-muted-foreground">{lead}</p>
          {actions.length ? (
            <div className="flex flex-wrap gap-4 pt-2">
              {actions.map((action: { href: string; label: string; variant?: "secondary" }) => (
                <Link
                  key={`${action.href}-${action.label}`}
                  href={action.href}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                    action.variant === 'secondary'
                      ? 'border border-border bg-background hover:bg-muted'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-6">
          {events.length ? (
            events.map((event: any) => (
              <article
                key={event.id}
                className="rounded-3xl border border-border bg-card p-8 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  {event.eventType?.replaceAll('_', ' ') || 'Event'}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">{event.title}</h2>
                <p className="mt-4 text-muted-foreground">{event.summary}</p>
                <div className="mt-6 grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
                  <div>
                    <p className="font-medium text-foreground">When</p>
                    <p className="mt-1">{formatScheduleLabel(event.schedules?.[0]?.startsAt)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Where</p>
                    <p className="mt-1">
                      {event.venue?.name ? `${event.venue.name}, ${event.venue.city}` : 'Venue to be announced'}
                    </p>
                  </div>
                </div>
                <div className="mt-8">
                  <Link
                    href={`/events/${encodeURIComponent(event.slug)}`}
                    className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    View Event
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight">No public events published yet</h2>
              <p className="mt-3 text-muted-foreground">
                Check back soon or join the live webcast for current online services.
              </p>
              <div className="mt-6">
                <Link
                  href="/live-webcast"
                  className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Go To Live Webcast
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {sections.length ? (
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-5xl space-y-10">
            <StructuredSections sections={sections} />
          </div>
        </section>
      ) : null}
    </main>
  );
}
