import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to manage the Welcome sequence logic
 */
export const useWelcomeManager = () => {
    const [state, setState] = useState('idle'); // 'idle' | 'talk' | 'celebrate'
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [needsClickToPlay, setNeedsClickToPlay] = useState(false);
    const audioRef = useRef(null);

    const startSequence = useCallback(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio('/vocal/welcome.wav');

            audioRef.current.onplay = () => {
                setIsAudioPlaying(true);
                setState('talk');
            };

            audioRef.current.onended = () => {
                setIsAudioPlaying(false);
                setState('idle');
                // Mark as seen once finished
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('welcome') !== '1') {
                    localStorage.setItem('hasSeenWelcome', '1');
                }
            };
        }

        audioRef.current.play().catch((error) => {
            console.warn("Autoplay blocked or audio error:", error);
            setNeedsClickToPlay(true);
        });
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const isDebug = urlParams.get('welcome') === '1';
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === '1';

        if (isDebug || !hasSeenWelcome) {
            // Small delay to ensure everything is mounted
            const timer = setTimeout(() => {
                startSequence();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [startSequence]);

    const handleEnableSound = () => {
        setNeedsClickToPlay(false);
        startSequence();
    };

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    return {
        state,
        needsClickToPlay,
        handleEnableSound,
        isAudioPlaying
    };
};
