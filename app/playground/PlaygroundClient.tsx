"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import Cube, { CubeHandle } from "@/components/Cube/Cube";
import CubeClassic, { CubeClassicHandle } from "@/components/Cube/CubeClassic";
import CubePlain, { CubePlainHandle } from "@/components/Cube/CubePlain";

const IMAGE = "https://zvajkoxglyawliuigirq.supabase.co/storage/v1/object/public/art/watcher.PNG";

// ─── Slider ──────────────────────────────────────────────────────────────────

interface SliderDef {
  label: string;
  key: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  format?: (v: number) => string;
}

function fmt2(v: number) { return v.toFixed(2); }
function fmt1(v: number) { return v.toFixed(1); }

const CUBE_SLIDERS: SliderDef[] = [
  { label: "Dispersion", key: "dispersion",          min: 0,   max: 0.20, step: 0.005,defaultValue: 0.04, format: fmt2 },
  { label: "Refraction", key: "refractionStrength",  min: 0,   max: 0.5,  step: 0.01, defaultValue: 0.18, format: fmt2 },
  { label: "View Scale", key: "viewScale",            min: 0.5, max: 2.0,  step: 0.05, defaultValue: 1.05, format: fmt2 },
  { label: "Opacity",    key: "glassOpacity",         min: 0,   max: 0.5,  step: 0.01, defaultValue: 0.1,  format: fmt2 },
  { label: "Size",       key: "size",                 min: 0.5, max: 3.0,  step: 0.1,  defaultValue: 1.5,  format: fmt1 },
];

const CLASSIC_SLIDERS: SliderDef[] = [
  { label: "IOR",         key: "ior",         min: 1.0, max: 2.5, step: 0.01, defaultValue: 1.6,  format: fmt2 },
  { label: "Dispersion",  key: "dispersion",  min: 0,   max: 0.20,step: 0.005,defaultValue: 0.04, format: fmt2 },
  { label: "Opacity",     key: "glassOpacity",min: 0,   max: 0.5, step: 0.01, defaultValue: 0.12, format: fmt2 },
  { label: "Depth Offset",key: "depthOffset", min: 0.1, max: 2.0, step: 0.05, defaultValue: 0.5,  format: fmt2 },
  { label: "Image Scale", key: "imageScale",  min: 0.5, max: 2.0, step: 0.05, defaultValue: 1.0,  format: fmt2 },
  { label: "Size",        key: "size",        min: 0.5, max: 3.0, step: 0.1,  defaultValue: 1.5,  format: fmt1 },
];

const PLAIN_SLIDERS: SliderDef[] = [
  { label: "View Scale", key: "viewScale", min: 0.5, max: 2.0, step: 0.05, defaultValue: 0.95, format: fmt2 },
  { label: "Size",       key: "size",      min: 0.5, max: 3.0, step: 0.1,  defaultValue: 1.5,  format: fmt1 },
];

// ─── DebugPanel ──────────────────────────────────────────────────────────────

interface DebugPanelProps {
  sliders: SliderDef[];
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
  isResetting?: boolean;
}

function DebugPanel({ sliders, values, onChange, isResetting }: DebugPanelProps) {
  return (
    <div
      className="w-full mt-3 rounded-xl px-4 py-3 flex flex-col gap-2.5"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {sliders.map((s) => {
        const val = values[s.key] ?? s.defaultValue;
        const pct = ((val - s.min) / (s.max - s.min)) * 100;
        return (
          <div key={s.key} className="flex flex-col gap-1">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-subtitle font-medium tracking-[0.12em] uppercase text-gray-500">
                {s.label}
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                {(s.format ?? fmt2)(val)}
              </span>
            </div>
            <div className="relative h-[2px] rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${pct}%`,
                  background: "rgba(255,255,255,0.55)",
                  transition: "none",
                }}
              />
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${pct}%`,
                  top: "50%",
                  width: "8px",
                  height: "8px",
                  transform: "translate(-50%, -50%)",
                  background: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }}
              />
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={val}
                onChange={(e) => onChange(s.key, parseFloat(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                style={{ height: "16px", top: "-7px" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Defaults ────────────────────────────────────────────────────────────────

function makeDefaults(sliders: SliderDef[]): Record<string, number> {
  return Object.fromEntries(sliders.map((s) => [s.key, s.defaultValue]));
}

const CUBE_DEFAULTS    = makeDefaults(CUBE_SLIDERS);
const CLASSIC_DEFAULTS = makeDefaults(CLASSIC_SLIDERS);
const PLAIN_DEFAULTS   = makeDefaults(PLAIN_SLIDERS);

// ─── Animated reset helpers ───────────────────────────────────────────────────

const RESET_DURATION_MS = 650;

function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }

function lerpProps(
  from: Record<string, number>,
  to: Record<string, number>,
  t: number
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const key of Object.keys(to)) {
    result[key] = (from[key] ?? to[key]) + ((to[key] - (from[key] ?? to[key])) * t);
  }
  return result;
}

// ─── PlaygroundClient ─────────────────────────────────────────────────────────

export default function PlaygroundClient() {
  const cubeRef    = useRef<CubeHandle>(null);
  const classicRef = useRef<CubeClassicHandle>(null);
  const plainRef   = useRef<CubePlainHandle>(null);

  const [cubeProps,    setCubeProps]    = useState(CUBE_DEFAULTS);
  const [classicProps, setClassicProps] = useState(CLASSIC_DEFAULTS);
  const [plainProps,   setPlainProps]   = useState(PLAIN_DEFAULTS);
  const [spinning,     setSpinning]     = useState(false);
  const [isResetting,  setIsResetting]  = useState(false);

  // Refs for the animated reset rAF loop
  const resetRafRef      = useRef<number | null>(null);
  const resetStartRef    = useRef<number>(0);
  const resetFromCube    = useRef<Record<string, number>>(CUBE_DEFAULTS);
  const resetFromClassic = useRef<Record<string, number>>(CLASSIC_DEFAULTS);
  const resetFromPlain   = useRef<Record<string, number>>(PLAIN_DEFAULTS);

  const handleReset = useCallback(() => {
    // Cancel any in-flight reset
    if (resetRafRef.current !== null) cancelAnimationFrame(resetRafRef.current);

    // Snapshot current values as the "from" state
    resetFromCube.current    = { ...cubeProps };
    resetFromClassic.current = { ...classicProps };
    resetFromPlain.current   = { ...plainProps };
    resetStartRef.current    = performance.now();

    // Start camera animations
    cubeRef.current?.resetRotation();
    classicRef.current?.resetRotation();
    plainRef.current?.resetRotation();

    // Start spinner + slider CSS transition flag
    setSpinning(true);
    setIsResetting(true);

    const tick = () => {
      const elapsed = performance.now() - resetStartRef.current;
      const rawT    = Math.min(elapsed / RESET_DURATION_MS, 1);
      const t       = easeOutCubic(rawT);

      setCubeProps(lerpProps(resetFromCube.current,    CUBE_DEFAULTS,    t));
      setClassicProps(lerpProps(resetFromClassic.current, CLASSIC_DEFAULTS, t));
      setPlainProps(lerpProps(resetFromPlain.current,   PLAIN_DEFAULTS,   t));

      if (rawT < 1) {
        resetRafRef.current = requestAnimationFrame(tick);
      } else {
        // Snap to exact defaults at the end to avoid float drift
        setCubeProps(CUBE_DEFAULTS);
        setClassicProps(CLASSIC_DEFAULTS);
        setPlainProps(PLAIN_DEFAULTS);
        resetRafRef.current = null;
        setSpinning(false);
        setIsResetting(false);
      }
    };
    resetRafRef.current = requestAnimationFrame(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cubeProps, classicProps, plainProps]);

  // Clean up rAF on unmount
  useEffect(() => {
    return () => {
      if (resetRafRef.current !== null) cancelAnimationFrame(resetRafRef.current);
    };
  }, []);

  const patchCube    = (k: string, v: number) => setCubeProps(p => ({ ...p, [k]: v }));
  const patchClassic = (k: string, v: number) => setClassicProps(p => ({ ...p, [k]: v }));
  const patchPlain   = (k: string, v: number) => setPlainProps(p => ({ ...p, [k]: v }));

  return (
    <div className="flex flex-col items-center w-full max-w-5xl">

      {/* Header */}
      <div className="flex flex-col items-center gap-(--spacing-header-gap) mb-(--spacing-header-mb) md:mt-(--spacing-page-top)">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold">Playground</h1>
        <span className="text-xs md:text-sm font-subtitle font-medium tracking-[0.2em] uppercase text-gray-400">
          Some interactions I&apos;m testing out.
        </span>
      </div>

      {/* Cube row + reset button */}
      <div className="flex flex-row items-start justify-center w-full gap-4">

        {/* Screen-space */}
        <div className="flex flex-col items-center w-full">
          <div className="w-full h-[280px]">
            <Cube
              ref={cubeRef}
              image={IMAGE}
              className="w-full h-full"
              dispersion={cubeProps.dispersion}
              refractionStrength={cubeProps.refractionStrength}
              viewScale={cubeProps.viewScale}
              glassOpacity={cubeProps.glassOpacity}
              size={cubeProps.size}
            />
          </div>
          <span className="mt-3 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            Screen-space refraction
          </span>
          <DebugPanel sliders={CUBE_SLIDERS} values={cubeProps} onChange={patchCube} isResetting={isResetting} />
        </div>

        {/* Virtual-plane */}
        <div className="flex flex-col items-center w-full">
          <div className="w-full h-[280px]">
            <CubeClassic
              ref={classicRef}
              image={IMAGE}
              className="w-full h-full"
              ior={classicProps.ior}
              dispersion={classicProps.dispersion}
              glassOpacity={classicProps.glassOpacity}
              depthOffset={classicProps.depthOffset}
              imageScale={classicProps.imageScale}
              size={classicProps.size}
            />
          </div>
          <span className="mt-3 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            Virtual-plane refraction
          </span>
          <DebugPanel sliders={CLASSIC_SLIDERS} values={classicProps} onChange={patchClassic} isResetting={isResetting} />
        </div>

        {/* Plain crop */}
        <div className="flex flex-col items-center w-full">
          <div className="w-full h-[280px]">
            <CubePlain
              ref={plainRef}
              image={IMAGE}
              className="w-full h-full"
              viewScale={plainProps.viewScale}
              size={plainProps.size}
            />
          </div>
          <span className="mt-3 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            No refraction (reference)
          </span>
          <DebugPanel sliders={PLAIN_SLIDERS} values={plainProps} onChange={patchPlain} isResetting={isResetting} />
        </div>

        {/* Reset button — vertically centred against the cube canvases */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center" style={{ height: "280px" }}>
          <button
            onClick={handleReset}
            title="Reset all cubes"
            className="group flex flex-col items-center gap-2 cursor-pointer"
            style={{ background: "none", border: "none", padding: 0 }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background:    "rgba(255,255,255,0.06)",
                border:        "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <img
                src="/icons/buttons/refresh.svg"
                alt="Reset"
                className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-all invert"
                style={{
                  transform:  spinning ? "rotate(-360deg)" : "rotate(0deg)",
                  transition: spinning ? "transform 0.65s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease, filter 0.2s ease" : "transform 0.2s ease, opacity 0.2s ease, filter 0.2s ease",
                }}
              />
            </div>
            <span
              className="text-[9px] font-subtitle font-medium tracking-[0.14em] uppercase text-gray-600 group-hover:text-gray-400 transition-colors"
            >
              Reset
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
