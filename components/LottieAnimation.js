// components/LottieAnimation.js
import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

const LottieAnimation = ({ path, isPaused, onError }) => { // Accept path and onError
  const container = useRef(null);
  const anim = useRef(null); // Use ref to store animation instance

  useEffect(() => {
    if (!path) {
      console.warn('No animation path provided to LottieAnimation component.');
      if (onError) onError(new Error('No animation path provided'));
      return;
    }
    if (!container.current) return;

    try {
        anim.current = lottie.loadAnimation({
          container: container.current,
          renderer: 'svg',
          loop: false,
          autoplay: false, // Initially don't autoplay, control via isPaused effect
          path: path, // Use the path prop
        });

        // Add error listener
        anim.current.addEventListener('data_failed', () => {
            console.error('Lottie data failed to load for path:', path);
            if (onError) onError(new Error('Lottie data failed to load'));
        });
         anim.current.addEventListener('error', (error) => {
            console.error('Lottie error for path:', path, error);
            if (onError) onError(error);
        });

    } catch (error) {
         console.error('Error initializing Lottie:', error);
         if (onError) onError(error);
    }


    return () => {
      if (anim.current) {
        anim.current.destroy();
        anim.current = null;
      }
    };
  }, [path, onError]); // Depend on path and onError

  // Separate effect to control playback based on isPaused
  useEffect(() => {
      if (anim.current) {
          if (isPaused) {
            // Decide how to handle pausing, maybe go to a specific frame?
            // For a toggle, playing segments might be better
             anim.current.playSegments([150, 0], true); // Play closing animation
          } else {
             anim.current.playSegments([0, 150], true); // Play opening animation
          }
      }
  }, [isPaused]); // Depend only on isPaused

  return <div ref={container} className="w-[50px] h-[50px]" />;
};

export default LottieAnimation;