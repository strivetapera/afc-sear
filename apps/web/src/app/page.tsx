"use client";

import { 
  Button, 
  GradientText, 
  GlassCard,
  CardTitle,
  DynamicContainer
} from "@afc-sear/ui";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  ChevronRight, 
  Compass, 
  Heart, 
  Star,
  Users,
  Calendar,
  Zap
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Premium Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Dynamic Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/apostolic_grace_hero_1774415862614.png"
            alt="Sacred Sanctuary"
            fill
            className="object-cover scale-110 animate-subtle-zoom"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-background" />
        </div>

        <DynamicContainer className="relative z-10 max-w-5xl mx-auto text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white/60 text-[10px] uppercase font-bold tracking-[0.4em] mb-4"
          >
            <Star className="h-3 w-3 text-accent animate-pulse" />
            Redefining Spiritual Connection
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-white leading-[0.9] heading-premium">
              <GradientText className="block">Graceful</GradientText>
              Modernism
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-medium leading-relaxed italic">
              Experience the Apostolic legacy through a beautifully crafted digital sanctuary designed for faith, community, and growth.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/services">
              <Button variant="gold" size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-black tracking-tight shadow-2xl">
                Join a Service
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="glass" size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-bold border-white/10">
                Explore Our Vision
              </Button>
            </Link>
          </div>

          <div className="pt-12 grid grid-cols-3 gap-12 max-w-2xl mx-auto border-t border-white/10 mt-20">
             {[
               { icon: Users, label: 'Community', value: 'Global' },
               { icon: Heart, label: 'Purpose', value: 'Love' },
               { icon: Zap, label: 'Platform', value: 'V3.0' },
             ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                   <item.icon className="h-5 w-5 text-accent opacity-50" />
                   <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">{item.label}</div>
                   <div className="text-white font-bold tracking-tight">{item.value}</div>
                </div>
             ))}
          </div>
        </DynamicContainer>
      </section>

      {/* Featured Insights Section */}
      <section className="relative bg-background py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
           <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight heading-premium">Elevated Engagement</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">Discover the pillars of our community, built on 120 years of Apostolic truth.</p>
           </div>

           <div className="grid md:grid-cols-3 gap-10">
              {[
                { title: 'Divine Discovery', icon: Compass, desc: 'Navigate your spiritual journey with guided content and communal worship.' },
                { title: 'Global Fellowship', icon: Users, desc: 'Connect with believers worldwide através de um sistema de membros unificado.' },
                { title: 'Sacred Events', icon: Calendar, desc: 'Participate in world-class conferences designed for profound spiritual impact.' },
              ].map((card, i) => (
                <GlassCard key={i} className="group relative overflow-hidden transition-all hover:scale-[1.02] cursor-default">
                   <div className="space-y-6">
                      <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                         <card.icon className="h-7 w-7" />
                      </div>
                      <div className="space-y-3">
                         <CardTitle className="text-2xl">{card.title}</CardTitle>
                         <p className="text-muted-foreground text-sm leading-relaxed">{card.desc}</p>
                      </div>
                      <Link href="#" className="inline-flex items-center text-primary font-bold text-sm tracking-tight group-hover:gap-2 transition-all">
                         Learn More <ChevronRight className="h-4 w-4" />
                      </Link>
                   </div>
                </GlassCard>
              ))}
           </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-12 px-6 text-center bg-muted/20">
        <p className="text-sm text-muted-foreground font-medium uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} Apostolic Faith Church • <GradientText>Graceful Modernism</GradientText>
        </p>
      </footer>
    </main>
  );
}
