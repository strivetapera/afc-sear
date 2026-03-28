import Link from "next/link";
import { StructuredSections } from "@/components/StructuredSections";

function getApiOrigin() {
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/v1\/?$/, '');
}

export default async function NewsPage() {
  const apiOrigin = getApiOrigin();
  const [feedResponse, pageResponse] = await Promise.all([
    fetch(`${apiOrigin}/api/v1/public/news`, { cache: 'no-store' }),
    fetch(`${apiOrigin}/api/v1/public/pages/news`, { cache: 'no-store' }),
  ]);

  const payload = feedResponse.ok ? await feedResponse.json() : null;
  const pagePayload = pageResponse.ok ? await pageResponse.json() : null;
  const data = payload?.data ?? null;
  const pageBody = pagePayload?.data?.body ?? null;
  const actions = pageBody?.actions ?? [];
  const sections = pageBody?.sections ?? [];

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <p className="text-muted-foreground">News updates are unavailable right now.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-5xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            {data.metadata.eyebrow}
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{data.metadata.title}</h1>
          <p className="max-w-3xl text-lg text-muted-foreground">{data.metadata.lead}</p>
          {actions.length ? (
            <div className="flex flex-wrap gap-4 pt-2">
              {actions.map((action: { href: string; label: string; variant?: "secondary" }) => (
                <Link
                  key={`${action.href}-${action.label}`}
                  href={action.href}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                    action.variant === "secondary"
                      ? "border border-border bg-background hover:bg-muted"
                      : "bg-primary text-primary-foreground hover:opacity-90"
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
          {data.items.map((item: any) => (
            <article
              key={item.id}
              className="rounded-3xl border border-border bg-card p-8 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                <span>{item.category}</span>
                <span className="text-border">•</span>
                <span className="text-muted-foreground">{item.location}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                {new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(item.publishedAt))}
              </p>
              <p className="mt-4 leading-7 text-muted-foreground">{item.summary}</p>
              <p className="mt-6 text-sm font-medium text-foreground">{item.status}</p>
            </article>
          ))}
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
