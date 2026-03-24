import PageShell from './PageShell';

export default function StructuredPageContent({ page }) {
  return (
    <PageShell
      eyebrow={page.eyebrow}
      title={page.title}
      lead={page.lead}
      actions={page.actions ?? []}
    >
      {(page.sections ?? []).map((section) => (
        <section key={section.heading ?? section.paragraphs?.[0] ?? section.list?.[0]}>
          {section.heading ? <h2>{section.heading}</h2> : null}

          {(section.paragraphs ?? []).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          {section.quote ? (
            <blockquote className="border-l-4 border-gold pl-4 italic text-cream/90">
              <p>{section.quote.text}</p>
              {section.quote.citation ? (
                <footer className="mt-2 text-sm not-italic text-cream/70">
                  - {section.quote.citation}
                </footer>
              ) : null}
            </blockquote>
          ) : null}

          {section.cards?.length ? (
            <div className="not-prose mt-4 grid gap-4 md:grid-cols-3">
              {section.cards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-gold/20 bg-white/5 p-5">
                  <h3 className="text-lg font-semibold text-cream">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-cream/75">{card.description}</p>
                </div>
              ))}
            </div>
          ) : null}

          {section.list?.length ? (
            <ul>
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </PageShell>
  );
}
