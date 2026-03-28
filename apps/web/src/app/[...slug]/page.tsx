import Link from "next/link";
import { notFound } from "next/navigation";
import { StructuredSections } from "@/components/StructuredSections";

function getApiOrigin() {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/api\/v1\/?$/, "");
}

async function fetchJson(path: string) {
  const response = await fetch(`${getApiOrigin()}${path}`, { cache: "no-store" });
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export default async function PublicContentPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugPath = slug.join("/");
  const encodedSlug = encodeURIComponent(slugPath);

  const [structuredPayload, pagePayload] = await Promise.all([
    fetchJson(`/api/v1/public/structured-pages/${encodedSlug}`),
    fetchJson(`/api/v1/public/pages/${encodedSlug}`),
  ]);

  const structured = structuredPayload?.data ?? null;
  const page = pagePayload?.data ?? null;

  if (!structured && !page) {
    notFound();
  }

  const title = structured?.title ?? page?.title ?? "Page";
  const lead = structured?.lead ?? page?.summary ?? null;
  const sections = structured?.sections ?? [];
  const actions = structured?.actions ?? [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-5">
          {structured?.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              {structured.eyebrow}
            </p>
          ) : null}
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
          {lead ? <p className="max-w-3xl text-lg text-muted-foreground">{lead}</p> : null}
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
        <div className="mx-auto max-w-4xl space-y-10">
          {sections.length ? (
            <StructuredSections sections={sections} />
          ) : (
            <article className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <h2 className="text-xl font-semibold">{page?.title}</h2>
              {page?.summary ? <p className="mt-3 text-muted-foreground">{page.summary}</p> : null}
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
