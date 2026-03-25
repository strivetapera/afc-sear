import React, { useEffect, useRef } from 'react';

const AudioVisualizer = ({ audioRef, isActive }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);

    useEffect(() => {
        if (!audioRef.current || !isActive) return;

        const initAudio = () => {
            try {
                if (!audioContextRef.current) {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    audioContextRef.current = new AudioContext();
                    analyserRef.current = audioContextRef.current.createAnalyser();
                    analyserRef.current.fftSize = 256;
                    
                    // Create source only once
                    sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
                    sourceRef.current.connect(analyserRef.current);
                    analyserRef.current.connect(audioContextRef.current.destination);
                }
                
                if (audioContextRef.current.state === 'suspended') {
                    audioContextRef.current.resume();
                }
            } catch (err) {
                console.error('Visualizer Init Error:', err);
            }
        };

        const draw = () => {
            if (!canvasRef.current || !analyserRef.current) return;

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;

                // Sacred Gold Gradient (HSL 45 93% 47%) -> RGB 232, 175, 8
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, 'rgba(232, 175, 8, 0.1)'); // Faded base
                gradient.addColorStop(0.5, 'rgba(232, 175, 8, 0.4)'); // Mid glow
                gradient.addColorStop(1, 'rgba(232, 175, 8, 0.8)'); // Sharp top

                ctx.fillStyle = gradient;
                
                // Draw symmetrical bars from center or standard bars
                // Using standard bars for "Sanctuary Monitor" feel
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

                x += barWidth + 1;
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        initAudio();
        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [audioRef, isActive]);

    return (
        <canvas 
            ref={canvasRef} 
            className="w-full h-32 opacity-60 pointer-events-none"
            width={600}
            height={200}
        />
    );
};

export default AudioVisualizer;
