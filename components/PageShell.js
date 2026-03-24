import Link from 'next/link';

export default function PageShell({
  eyebrow,
  title,
  lead,
  children,
  actions = [],
}) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto w-11/12 max-w-[960px] px-6">
        <div className="rounded-3xl border border-gold/20 bg-gradient-to-br from-[#090909] via-[#111111] to-[#161616] p-8 shadow-2xl shadow-black/30 md:p-12">
          {eyebrow ? (
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-gold/80">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="text-3xl font-bold text-gold md:text-5xl">{title}</h1>

          {lead ? (
            <p className="mt-5 max-w-3xl text-base leading-8 text-cream/90 md:text-lg">
              {lead}
            </p>
          ) : null}

          {actions.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-4">
              {actions.map((action) => (
                /^(https?:\/\/|mailto:|tel:)/.test(action.href) ? (
                  <a
                    key={`${action.href}-${action.label}`}
                    href={action.href}
                    target={action.href.startsWith('http') ? '_blank' : undefined}
                    rel={action.href.startsWith('http') ? 'noreferrer' : undefined}
                    className={`rounded-full px-5 py-3 text-sm font-semibold no-underline transition ${
                      action.variant === 'secondary'
                        ? 'border border-gold/40 text-gold hover:border-gold hover:bg-gold/10'
                        : 'bg-gold text-black hover:bg-[#f2cc00]'
                    }`}
                  >
                    {action.label}
                  </a>
                ) : (
                  <Link
                    key={`${action.href}-${action.label}`}
                    href={action.href}
                    className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                      action.variant === 'secondary'
                        ? 'border border-gold/40 text-gold hover:border-gold hover:bg-gold/10'
                        : 'bg-gold text-black hover:bg-[#f2cc00]'
                    }`}
                  >
                    {action.label}
                  </Link>
                )
              ))}
            </div>
          ) : null}

          <div className="prose prose-invert mt-10 max-w-none prose-headings:text-gold prose-a:text-gold prose-strong:text-cream">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
