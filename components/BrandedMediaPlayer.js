import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import VideoJS from './VideoJS';
import AudioVisualizer from './AudioVisualizer';
import { motion, AnimatePresence } from 'framer-motion';

const BrandedMediaPlayer = ({
    url,
    title,
    type = 'video',
    playing = false,
    onProgress = null,
}) => {
    const [hasMounted, setHasMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [startPlayback, setStartPlayback] = useState(false);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const playerRef = useRef(null);
    const nativeAudioRef = useRef(null);

    const isAudio = type === 'audio';

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (!playing) return;
        const timer = setTimeout(() => {
            setStartPlayback(true);
        }, 1200); 
        return () => clearTimeout(timer);
    }, [playing]);

    // Native Audio Logic
    useEffect(() => {
        if (isAudio && startPlayback && nativeAudioRef.current) {
            nativeAudioRef.current.play().catch(err => {
                console.warn('Native Audio Autoplay Interrupted:', err);
            });
            setIsLoading(false);
        }
    }, [isAudio, startPlayback]);

    if (!hasMounted) return null;

    // Determine Driver
    const isYouTube = url?.includes('youtube.com') || url?.includes('youtu.be');
    
    // YouTube ID Extraction
    const getYouTubeId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url?.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = isYouTube ? getYouTubeId(url) : null;

    // VideoJS Options (Only for Video now)
    const videoJsOptions = {
        autoplay: startPlayback,
        controls: true,
        responsive: true,
        fluid: true,
        padding: false,
        muted: true, // v9: Autoplay compliance
        sources: [{
            src: url,
            type: 'video/mp4'
        }],
        userActions: {
            hotkeys: true
        }
    };

    const handlePlayerReady = (player) => {
        playerRef.current = player;
        setIsLoading(false);
        
        // Synchronized Playback
        if (startPlayback) {
            player.play();
        }

        player.on('waiting', () => setIsLoading(true));
        player.on('playing', () => setIsLoading(false));
    };

    return (
        <div className={`relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl group ${
            isAudio ? 'aspect-video md:aspect-[21/9]' : 'aspect-video'
        }`}>
            {/* Sanctuary Sync Status */}
            <div className={`absolute top-0 left-0 right-0 z-[100] px-4 py-1 text-[8px] font-bold uppercase tracking-widest text-center pointer-events-none transition-all duration-1000 ${
                isLoading ? 'bg-accent/20 text-accent' : 'bg-transparent text-white/5'
            }`}>
                {isLoading ? 'Sanctuary Sync: Calibrating Driver...' : 'Sanctuary Sync: v9-Cinematic (Active)'}
            </div>

            {/* Loading Overlay */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 bg-neutral-900 flex flex-col items-center justify-center p-8 text-center pointer-events-none"
                    >
                        <img
                            src="/images/jesus-light.png"
                            alt="Logo"
                            className="w-16 h-16 opacity-20 mb-4 animate-pulse"
                        />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                            Engaging Sanctuary Signal...
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full h-full bg-black relative z-10 flex items-center justify-center">
                {isYouTube && youtubeId ? (
                    <YouTube
                        videoId={youtubeId}
                        onReady={() => setIsLoading(false)}
                        onPlay={() => setIsLoading(false)}
                        opts={{
                            width: '100%',
                            height: '100%',
                            playerVars: {
                                autoplay: startPlayback ? 1 : 0,
                                modestbranding: 1,
                                rel: 0,
                                origin: window.location.origin
                            },
                        }}
                        className="w-full h-full aspect-video"
                    />
                ) : isAudio ? (
                    <div className="w-full h-full flex flex-col items-center justify-between p-8 bg-gradient-to-b from-neutral-900 to-black overflow-hidden">
                        {/* Visualizer Stage */}
                        <div className="flex-1 w-full flex items-center justify-center relative">
                            <AnimatePresence>
                                {isAudioPlaying && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute inset-0 flex items-center justify-center"
                                    >
                                        <AudioVisualizer audioRef={nativeAudioRef} isActive={isAudioPlaying} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            <img
                                src="/images/jesus-light.png"
                                alt="Audio Illustration"
                                className={`w-32 h-32 transition-all duration-700 ${isAudioPlaying ? 'opacity-5 scale-110 blur-sm' : 'opacity-20 scale-100'}`}
                            />
                        </div>

                        {/* Controls Stage */}
                        <div className="w-full flex flex-col items-center gap-4 relative z-20">
                            <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] text-center">
                                {title || 'Auditory Reflection'}
                            </span>
                            
                            <audio
                                ref={nativeAudioRef}
                                src={url}
                                crossOrigin="anonymous"
                                controls
                                className="w-full max-w-md filter invert hue-rotate-180 opacity-80 hover:opacity-100 transition-opacity"
                                onPlay={() => {
                                    setIsAudioPlaying(true);
                                    setIsLoading(false);
                                }}
                                onPause={() => setIsAudioPlaying(false)}
                                onLoadedData={() => setIsLoading(false)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full">
                        <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
                    </div>
                )}
            </div>

            {/* Manual Engagement Fallback */}
            {!startPlayback && !isLoading && !isAudio && (
                <button
                    onClick={() => setStartPlayback(true)}
                    className="absolute inset-0 z-40 bg-black/40 flex items-center justify-center transition-opacity hover:bg-black/10"
                >
                    <div className="w-20 h-20 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-accent border-b-[10px] border-b-transparent ml-2" />
                    </div>
                </button>
            )}

            {/* Branded Watermark */}
            <div className="absolute bottom-6 right-6 z-20 pointer-events-none opacity-20 group-hover:opacity-100 transition-opacity duration-700">
                <div className="flex items-center gap-3">
                    <img src="/images/jesus-light.png" alt="Logo" className="w-8 h-8 opacity-40" />
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white leading-none text-right">AFC SEAR</span>
                        <span className="text-[6px] font-bold text-accent uppercase tracking-widest text-right">Sanctuary Cinema</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandedMediaPlayer;