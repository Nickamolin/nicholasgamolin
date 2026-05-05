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
export function useCanHover(): boolean {
    const [canHover, setCanHover] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
        setCanHover(mql.matches);

        const handler = (e: MediaQueryListEvent) => setCanHover(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    return canHover;
}
