// components/EventsSection.js
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatEventDate } from '../lib/eventUtils';

const EventsSection = ({ events = [] }) => {
  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Ambient background light */}
      <div className="absolute bottom-0 left-1/2 w-1/2 h-1/2 bg-accent/5 blur-[120px] rounded-full -z-10" />

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="text-accent text-xs font-black uppercase tracking-[0.4em] mb-4 inline-block">Fellowship</span>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter heading-premium italic">
              Upcoming Events
            </h2>
          </div>
          <Link
            href="/events"
            className="hidden md:inline-block border border-foreground/10 bg-foreground/5 text-foreground font-black uppercase tracking-widest text-sm py-4 px-10 rounded-full hover:bg-foreground/10 transition-all shadow-premium"
          >
            View Full Calendar
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((event) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 border border-foreground/5 rounded-3xl shadow-premium bg-card/30 backdrop-blur-md flex flex-col transition-all hover:scale-[1.02] hover:bg-card/50"
              >
                <h3 className="text-2xl font-bold mb-3 heading-premium italic">
                  {event.title}
                </h3>
                <p className="mb-4 text-xs text-accent font-black uppercase tracking-[0.2em]">
                  {formatEventDate(event.calculatedNextOccurrence, event.recurrence)}
                </p>
                {/* Optional description if provided by platform API */}
                {event.description && (
                   <p className="text-muted-foreground font-medium leading-relaxed line-clamp-2">
                     {event.description}
                   </p>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-foreground/5 rounded-3xl border border-dotted border-foreground/20">
            <p className="text-xl text-muted-foreground font-medium italic">
              No fellowship dates scheduled currently.
            </p>
          </div>
        )}
        
        <div className="mt-12 md:hidden text-center">
            <Link
                href="/events"
                className="inline-block border border-foreground/10 bg-foreground/5 text-foreground font-black uppercase tracking-widest text-sm py-4 px-10 rounded-full w-full"
            >
                View Full Calendar
            </Link>
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30 mt-16">
          Regional Synchronized Schedule
        </p>
      </div>
    </section>
  );
};

export default EventsSection;