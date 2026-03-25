import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';
import BrandedMediaPlayer from './BrandedMediaPlayer';

const CHANNEL_ID = 'UCviS_jCvkDzAGZK0lqntbVA';

const YouTubeLiveStatus = ({ scheduledEvents = [], zoomDetails = {} }) => {
  const [status, setStatus] = useState('checking'); // checking, live, waiting, offline
  const [liveData, setLiveData] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);
  const [countdown, setCountdown] = useState('');

  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

  useEffect(() => {
    // 1. Identify the next local scheduled event as a baseline
    if (scheduledEvents.length > 0) {
      setNextEvent(scheduledEvents[0]);
    }

    const checkYouTubeStatus = async () => {
      // Manual Sanctuary Bypass (Live Override)
      if (zoomDetails?.currentLiveVideoId) {
        setLiveData({
          id: { videoId: zoomDetails.currentLiveVideoId },
          snippet: { title: 'Live Regional Broadcast' }
        });
        setStatus('live');
        return;
      }

      if (!API_KEY) {
        setStatus('waiting');
        return;
      }

      try {
        // Check for LIVE streams
        const liveRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&type=video&eventType=live&key=${API_KEY}`
        );
        const liveJson = await liveRes.json();

        if (liveJson.items && liveJson.items.length > 0) {
          setLiveData(liveJson.items[0]);
          setStatus('live');
          return;
        }

        // Check for UPCOMING streams
        const upcomingRes = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&type=video&eventType=upcoming&key=${API_KEY}&order=date`
        );
        const upcomingJson = await upcomingRes.json();
 
        if (upcomingJson.items && upcomingJson.items.length > 0) {
          const videoId = upcomingJson.items[0].id.videoId;
          
          // Technical Detail: Precision harvest of scheduledStartTime
          const detailRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails,snippet&id=${videoId}&key=${API_KEY}`
          );
          const detailJson = await detailRes.json();
          
          if (detailJson.items && detailJson.items.length > 0) {
            const videoDetail = detailJson.items[0];
            const startTime = videoDetail.liveStreamingDetails?.scheduledStartTime;
            
            setNextEvent({
              title: videoDetail.snippet.title,
              occurrenceLabel: 'Upcoming Regional Broadcast',
              startDateTime: startTime || videoDetail.snippet.publishedAt, 
              joinUrl: `https://www.youtube.com/watch?v=${videoId}`,
              providerLabel: 'YouTube'
            });
            setStatus('waiting');
            return;
          }
        }

        setStatus('waiting');
      } catch (error) {
        console.error('YouTube API Error:', error);
        setStatus('waiting');
      }
    };

    // Initial check and interval management
    checkYouTubeStatus();
    
    // Check every 5 minutes normally, but every 30 seconds if an event is starting soon
    const getInterval = () => {
      if (status === 'waiting' && nextEvent?.startDateTime) {
        const diff = new Date(nextEvent.startDateTime) - new Date();
        if (diff < 300000) return 30000; // 30 seconds if within 5 mins
      }
      return 300000; // 5 mins otherwise
    };

    const interval = setInterval(checkYouTubeStatus, getInterval());
    return () => clearInterval(interval);
  }, [API_KEY, scheduledEvents, status, nextEvent]);

  // Handle Countdown UI
  useEffect(() => {
    if (status !== 'waiting' || !nextEvent?.startDateTime) return;

    const updateCountdown = () => {
      const now = new Date();
      const target = new Date(nextEvent.startDateTime);
      const diff = target - now;

      if (diff <= 0) {
        setCountdown('Starting soon...');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(`${hours}h ${mins}m ${secs}s`);
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => clearInterval(timer);
  }, [status, nextEvent]);

  return (
    <div className="relative group overflow-hidden rounded-3xl border border-foreground/10 bg-card/40 p-8 md:p-12 mb-16 backdrop-blur-xl shadow-premium transition-all duration-700 hover:border-accent/30">
        {/* Animated Background Pulse */}
        <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] transition-colors duration-1000 -z-10 ${
            status === 'live' ? 'bg-red-500/20' : 'bg-accent/10'
        }`} />

        <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="relative flex items-center justify-center w-4 h-4">
                        <span className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                            status === 'live' ? 'bg-red-500' : 'bg-amber-500'
                        }`} />
                        <span className={`relative w-2.5 h-2.5 rounded-full ${
                            status === 'live' ? 'bg-red-500' : 'bg-amber-500'
                        }`} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/60">
                        {status === 'live' ? 'Live Broadcast Active' : 'Waiting for Live Service'}
                    </span>
                </div>

                {status === 'waiting' && countdown && (
                    <div className="px-6 py-2 rounded-full bg-foreground/5 border border-foreground/10 text-[10px] font-black uppercase tracking-widest text-accent">
                        Next stream in: {countdown}
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {status === 'live' ? (
                    <motion.div
                        key="live-ui"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground italic heading-premium mb-6">
                            {liveData?.snippet?.title || 'Current Live Sanctuary'}
                        </h2>
                        <div className="mb-10 aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                            <BrandedMediaPlayer 
                                url={`https://www.youtube.com/watch?v=${liveData?.id?.videoId}`}
                                title={liveData?.snippet?.title || 'Current Live Sanctuary'}
                                playing={true}
                            />
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href={`https://www.youtube.com/watch?v=${liveData?.id?.videoId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-full bg-red-600 text-white px-12 py-5 text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.05] shadow-premium"
                            >
                                Watch on YouTube →
                            </a>
                            <a
                                href={zoomDetails.zoomUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-full bg-accent text-accent-foreground px-10 py-5 text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.05] shadow-premium"
                            >
                                Enter Zoom Sanctuary
                            </a>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="waiting-ui"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground italic heading-premium mb-6">
                            {nextEvent?.title || 'Preparing the Altar'}
                        </h2>
                        <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground font-medium mb-10">
                            {nextEvent 
                              ? `Our next scheduled service is ${nextEvent.title}. Prepare your heart as we await the upcoming broadcast from the regional center.`
                              : "The digital sanctuary is currently in prayerful anticipation. Please join us during our regularly scheduled services for a coordinated encounter with God."
                            }
                        </p>
                        
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
                            <div className="p-6 rounded-2xl bg-foreground/5 border border-foreground/5 backdrop-blur-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">Next Service</p>
                                <p className="text-xl font-bold tracking-tight">{nextEvent?.occurrenceLabel || 'Checking schedule...'}</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-foreground/5 border border-foreground/5 backdrop-blur-sm">
                                <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">Sanctuary Platform</p>
                                <p className="text-xl font-bold tracking-tight">YouTube & Zoom</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                             <a
                                href={`https://www.youtube.com/channel/${CHANNEL_ID}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-full bg-foreground/10 text-foreground px-10 py-5 text-sm font-black uppercase tracking-widest transition-all hover:bg-accent hover:text-accent-foreground shadow-premium"
                            >
                                Visit Channel
                            </a>
                            <Link href="/events" className="inline-flex items-center justify-center rounded-full border border-foreground/10 px-10 py-5 text-sm font-black uppercase tracking-widest hover:border-accent transition-all">
                                View Full Schedule
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
};

export default YouTubeLiveStatus;
