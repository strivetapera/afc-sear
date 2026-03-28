import Link from "next/link";

export function SectionPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Public Section
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
          <p className="max-w-3xl text-lg text-muted-foreground">{description}</p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <article className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h2 className="text-xl font-semibold">Placeholder</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              This section has been added to the navigation as a placeholder and can be populated
              with managed content later.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/"
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Back Home
              </Link>
              <Link
                href="/live-webcast"
                className="rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Open Live Webcast
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
