import Link from 'next/link';
import PageShell from '../../components/PageShell';
import { doctrinalStudyGroups } from '../../data/resourceCollectionsData';

export default function DoctrinalResourcesPage({ studyGroups }) {
  return (
    <PageShell
      eyebrow="Study"
      title="Doctrinal Resources"
      lead="This page now carries real doctrinal study material compiled from the restored doctrine outline on the former Zimbabwe website. The summaries are concise, but the original Scripture emphasis is preserved so readers can study each doctrine from the Bible itself."
      actions={[
        { href: '/our-faith', label: 'Read Our Faith Summary' },
        { href: '/library/this-weeks-lessons', label: 'Pair With Weekly Lessons', variant: 'secondary' },
      ]}
    >
      <div className="max-w-5xl space-y-24">
        <section>
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Sacred Instruction</h2>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-10 max-w-3xl">
            Our collective regional teaching is best studied alongside Scripture. We have preserved the original doctrine outlines recovered from our regional archives, presenting them for unified study.
          </p>

          {studyGroups.map((group) => (
            <div key={group.id} className="mb-16">
              <div className="mb-8 p-8 md:p-10 rounded-3xl bg-foreground/5 border border-foreground/5 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-4">
                  {group.label}
                </p>
                <h2 className="text-3xl font-bold text-foreground heading-premium italic mb-6">{group.label}</h2>
                <p className="text-muted-foreground font-medium leading-relaxed">{group.description}</p>
              </div>
              <div className="grid gap-8 md:grid-cols-2">
                {group.topics.map((topic) => (
                  <article key={topic.title} className="flex flex-col rounded-3xl border border-foreground/5 bg-card/30 p-8 backdrop-blur-md hover:bg-card/50 transition-all">
                    <h3 className="text-2xl font-bold text-foreground mb-4 heading-premium">{topic.title}</h3>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-10 flex-grow">{topic.summary}</p>
                    <div className="flex flex-wrap gap-3 pt-6 border-t border-foreground/5">
                      {topic.references.map((reference) => (
                        <span
                          key={reference}
                          className="rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-accent"
                        >
                          {reference}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="pt-24 border-t border-foreground/5">
          <h2 className="text-3xl font-bold tracking-tighter mb-8 italic heading-premium italic">Integrated Study Paths</h2>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-10 max-w-3xl">
            Doctrine is strongest when connected to our unified regional teaching rhythm. Continue your study through these primary channels.
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            <article className="rounded-3xl border border-foreground/5 bg-foreground/5 p-8 backdrop-blur-sm shadow-sm transition-all hover:bg-foreground/[0.08]">
              <h3 className="text-2xl font-bold text-foreground mb-4 italic heading-premium">Our Faith Summary</h3>
              <p className="text-muted-foreground font-medium leading-relaxed mb-8">
                Explore the foundational fellowship-wide summary that introduces the core beliefs of our Southern & Eastern Africa Region.
              </p>
              <Link href="/our-faith" className="inline-flex text-[10px] font-black uppercase tracking-widest text-accent hover:tracking-[0.2em] transition-all">
                Enter Summary →
              </Link>
            </article>
            <article className="rounded-3xl border border-foreground/5 bg-foreground/5 p-8 backdrop-blur-sm shadow-sm transition-all hover:bg-foreground/[0.08]">
              <h3 className="text-2xl font-bold text-foreground mb-4 italic heading-premium">Weekly Curriculum</h3>
              <p className="text-muted-foreground font-medium leading-relaxed mb-8">
                Connect doctrinal study to the active regional teaching rhythm already maintained within the sanctuary library.
              </p>
              <Link
                href="/library/this-weeks-lessons"
                className="inline-flex text-[10px] font-black uppercase tracking-widest text-accent hover:tracking-[0.2em] transition-all"
              >
                Access Curriculum →
              </Link>
            </article>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

export function getStaticProps() {
  return {
    props: {
      studyGroups: doctrinalStudyGroups,
    },
  };
}
