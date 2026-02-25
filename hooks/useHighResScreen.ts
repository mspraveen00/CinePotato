'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the user's screen is considered "high resolution"
 * (e.g., > 2000px logical width OR high device pixel ratio on a tablet/desktop).
 * 
 * We intentionally exclude standard mobile phones (width < 768px) even if they 
 * have 3x+ retina screens, because downloading a massive 4K "original" backdrop 
 * over a mobile network for a 400px wide <div> is wasteful.
 * 
 * For mobile phones, a 1080p (w1280) image is already vastly oversized and 
 * provides flawless sharpness.
 * 
 * Target "true" criteria:
 * 1. Physical large monitor (> 2000px wide)
 * 2. High-DPR screens (dpr >= 2) - This handles mobile devices where "object-cover" 
 *    in a tall portrait container aggressively stretches 16:9 1080p images.
 */
export function useHighResScreen() {
    const [isHighRes, setIsHighRes] = useState(false);

    useEffect(() => {
        const checkResolution = () => {
            const width = window.innerWidth;
            const dpr = window.devicePixelRatio || 1;

            // 1. Literal large monitors
            if (width > 2000) {
                setIsHighRes(true);
                return;
            }

            // 2. High density screens (Retina)
            // Includes mobile phones because 1080p (1280x720) backdrops (16:9) 
            // are severely stretched by "object-cover" in a 100dvh portrait container.
            if (dpr >= 2) {
                setIsHighRes(true);
                return;
            }

            setIsHighRes(false);
        };

        // Initial check
        checkResolution();

        // Listen for screen changes (e.g., moving window to another monitor)
        window.addEventListener('resize', checkResolution);

        return () => window.removeEventListener('resize', checkResolution);
    }, []);

    return isHighRes;
}
