import { useRef, useState, useCallback, useEffect } from "react";

// ─── Easing & lerp ───────────────────────────────────────────────────────────

const RESET_DURATION_MS = 650;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function lerpProps(
  from: Record<string, any>,
  to: Record<string, any>,
  t: number
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(to)) {
    const fromVal = from[key] ?? to[key];
    const toVal = to[key];
    if (typeof toVal === "number" && typeof fromVal === "number") {
      result[key] = fromVal + (toVal - fromVal) * t;
    } else {
      // Snap non-numeric props (strings, booleans) immediately to target
      result[key] = toVal;
    }
  }
  return result;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Manages props state for a single experiment card with an animated lerp-reset.
 *
 * @param defaults - The default values to reset back to.
 * @returns props, patch, spinning, isResetting, triggerReset
 */
export function useAnimatedReset(defaults: Record<string, any>) {
  const [props, setProps] = useState<Record<string, any>>(defaults);
  const [spinning, setSpinning] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const rafRef   = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const fromRef  = useRef<Record<string, any>>(defaults);

  // Keep a live ref to current props so the callback closure stays fresh
  const propsRef = useRef(props);
  useEffect(() => { propsRef.current = props; }, [props]);

  const triggerReset = useCallback((onComplete?: () => void) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    fromRef.current = { ...propsRef.current };
    startRef.current = performance.now();
    setSpinning(true);
    setIsResetting(true);

    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      const rawT    = Math.min(elapsed / RESET_DURATION_MS, 1);
      const t       = easeOutCubic(rawT);

      setProps(lerpProps(fromRef.current, defaults, t));

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setProps(defaults);
        rafRef.current = null;
        setSpinning(false);
        setIsResetting(false);
        onComplete?.();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [defaults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const patch = useCallback((key: string, value: any) => {
    setProps((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { props, setProps, patch, spinning, isResetting, triggerReset };
}
