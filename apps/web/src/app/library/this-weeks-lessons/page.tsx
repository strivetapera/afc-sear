import Link from "next/link";
import { StructuredSections } from "@/components/StructuredSections";

function getApiOrigin() {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/api\/v1\/?$/, "");
}

function formatPublishedAt(value?: string | null) {
  if (!value) {
    return "Recently updated";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently updated";
  }

  return new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(date);
}

export default async function WeeklyLessonsPage() {
  const apiOrigin = getApiOrigin();
  const [lessonsResponse, pageResponse] = await Promise.all([
    fetch(`${apiOrigin}/api/v1/public/lessons`, { cache: "no-store" }),
    fetch(`${apiOrigin}/api/v1/public/pages/${encodeURIComponent("library/this-weeks-lessons")}`, {
      cache: "no-store",
    }),
  ]);

  const lessonsPayload = lessonsResponse.ok ? await lessonsResponse.json() : null;
  const pagePayload = pageResponse.ok ? await pageResponse.json() : null;
  const lessons = lessonsPayload?.data ?? [];
  const pageBody = pagePayload?.data?.body ?? null;
  const title = pageBody?.title ?? "Weekly Lessons";
  const eyebrow = pageBody?.eyebrow ?? "Unified Teaching";
  const lead =
    pageBody?.lead ??
    "Published lessons are synchronized from the platform content system.";
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
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
          {lessons.length ? (
            lessons.map((lesson: any) => (
              <Link
                key={lesson.id}
                href={`/${lesson.slug}`}
                className="rounded-3xl border border-border bg-card p-8 shadow-sm transition-transform hover:-translate-y-1"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                  {formatPublishedAt(lesson.publishedAt)}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">{lesson.title}</h2>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {lesson.summary || "Open this lesson to read the published teaching content."}
                </p>
              </Link>
            ))
          ) : (
            <div className="rounded-3xl border border-border bg-card p-8 shadow-sm md:col-span-2 xl:col-span-3">
              <h2 className="text-2xl font-semibold tracking-tight">No published lessons found</h2>
              <p className="mt-3 text-muted-foreground">
                Publish lesson content from the admin portal to populate this page.
              </p>
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
