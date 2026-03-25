import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const Hero = ({ content }) => {
  return (
    <section className="relative h-screen min-h-[700px] w-full flex items-center justify-center overflow-hidden">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/church-hero.jpg"
          alt={content.imageAlt}
          fill
          priority
          className="object-cover scale-110 animate-subtle-zoom"
        />
        {/* Dynamic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20">
        <div className="max-w-4xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-[0.4em] mb-4">
              {content.eyebrow}
            </span>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-white leading-[0.9] heading-premium italic">
              Apostolic <br />
              <span className="text-accent italic">Faith Church</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            <p className="text-xl md:text-2xl text-white/60 max-w-2xl font-medium leading-relaxed italic border-l-2 border-accent/30 pl-8 ml-2">
              {content.tagline}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link href="/contact" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-10 py-5 bg-accent text-accent-foreground font-black text-lg tracking-tight rounded-2xl shadow-premium hover:shadow-accent/40 transition-shadow"
                >
                  Join Our Fellowship
                </motion.button>
              </Link>
              <Link href="/about" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-10 py-5 glass-effect bg-white/5 border border-white/10 text-white font-bold text-lg tracking-tight rounded-2xl hover:bg-white/10 transition-colors"
                >
                  Explore Our Vision
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Visual Bridge */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-20" />
    </section>
  );
};

export default Hero;
