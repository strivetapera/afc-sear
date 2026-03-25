import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageShell from '../components/PageShell';
import {
  contactChannels,
  contactNextSteps,
  contactPage,
  ministryContacts,
} from '../data/contactData';
import { churchLocations } from '../data/locationsData';

export default function ContactPage({ metadata, channels, ministries, nextSteps, locations }) {
  const [expandedBranch, setExpandedBranch] = useState(null);

  return (
    <PageShell
      eyebrow={metadata.eyebrow}
      title={metadata.title}
      lead={metadata.lead}
    >
      <div className="max-w-5xl space-y-24">
        {/* Contact Channels Grid */}
        <section>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {channels.map((channel, idx) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative p-8 rounded-3xl border border-foreground/5 bg-card/30 backdrop-blur-md shadow-premium hover:bg-card/50 transition-all hover:-translate-y-1 hover:border-accent/30"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-6 block">
                  {channel.label}
                </span>
                {channel.href ? (
                  <a
                    href={channel.href}
                    className="text-2xl font-black tracking-tighter text-foreground group-hover:text-accent transition-all block break-words leading-tight"
                  >
                    {channel.value}
                  </a>
                ) : (
                  <p className="text-2xl font-black tracking-tighter text-foreground leading-tight">{channel.value}</p>
                )}
                <p className="mt-6 text-sm text-muted-foreground font-medium italic leading-relaxed border-l-2 border-accent/10 pl-4">
                  {channel.note}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Ministry & Support Section */}
        <section className="p-12 md:p-16 rounded-[3rem] bg-foreground/5 border border-foreground/5 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
             <div className="w-64 h-64 bg-accent rounded-full blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tighter mb-12 italic heading-premium">Ministry Intelligence</h2>
            <div className="grid md:grid-cols-3 gap-10">
              {ministries.map((ministry, idx) => (
                <motion.div
                  key={ministry.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col"
                >
                  <h3 className="text-xl font-bold mb-4 italic heading-premium">{ministry.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-medium">
                    {ministry.description}
                  </p>
                  <p className="mt-auto text-accent text-[10px] font-black uppercase tracking-widest italic decoration-accent/30 underline underline-offset-4 decoration-2">{ministry.destination}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Regional Branch Directory (Fold-Listed) */}
        <section id="directory" className="py-12 border-t border-foreground/5">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-4 block">Regional Presence</span>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic heading-premium">Branch Directory</h2>
                </div>
                <p className="max-w-md text-muted-foreground font-medium italic text-sm border-l-2 border-accent/20 pl-6">
                    A comprehensive restoration of the legacy Zimbabwe branch directory (54 assemblies), preserved until the wider regional map is rebuilt.
                </p>
            </div>

            <div className="space-y-4">
                {locations.map((branch) => {
                    const isExpanded = expandedBranch === branch.id;
                    return (
                        <div key={branch.id} className={`rounded-3xl border transition-all duration-500 overflow-hidden ${
                            isExpanded ? 'bg-foreground/5 border-accent/30 shadow-premium' : 'bg-card/20 border-foreground/5 hover:bg-foreground/5'
                        }`}>
                            <button
                                onClick={() => setExpandedBranch(isExpanded ? null : branch.id)}
                                className="w-full text-left p-8 md:p-10 flex items-center justify-between group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                                        isExpanded ? 'text-accent' : 'text-muted-foreground'
                                    }`}>
                                        {branch.city}
                                    </span>
                                    <h3 className="text-2xl font-black tracking-tighter text-foreground group-hover:text-accent transition-all">{branch.congregation}</h3>
                                </div>
                                <div className={`w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center transition-all ${
                                    isExpanded ? 'rotate-180 bg-accent text-accent-foreground border-accent' : 'group-hover:border-accent group-hover:text-accent'
                                }`}>
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <div className="px-8 md:px-10 pb-10 grid md:grid-cols-2 gap-12 border-t border-foreground/5 pt-10">
                                            <div className="space-y-8">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-3">Presiding Pastor</p>
                                                    <p className="text-xl font-bold tracking-tight italic opacity-90">{branch.pastor}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-3">Sanctuary Address</p>
                                                    <p className="text-muted-foreground font-medium leading-relaxed italic">{branch.address}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-8">
                                                <div className="p-6 rounded-2xl bg-foreground/5 border border-foreground/5 backdrop-blur-sm">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-4">Worship Protocol</p>
                                                    <div className="space-y-2">
                                                        {branch.serviceTimes.map((time, i) => (
                                                            <div key={i} className="flex justify-between text-xs font-semibold pb-2 border-b border-foreground/5 last:border-0 last:pb-0">
                                                                <span className="text-muted-foreground/60">{time.split(' - ')[0]}</span>
                                                                <span className="text-foreground italic">{time.split(' - ')[1]}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] italic">
                                                    {branch.notes}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </section>

        {/* Real Next Steps */}
        <section className="max-w-3xl mx-auto py-12">
            <h2 className="text-4xl font-black tracking-tighter italic mb-16 text-center heading-premium">Contact Protocol</h2>
            <div className="space-y-10">
              {nextSteps.map((step, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-8 items-start group"
                >
                    <span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-lg font-black italic shadow-sm transition-all group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground">
                        {idx + 1}
                    </span>
                    <p className="text-xl text-muted-foreground font-medium pt-2 leading-relaxed italic">{step}</p>
                </motion.div>
              ))}
            </div>
        </section>
      </div>
    </PageShell>
  );
}

export async function getStaticProps() {
  return {
    props: {
      metadata: {
        ...contactPage,
        lead: 'Our unified regional support hub for Southern and Eastern Africa. This page now includes the exhaustive 54-assembly Zimbabwe branch directory alongside our primary contact protocols.'
      },
      channels: contactChannels,
      ministries: ministryContacts,
      nextSteps: contactNextSteps,
      locations: churchLocations,
    },
  };
}
