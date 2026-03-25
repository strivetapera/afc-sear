import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

export default function PageShell({
  eyebrow,
  title,
  lead,
  children,
  actions = [],
}) {
  const { theme } = useTheme();

  return (
    <div className="bg-background min-h-screen text-foreground selection:bg-accent/30 transition-colors duration-500">
      {/* Cinematic Header Space */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Sacred Light Ambient Effect */}
        <div className={`absolute top-0 left-1/4 w-1/2 h-full ${theme === 'dark' ? 'bg-accent/5' : 'bg-primary/5'} blur-[120px] rounded-full -z-10`} />
        
        <div className="container mx-auto max-w-7xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            {eyebrow && (
              <span className="text-accent text-xs font-black uppercase tracking-[0.4em] mb-4 inline-block">
                {eyebrow}
              </span>
            )}
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 heading-premium italic">
              {title}
            </h1>
            {lead && (
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                {lead}
              </p>
            )}

            {actions.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-4">
                {actions.map((action, idx) => {
                  const isExternal = /^(https?:\/\/|mailto:|tel:)/.test(action.href);
                  const baseClasses = "rounded-full px-8 py-4 text-sm font-black uppercase tracking-widest transition-all duration-500 shadow-premium";
                  const variantClasses = action.variant === 'secondary'
                    ? "border border-foreground/10 bg-foreground/5 text-foreground hover:bg-foreground/10 hover:border-accent/40"
                    : "bg-accent text-accent-foreground hover:scale-105 active:scale-95";

                  if (isExternal) {
                    return (
                      <motion.a
                        key={`${action.href}-${idx}`}
                        href={action.href}
                        target={action.href.startsWith('http') ? '_blank' : undefined}
                        rel={action.href.startsWith('http') ? 'noreferrer' : undefined}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + (idx * 0.1) }}
                        className={`${baseClasses} ${variantClasses}`}
                      >
                        {action.label}
                      </motion.a>
                    );
                  }

                  return (
                    <Link key={`${action.href}-${idx}`} href={action.href}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + (idx * 0.1) }}
                        className={`${baseClasses} ${variantClasses} cursor-pointer inline-block`}
                      >
                        {action.label}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Content Body with Glassmorphic Container Support */}
      <section className="py-20 px-6 border-t border-foreground/5 bg-background/40">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={`prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none prose-headings:heading-premium prose-headings:italic prose-p:text-muted-foreground prose-p:font-medium prose-p:leading-relaxed prose-li:text-muted-foreground prose-li:font-medium prose-blockquote:border-accent/40 prose-blockquote:bg-accent/5 prose-blockquote:rounded-r-2xl prose-blockquote:py-4 prose-blockquote:italic`}
          >
            {children}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
