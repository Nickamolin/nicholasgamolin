import { useState, useEffect } from "react";

/**
 * Reactively detects whether the user's primary pointing device supports hover.
 * Returns `true` for mice/trackpads, `false` for touch-only devices.
 *
 * Uses `(hover: hover) and (pointer: fine)` — the conjunction is important:
 * - `hover: hover` alone is insufficient because Android Chrome synthesizes
 *   hover events from touch, causing it to report hover support incorrectly.
 * - Adding `pointer: fine` ensures the primary pointer is precise (mouse/trackpad)
 *   rather than coarse (finger). Touch screens always report `pointer: coarse`
 *   regardless of Chrome's hover emulation, so Android is correctly excluded.
 * - iPads with a connected trackpad correctly report both `hover: hover` and
 *   `pointer: fine`, so that hybrid case is preserved.
 *
 * The returned value updates automatically if the input situation changes
 * (e.g. a trackpad is connected or disconnected).
 */

// Cache the value so dynamically mounted components initialize synchronously 
// and avoid a flash of the default 'false' state.
let cachedCanHover: boolean | null = null;

export function useCanHover(): boolean {
    const [canHover, setCanHover] = useState(() => {
        if (cachedCanHover !== null) return cachedCanHover;
        return false;
    });

    useEffect(() => {
        const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
        
        const updateHover = (matches: boolean) => {
            cachedCanHover = matches;
            setCanHover(matches);
        };

        updateHover(mql.matches);

        const handler = (e: MediaQueryListEvent) => updateHover(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    return canHover;
}
