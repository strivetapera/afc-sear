import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandedMediaPlayer from './BrandedMediaPlayer';

const MediaCinema = ({ isOpen, onClose, media = null }) => {
  if (!media) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-3xl p-6 md:p-12"
        >
          {/* Close Button */}
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={onClose}
            className="absolute top-8 right-8 z-[110] w-14 h-14 flex items-center justify-center rounded-full bg-foreground/5 border border-foreground/10 text-foreground hover:bg-accent hover:text-accent-foreground transition-all shadow-premium"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>

          <div className="w-full max-w-6xl relative">
            {/* Context Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10 text-center"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-4 block">
                {media.type === 'audio' ? 'Auditory Worship' : 'Digital Sanctuary Cinema'}
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-foreground italic heading-premium">
                {media.title}
              </h2>
              {media.speaker && (
                <p className="mt-4 text-muted-foreground font-medium italic text-lg">{media.speaker}</p>
              )}
            </motion.div>

            {/* The Player */}
            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', damping: 20 }}
              className="shadow-2xl shadow-accent/20"
            >
              <BrandedMediaPlayer 
                url={media.type === 'audio' ? (media.audioUrl || media.videoUrl || media.url) : (media.videoUrl || media.audioUrl || media.url)} 
                title={media.title} 
                type={media.type}
                playing={true} 
              />
            </motion.div>

            {/* Footer / Meta */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-foreground/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40"
            >
                <div className="flex items-center gap-4">
                    <span>{media.date || 'Archives'}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/30" />
                    <span>Church Regional Ministry</span>
                </div>
                <div className="flex items-center gap-4">
                     <img src="/images/jesus-light.png" alt="Logo" className="w-6 h-6 opacity-30" />
                     <span className="italic">Proclaiming the Word onsite</span>
                </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MediaCinema;
