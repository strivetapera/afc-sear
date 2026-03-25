import PageShell from './PageShell';
import { motion } from 'framer-motion';

export default function StructuredPageContent({ page }) {
  if (!page) return null;

  return (
    <PageShell
      eyebrow={page.eyebrow}
      title={page.title}
      lead={page.lead}
      actions={page.actions ?? []}
    >
      <div className="grid gap-20">
        {(page.sections ?? []).map((section, sIdx) => (
          <motion.section 
            key={section.heading ?? sIdx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group"
          >
            {section.heading && (
              <h2 className="text-4xl font-extrabold tracking-tighter mb-10 decoration-accent decoration-2 underline-offset-8 group-hover:underline transition-all">
                {section.heading}
              </h2>
            )}

            <div className="space-y-6">
              {(section.paragraphs ?? []).map((paragraph, pIdx) => (
                <p key={pIdx} className="text-lg leading-relaxed">{paragraph}</p>
              ))}
            </div>

            {section.quote && (
              <motion.blockquote 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="my-12"
              >
                <p className="text-2xl font-serif italic text-foreground tracking-tight leading-snug">
                  "{section.quote.text}"
                </p>
                {section.quote.citation && (
                  <footer className="mt-4 text-accent text-xs font-black uppercase tracking-[0.3em]">
                    — {section.quote.citation}
                  </footer>
                )}
              </motion.blockquote>
            )}

            {section.cards?.length > 0 && (
              <div className="not-prose mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.cards.map((card, cIdx) => (
                  <motion.div
                    key={card.title ?? cIdx}
                    whileHover={{ translateY: -8 }}
                    className="p-8 border border-foreground/5 rounded-3xl shadow-premium bg-card/30 backdrop-blur-md transition-all hover:bg-card/50 hover:border-accent/30"
                  >
                    <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl mb-6 flex items-center justify-center text-accent">
                        <div className="w-2.5 h-2.5 bg-current rounded-full animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4 heading-premium italic leading-tight">{card.title}</h3>
                    <p className="text-muted-foreground text-base font-medium leading-relaxed">
                      {card.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {section.list?.length > 0 && (
              <div className="mt-8 space-y-4">
                {section.list.map((item, lIdx) => (
                  <motion.div 
                    key={lIdx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: lIdx * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    <span className="text-lg font-medium text-muted-foreground">{item}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        ))}
      </div>
    </PageShell>
  );
}
