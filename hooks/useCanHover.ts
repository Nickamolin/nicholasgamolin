import { useState, useEffect } from "react";

/**
 * Reactively detects whether the user's primary pointing device supports hover.
 * Returns `true` for mice/trackpads, `false` for touch-only devices.
 *
 * Uses `@media (hover: hover)` which correctly handles hybrid devices like
 * iPads with trackpads or Surface devices — unlike `pointer: coarse` or
 * `ontouchstart` checks which produce false positives on those devices.
 *
 * The returned value updates automatically if the input situation changes
 * (e.g. a trackpad is connected or disconnected).
 */
export function useCanHover(): boolean {
    const [canHover, setCanHover] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia("(hover: hover)");
        setCanHover(mql.matches);

        const handler = (e: MediaQueryListEvent) => setCanHover(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    return canHover;
}
