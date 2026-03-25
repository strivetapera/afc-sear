import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AboutSection({ content }) {
  return (
    <section className="relative bg-background py-24 md:py-32 overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 blur-3xl rounded-full translate-x-1/2 -z-10" />
      
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="text-accent text-xs font-bold uppercase tracking-[0.3em]">Our Journey</span>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter heading-premium italic">
                {content.title}
              </h2>
            </div>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed font-medium">
              {content.paragraphs.map((paragraph, i) => (
                <p key={i} className={i === 0 ? "text-xl text-foreground font-semibold" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="pt-6">
              <Link href={content.cta.href}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-accent text-accent-foreground font-black text-lg tracking-tight rounded-2xl shadow-premium hover:shadow-accent/40 transition-shadow"
                >
                  {content.cta.label}
                </motion.button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden border border-border shadow-premium overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent" />
                <img 
                  src="/images/church-hero.jpg" 
                  alt="Faith in Action" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
            </div>
            {/* Premium Stat Card */}
            <div className="absolute -bottom-10 -left-10 p-8 bg-card/80 backdrop-blur-xl border border-foreground/10 rounded-3xl shadow-premium max-w-xs hidden md:block">
                <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-3">Faith Synchronized</p>
                <p className="text-3xl font-black tracking-tighter text-foreground mb-2 italic heading-premium">54 Regional Branches</p>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">Authentic Apostolic records restored and verified across the region.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
