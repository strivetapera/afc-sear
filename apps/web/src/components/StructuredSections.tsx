export function StructuredSections({ sections }: { sections: any[] }) {
  return (
    <>
      {sections.map((section: any, index: number) => (
        <article key={`${section.heading ?? 'section'}-${index}`} className="space-y-5">
          {section.heading ? (
            <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
          ) : null}
          {section.paragraphs?.map((paragraph: string, paragraphIndex: number) => (
            <p key={`${index}-paragraph-${paragraphIndex}`} className="leading-7 text-muted-foreground">
              {paragraph}
            </p>
          ))}
          {section.list?.length ? (
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              {section.list.map((item: string, itemIndex: number) => (
                <li key={`${index}-item-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          ) : null}
          {section.quote ? (
            <blockquote className="border-l-4 border-primary pl-4 italic text-foreground/80">
              <p>{section.quote.text}</p>
              {section.quote.citation ? (
                <footer className="mt-2 text-sm not-italic text-muted-foreground">
                  {section.quote.citation}
                </footer>
              ) : null}
            </blockquote>
          ) : null}
          {section.cards?.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {section.cards.map(
                (card: { title: string; description: string }, cardIndex: number) => (
                  <div
                    key={`${index}-card-${cardIndex}`}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                  >
                    <h3 className="text-lg font-semibold">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                )
              )}
            </div>
          ) : null}
        </article>
      ))}
    </>
  );
}
