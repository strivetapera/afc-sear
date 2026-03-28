import Link from "next/link";

function getApiOrigin() {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/api\/v1\/?$/, "");
}

export default async function LiveWebcastPage() {
  const response = await fetch(`${getApiOrigin()}/api/v1/public/live-webcast`, { cache: "no-store" });
  const payload = response.ok ? await response.json() : null;
  const data = payload?.data ?? null;

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <p className="text-muted-foreground">Live webcast details are unavailable right now.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{data.metadata.eyebrow}</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{data.metadata.title}</h1>
          <p className="max-w-3xl text-lg text-muted-foreground">{data.metadata.lead}</p>
          <Link
            href={data.featured.streamUrl}
            target="_blank"
            className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {data.featured.accessLabel}
          </Link>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <article className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">{data.featured.provider}</p>
            <h2 className="mt-3 text-3xl font-semibold">{data.featured.title}</h2>
            <p className="mt-4 text-muted-foreground">{data.featured.note}</p>
            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Meeting ID</dt>
                <dd className="mt-1 text-lg font-semibold">{data.featured.meetingId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Passcode</dt>
                <dd className="mt-1 text-lg font-semibold">{data.featured.passcode}</dd>
              </div>
            </dl>
          </article>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">How to Join</h3>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                {data.steps.map((step: string, index: number) => (
                  <li key={`step-${index}`}>{index + 1}. {step}</li>
                ))}
              </ol>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">Support</h3>
              <div className="mt-4 space-y-3">
                {data.support.map((item: { id: string; label: string; value: string; href?: string }) => (
                  <div key={item.id}>
                    <p className="text-sm font-medium">{item.label}</p>
                    {item.href ? (
                      <Link href={item.href} className="text-sm text-primary hover:underline">
                        {item.value}
                      </Link>
                    ) : (
                      <p className="text-sm text-muted-foreground">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
