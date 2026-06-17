"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import Cube, { CubeHandle } from "@/components/Cube/Cube";
import CubeClassic, { CubeClassicHandle } from "@/components/Cube/CubeClassic";
import CubePlain, { CubePlainHandle } from "@/components/Cube/CubePlain";
import CubeHtmlToImageRefraction from "@/components/Cube/CubeHtmlToImageRefraction";
import LoadingAnimation3D, { LoadingAnimation3DHandle } from "@/components/3D/LoadingAnimation3D";
import LoadingAnimation from "@/components/loading/LoadingAnimation";

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

const GLB_SLIDERS: SliderDef[] = [
  { label: "Framerate", key: "targetFps", min: 12, max: 60, step: 1, defaultValue: 60, format: (v) => v >= 60 ? "SMOOTH" : v.toFixed(0) },
  { label: "Speed", key: "playbackSpeed", min: 0, max: 2, step: 0.1, defaultValue: 1.0, format: fmt2 },
  { label: "Scale", key: "modelScale", min: 0.5, max: 2.0, step: 0.05, defaultValue: 1.0, format: fmt2 },
  { label: "Ortho Blend", key: "orthoBlend", min: 0, max: 1, step: 0.01, defaultValue: 1.0, format: fmt2 }
];

interface SelectDef {
  label: string;
  key: string;
  options: { value: string | number; label: string }[];
  defaultValue: string | number;
}

const GLB_SELECTS: SelectDef[] = [
  {
    label: "Material",
    key: "materialType",
    defaultValue: "default",
    options: [
      { value: "default", label: "Default" },
      { value: "wireframe", label: "Wireframe" },
      { value: "normal", label: "Normal Map" }
    ]
  }
];

function makeSelectDefaults(selects: SelectDef[]): Record<string, any> {
  return Object.fromEntries(selects.map((s) => [s.key, s.defaultValue]));
}

// ─── DebugPanel ──────────────────────────────────────────────────────────────

interface DebugPanelProps {
  sliders?: SliderDef[];
  selects?: SelectDef[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  isResetting?: boolean;
  children?: React.ReactNode;
}

function DebugPanel({ sliders, selects, values, onChange, isResetting, children }: DebugPanelProps) {
  return (
    <div
      className="w-full mt-3 rounded-xl px-4 py-3 flex flex-col gap-2.5"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {sliders && sliders.map((s) => {
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
      {selects && selects.map((s) => (
        <div key={s.key} className="flex flex-col gap-1">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[10px] font-subtitle font-medium tracking-[0.12em] uppercase text-gray-500">
              {s.label}
            </span>
          </div>
          <div className="relative">
            <select
              value={values[s.key] ?? s.defaultValue}
              onChange={(e) => onChange(s.key, e.target.value)}
              className="w-full rounded-md text-[11px] font-mono text-gray-300 px-2 py-1.5 focus:outline-none cursor-pointer appearance-none transition-colors"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                WebkitAppearance: 'none',
                MozAppearance: 'none'
              }}
            >
              {s.options.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-gray-900 text-white font-mono text-[11px]">
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-400">
              <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      ))}
      {children}
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
const GLB_DEFAULTS     = { ...makeDefaults(GLB_SLIDERS), ...makeSelectDefaults(GLB_SELECTS) };

const PRE_RENDERED_SLIDERS: SliderDef[] = [
  { label: "Speed", key: "playbackSpeed", min: 0.1, max: 2.0, step: 0.1, defaultValue: 1.0, format: fmt2 }
];
const PRE_RENDERED_DEFAULTS = makeDefaults(PRE_RENDERED_SLIDERS);

// ─── Animated reset helpers ───────────────────────────────────────────────────

const RESET_DURATION_MS = 650;

function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }

function lerpProps(
  from: Record<string, any>,
  to: Record<string, any>,
  t: number
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of Object.keys(to)) {
    const fromVal = from[key] ?? to[key];
    const toVal = to[key];
    
    if (typeof toVal === 'number' && typeof fromVal === 'number') {
      result[key] = fromVal + ((toVal - fromVal) * t);
    } else {
      // Snap non-number properties (like strings/booleans) to their target immediately
      result[key] = toVal;
    }
  }
  return result;
}

// ─── PlaygroundClient ─────────────────────────────────────────────────────────

export default function RefractionLab() {
  const cubeRef    = useRef<CubeHandle>(null);
  const classicRef = useRef<CubeClassicHandle>(null);
  const plainRef   = useRef<CubePlainHandle>(null);
  const domRef     = useRef<CubeHandle>(null);
  const glbRef     = useRef<LoadingAnimation3DHandle>(null);

  const [cubeProps,    setCubeProps]    = useState(CUBE_DEFAULTS);
  const [classicProps, setClassicProps] = useState(CLASSIC_DEFAULTS);
  const [plainProps,   setPlainProps]   = useState(PLAIN_DEFAULTS);
  const [domProps,     setDomProps]     = useState(CUBE_DEFAULTS);
  const [htmlText,     setHtmlText]     = useState("TEXT");
  const [spinning,     setSpinning]     = useState(false);
  const [isResetting,  setIsResetting]  = useState(false);

  const [domSpinning,    setDomSpinning]    = useState(false);
  const [isDomResetting, setIsDomResetting] = useState(false);

  const [glbProps,       setGlbProps]       = useState(GLB_DEFAULTS);
  const [glbSpinning,    setGlbSpinning]    = useState(false);
  const [isGlbResetting, setIsGlbResetting] = useState(false);
  const [isGlbPaused, setIsGlbPaused]       = useState(false);

  const [preRenderedProps,       setPreRenderedProps]       = useState(PRE_RENDERED_DEFAULTS);
  const [isPreRenderedPaused,    setIsPreRenderedPaused]    = useState(false);
  const patchPreRendered = (k: string, v: number) => setPreRenderedProps(p => ({ ...p, [k]: v }));

  // Refs for the animated reset rAF loop
  const resetRafRef      = useRef<number | null>(null);
  const resetStartRef    = useRef<number>(0);
  const resetFromCube    = useRef<Record<string, number>>(CUBE_DEFAULTS);
  const resetFromClassic = useRef<Record<string, number>>(CLASSIC_DEFAULTS);
  const resetFromPlain   = useRef<Record<string, number>>(PLAIN_DEFAULTS);

  const resetDomRafRef   = useRef<number | null>(null);
  const resetDomStartRef = useRef<number>(0);
  const resetFromDom     = useRef<Record<string, number>>(CUBE_DEFAULTS);

  const resetGlbRafRef   = useRef<number | null>(null);
  const resetGlbStartRef = useRef<number>(0);
  const resetFromGlb     = useRef<Record<string, number>>(GLB_DEFAULTS);

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

  const handleDomReset = useCallback(() => {
    if (resetDomRafRef.current !== null) cancelAnimationFrame(resetDomRafRef.current);

    resetFromDom.current = { ...domProps };
    resetDomStartRef.current = performance.now();

    domRef.current?.resetRotation();
    setDomSpinning(true);
    setIsDomResetting(true);

    const tick = () => {
      const elapsed = performance.now() - resetDomStartRef.current;
      const rawT    = Math.min(elapsed / RESET_DURATION_MS, 1);
      const t       = easeOutCubic(rawT);

      setDomProps(lerpProps(resetFromDom.current, CUBE_DEFAULTS, t));

      if (rawT < 1) {
        resetDomRafRef.current = requestAnimationFrame(tick);
      } else {
        setDomProps(CUBE_DEFAULTS);
        setHtmlText("TEXT");
        resetDomRafRef.current = null;
        setDomSpinning(false);
        setIsDomResetting(false);
      }
    };
    resetDomRafRef.current = requestAnimationFrame(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domProps]);

  const handleGlbReset = useCallback(() => {
    if (resetGlbRafRef.current !== null) cancelAnimationFrame(resetGlbRafRef.current);

    resetFromGlb.current = { ...glbProps };
    resetGlbStartRef.current = performance.now();

    glbRef.current?.resetRotation();
    setGlbSpinning(true);
    setIsGlbResetting(true);

    const tick = () => {
      const elapsed = performance.now() - resetGlbStartRef.current;
      const rawT    = Math.min(elapsed / RESET_DURATION_MS, 1);
      const t       = easeOutCubic(rawT);

      setGlbProps(lerpProps(resetFromGlb.current, GLB_DEFAULTS, t));

      if (rawT < 1) {
        resetGlbRafRef.current = requestAnimationFrame(tick);
      } else {
        setGlbProps(GLB_DEFAULTS);
        resetGlbRafRef.current = null;
        setGlbSpinning(false);
        setIsGlbResetting(false);
      }
    };
    resetGlbRafRef.current = requestAnimationFrame(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glbProps]);

  // Clean up rAF on unmount
  useEffect(() => {
    return () => {
      if (resetRafRef.current !== null) cancelAnimationFrame(resetRafRef.current);
      if (resetDomRafRef.current !== null) cancelAnimationFrame(resetDomRafRef.current);
      if (resetGlbRafRef.current !== null) cancelAnimationFrame(resetGlbRafRef.current);
    };
  }, []);

  const patchCube    = (k: string, v: number) => setCubeProps(p => ({ ...p, [k]: v }));
  const patchClassic = (k: string, v: number) => setClassicProps(p => ({ ...p, [k]: v }));
  const patchPlain   = (k: string, v: number) => setPlainProps(p => ({ ...p, [k]: v }));
  const patchDom     = (k: string, v: number) => setDomProps(p => ({ ...p, [k]: v }));
  const patchGlb     = (k: string, v: number) => setGlbProps(p => ({ ...p, [k]: v }));

  return (
    <div className="flex flex-col items-center w-full max-w-5xl">

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

      {/* Second Row: html-to-image Refraction */}
      <div className="flex flex-row items-start justify-center w-full gap-4 mt-12">
        <div className="flex flex-col items-center w-full">
          <div className="w-full h-[280px]">
            <CubeHtmlToImageRefraction
              ref={domRef}
              className="w-full h-full"
              dispersion={domProps.dispersion}
              refractionStrength={domProps.refractionStrength}
              viewScale={domProps.viewScale}
              glassOpacity={domProps.glassOpacity}
              size={domProps.size}
            >
              <h1 className="text-white text-6xl md:text-8xl font-bold tracking-widest uppercase" style={{ textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                {htmlText}
              </h1>
            </CubeHtmlToImageRefraction>
          </div>
          <span className="mt-3 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            html-to-image Refraction
          </span>
          <DebugPanel sliders={CUBE_SLIDERS} values={domProps} onChange={patchDom} isResetting={isDomResetting}>
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-[10px] font-subtitle font-medium tracking-[0.12em] uppercase text-gray-500">
                Text content
              </span>
              <input
                type="text"
                value={htmlText}
                onChange={(e) => setHtmlText(e.target.value)}
                className="w-full bg-transparent border-b border-gray-600 text-sm font-mono text-gray-300 py-1 focus:outline-none focus:border-gray-400"
              />
            </div>
            
            {/* DOM Reset Button */}
            <div className="flex justify-center mt-3 pt-4 border-t border-gray-800">
              <button
                onClick={handleDomReset}
                title="Reset DOM refraction"
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
                      transform:  domSpinning ? "rotate(-360deg)" : "rotate(0deg)",
                      transition: domSpinning ? "transform 0.65s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease, filter 0.2s ease" : "transform 0.2s ease, opacity 0.2s ease, filter 0.2s ease",
                    }}
                  />
                </div>
                <span className="text-[9px] font-subtitle font-medium tracking-[0.14em] uppercase text-gray-600 group-hover:text-gray-400 transition-colors">
                  Reset
                </span>
              </button>
            </div>
          </DebugPanel>
        </div>
        {/* LoadingAnimation3D GLB component */}
        <div className="flex flex-col items-center w-full">
          <div className="w-full h-[280px]">
            <LoadingAnimation3D
              ref={glbRef}
              className="w-full h-full"
              playbackSpeed={glbProps.playbackSpeed}
              modelScale={glbProps.modelScale}
              targetFps={glbProps.targetFps}
              orthoBlend={glbProps.orthoBlend}
              materialType={glbProps.materialType}
              isPaused={isGlbPaused}
            />
          </div>
          <span className="mt-3 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            Animated GLB Model
          </span>
          <DebugPanel sliders={GLB_SLIDERS} selects={GLB_SELECTS} values={glbProps} onChange={patchGlb} isResetting={isGlbResetting}>
            {/* GLB Reset & Play Buttons */}
            <div className="flex justify-center gap-6 mt-3 pt-4 border-t border-gray-800">
              <button
                onClick={() => setIsGlbPaused(!isGlbPaused)}
                title={isGlbPaused ? "Play" : "Pause"}
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
                    src={isGlbPaused ? "/icons/buttons/play.svg" : "/icons/buttons/pause.svg"}
                    alt={isGlbPaused ? "Play" : "Pause"}
                    className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-all invert"
                  />
                </div>
                <span className="text-[9px] font-subtitle font-medium tracking-[0.14em] uppercase text-gray-600 group-hover:text-gray-400 transition-colors">
                  {isGlbPaused ? "Play" : "Pause"}
                </span>
              </button>
              <button
                onClick={handleGlbReset}
                title="Reset GLB Model"
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
                      transform:  glbSpinning ? "rotate(-360deg)" : "rotate(0deg)",
                      transition: glbSpinning ? "transform 0.65s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease, filter 0.2s ease" : "transform 0.2s ease, opacity 0.2s ease, filter 0.2s ease",
                    }}
                  />
                </div>
                <span className="text-[9px] font-subtitle font-medium tracking-[0.14em] uppercase text-gray-600 group-hover:text-gray-400 transition-colors">
                  Reset
                </span>
              </button>
            </div>
          </DebugPanel>
        </div>

        {/* Pre-rendered Loading Animation Component */}
        <div className="flex flex-col items-center w-full">
          <div className="w-full h-[280px] flex items-center justify-center">
            <LoadingAnimation 
              className="w-32 h-32 md:w-48 md:h-48"
              playbackSpeed={preRenderedProps.playbackSpeed}
              isPaused={isPreRenderedPaused}
            />
          </div>
          <span className="mt-3 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            Pre-rendered Reference
          </span>
          <DebugPanel sliders={PRE_RENDERED_SLIDERS} values={preRenderedProps} onChange={patchPreRendered}>
            <div className="flex justify-center mt-3 pt-4 border-t border-gray-800">
              <button
                onClick={() => setIsPreRenderedPaused(!isPreRenderedPaused)}
                title={isPreRenderedPaused ? "Play" : "Pause"}
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
                    src={isPreRenderedPaused ? "/icons/buttons/play.svg" : "/icons/buttons/pause.svg"}
                    alt={isPreRenderedPaused ? "Play" : "Pause"}
                    className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-all invert"
                  />
                </div>
                <span className="text-[9px] font-subtitle font-medium tracking-[0.14em] uppercase text-gray-600 group-hover:text-gray-400 transition-colors">
                  {isPreRenderedPaused ? "Play" : "Pause"}
                </span>
              </button>
            </div>
          </DebugPanel>
        </div>

        {/* Placeholder for spacing to match the top row */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-10 opacity-0 pointer-events-none" />
      </div>

    </div>
  );
}
