import Link from 'next/link';
import { motion } from 'framer-motion';
import { footerLinks } from '../lib/siteNavigation';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-foreground/5 py-24 px-6 relative overflow-hidden transition-colors duration-500">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
             <div className="flex items-center gap-4">
                <div className="w-20 h-20 overflow-hidden flex items-center justify-center p-1">
                    <img 
                        src="/images/jesus-light.png" 
                        alt="Logo" 
                        className="w-full h-full object-contain opacity-90 dark:opacity-100" 
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-black tracking-tighter text-foreground uppercase leading-none">APOSTOLIC FAITH MISSION</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/60">Southern & Eastern Africa Region</span>
                </div>
             </div>
             <p className="text-base text-muted-foreground leading-relaxed font-medium">
               Spreading the Gospel of Jesus Christ across the Southern and Eastern Africa Region through faith, community, and service.
             </p>
          </div>

          <div className="lg:col-start-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-foreground/40">Explore</h4>
            <nav>
              <ul className="space-y-4">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-accent transition-all text-sm font-bold uppercase tracking-widest"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-foreground/40">Connect</h4>
            <Link 
              href="/contact" 
              className="inline-flex px-10 py-4 border border-foreground/10 bg-foreground/5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all shadow-premium"
            >
              Get in Touch
            </Link>
          </div>
        </div>

        <div className="pt-12 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
          <p>© {new Date().getFullYear()} Apostolic Faith Mission Southern & Eastern Africa Region</p>
          <div className="flex items-center gap-10">
            <Link href="/privacy-policy" className="hover:text-accent transition-all">Privacy</Link>
            <Link href="/terms-of-use" className="hover:text-accent transition-all">Terms</Link>
            <span className="text-accent/40 italic uppercase text-[9px] tracking-[0.4em]">Graceful Modernism</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
