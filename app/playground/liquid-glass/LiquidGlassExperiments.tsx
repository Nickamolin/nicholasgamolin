"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import LiquidGlass, { generateDisplacementMap } from "./_components/LiquidGlass";
import { DebugPanel, fmt1, fmt2, makeDefaults, SliderDef } from "../_components/DebugPanel";
import { ResetButton } from "../_components/ResetButton";
import { useAnimatedReset } from "../_components/useAnimatedReset";

// ─── Draggable displacement-map preview ───────────────────────────────────────

interface MapPreviewProps {
  lensWidth: number;
  lensHeight: number;
  borderRadius: number;
  depth: number;
  curvature: number;
  splay: number;
  glow: number;
  edgeHighlight: number;
  specularAngle: number;
  lensX: number;
  lensY: number;
  renderScale?: number;
  onLensMove: (x: number, y: number) => void;
}

function MapPreview({
  lensWidth, lensHeight, borderRadius, depth, curvature, splay, glow, edgeHighlight, specularAngle, lensX, lensY, renderScale = 1, onLensMove,
}: MapPreviewProps) {
  const rw = lensWidth * renderScale;
  const rh = lensHeight * renderScale;
  const [mapUrl, setMapUrl] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const start = useRef({ mx: 0, my: 0, lx: 0, ly: 0 });

  useEffect(() => {
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
    const { previewUrl } = generateDisplacementMap(rw, rh, borderRadius, depth, curvature, splay, glow, edgeHighlight, specularAngle, dpr);
    setMapUrl(previewUrl);
  }, [rw, rh, borderRadius, depth, curvature, splay, glow, edgeHighlight, specularAngle]);

  const onDown = (e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    start.current = { mx: e.clientX, my: e.clientY, lx: lensX, ly: lensY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current || !boxRef.current) return;
    const r = boxRef.current.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, start.current.lx + (e.clientX - start.current.mx) / r.width));
    const ny = Math.max(0, Math.min(1, start.current.ly + (e.clientY - start.current.my) / r.height));
    onLensMove(nx, ny);
  };
  const onUp = () => { dragging.current = false; };

  return (
    <div
      ref={boxRef}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      className="w-full h-full rounded-[24px] overflow-hidden bg-[#808080] relative"
    >
      {mapUrl && (
        <img
          src={mapUrl}
          alt="Displacement map"
          draggable={false}
          onPointerDown={onDown}
          style={{
            position: "absolute",
            width: rw,
            height: rh,
            left: `calc(${lensX * 100}% - ${rw / 2}px)`,
            top: `calc(${lensY * 100}% - ${rh / 2}px)`,
            cursor: "grab",
            touchAction: "none",
          }}
        />
      )}
    </div>
  );
}

// ─── Constants ───────────────────────────────────────────────────────────────

const IMAGE = "https://zvajkoxglyawliuigirq.supabase.co/storage/v1/object/public/art/watcher.PNG";

// ─── Slider configs ───────────────────────────────────────────────────────────

const GLASS_SLIDERS: SliderDef[] = [
  { label: "Width", key: "lensWidth", min: 20, max: 120, step: 1, defaultValue: 70, format: fmt1 },
  { label: "Height", key: "lensHeight", min: 20, max: 80, step: 1, defaultValue: 60, format: fmt1 },
  { label: "BorderRadius", key: "borderRadius", min: 0, max: 64, step: 1, defaultValue: 28, format: fmt1 },
  { label: "Scale", key: "scale", min: 0.0, max: 0.2, step: 0.005, defaultValue: 0.1, format: (v) => v.toFixed(3) },
  { label: "Depth", key: "depth", min: 5, max: 60, step: 1, defaultValue: 10, format: fmt1 },
  { label: "Curvature", key: "curvature", min: 0, max: 80, step: 1, defaultValue: 40, format: fmt1 },
  { label: "Splay", key: "splay", min: 0.0, max: 1.0, step: 0.05, defaultValue: 1.0, format: fmt2 },
  { label: "Chroma", key: "chroma", min: 0.0, max: 1.0, step: 0.01, defaultValue: 0.2, format: fmt2 },
  { label: "Blur", key: "blur", min: 0.0, max: 8.0, step: 0.5, defaultValue: 0.0, format: fmt1 },
  { label: "Glow", key: "glow", min: 0.0, max: 1.0, step: 0.01, defaultValue: 0.1, format: fmt2 },
  { label: "Edge Highlight", key: "edgeHighlight", min: 0.0, max: 1.0, step: 0.01, defaultValue: 0.25, format: fmt2 },
  { label: "Specular Angle", key: "specularAngle", min: 0, max: 180, step: 1, defaultValue: 45, format: fmt1 },
];

const GLASS_DEFAULTS = makeDefaults(GLASS_SLIDERS);

// How far the right-margin reset buttons sit outside the content area.
// This mirrors the sidebar position on the left: sidebar is at left: --spacing-page-x
// and is 9rem wide; the reset button sits ~halfway into the symmetric right margin.
const MARGIN_RIGHT = "-6rem";

// ─── LiquidGlassExperiments ──────────────────────────────────────────────────

const SBS_RENDER_SCALE = 2;

export default function LiquidGlassExperiments() {
  const sbs = useAnimatedReset({ ...GLASS_DEFAULTS, lensX: 0.5, lensY: 0.5 });
  const [mobileMapUrl, setMobileMapUrl] = useState("");

  useEffect(() => {
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
    const rw = sbs.props.lensWidth * SBS_RENDER_SCALE;
    const rh = sbs.props.lensHeight * SBS_RENDER_SCALE;
    const { previewUrl } = generateDisplacementMap(
      rw, rh, sbs.props.borderRadius, sbs.props.depth, sbs.props.curvature,
      sbs.props.splay, sbs.props.glow, sbs.props.edgeHighlight, sbs.props.specularAngle, dpr
    );
    setMobileMapUrl(previewUrl);
  }, [sbs.props.lensWidth, sbs.props.lensHeight, sbs.props.borderRadius, sbs.props.depth,
      sbs.props.curvature, sbs.props.splay, sbs.props.glow, sbs.props.edgeHighlight, sbs.props.specularAngle]);
  const moveSbsLens = (x: number, y: number) => {
    sbs.patch("lensX", x);
    sbs.patch("lensY", y);
  };

  // Base lens dims are kept within the slider constraints (width ≤120, height ≤80)
  // and scaled up at render time via renderScale — same pattern as the side-by-side
  // demo above. borderRadius is NOT scaled and the map is generated from
  // lensWidth×renderScale, so the rendered result is identical to the old literal sizes.
  const imageExp = useAnimatedReset({ ...GLASS_DEFAULTS, lensWidth: 60, lensHeight: 68, borderRadius: 40, scale: 0.12, lensX: 0.5, lensY: 0.5 }); // ×2.5 → 150×170
  const textExp = useAnimatedReset({ ...GLASS_DEFAULTS, lensWidth: 92, lensHeight: 52, borderRadius: 40, scale: 0.07, chroma: 0.15, blur: 0, lensX: 0.5, lensY: 0.5 }); // ×2.5 → 230×130
  const cardExp = useAnimatedReset({ ...GLASS_DEFAULTS, lensWidth: 60, lensHeight: 70, borderRadius: 32, scale: 0.12, lensX: 0.5, lensY: 0.5 }); // ×3 → 180×210

  const [htmlText, setHtmlText] = useState("GLASS");

  // Animated balance counter for the UI refraction card
  const [displayBalance, setDisplayBalance] = useState(12450);
  const balanceRef = useRef(12450);
  const animFrameRef = useRef(0);
  const balanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const animateTo = (target: number) => {
      const from = balanceRef.current;
      const start = performance.now();
      const duration = 1800;
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        setDisplayBalance(Math.round(from + (target - from) * eased));
        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(tick);
        } else {
          balanceRef.current = target;
          balanceTimerRef.current = setTimeout(() => {
            animateTo(Math.round(Math.random() * 4000 + 10000));
          }, 3500);
        }
      };
      animFrameRef.current = requestAnimationFrame(tick);
    };
    balanceTimerRef.current = setTimeout(() => {
      animateTo(Math.round(Math.random() * 4000 + 10000));
    }, 2500);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (balanceTimerRef.current) clearTimeout(balanceTimerRef.current);
    };
  }, []);

  // Row-level reset for the three demos
  const [demosSpinning, setDemosSpinning] = useState(false);
  const handleDemosReset = useCallback(() => {
    setDemosSpinning(true);
    imageExp.triggerReset();
    textExp.triggerReset();
    cardExp.triggerReset(() => setDemosSpinning(false));
  }, [imageExp, textExp, cardExp]);

  return (
    <div className="flex flex-col items-center w-full max-w-6xl gap-16 pb-16">
      <style>{`
        @keyframes lgBarUp   { 0%,100% { transform: scaleY(0.5) } 50% { transform: scaleY(1) } }
        @keyframes lgBarDown { 0%,100% { transform: scaleY(1)   } 50% { transform: scaleY(0.4) } }
      `}</style>

      {/* ── Side-by-Side Demo ────────────────────────────────────────────────── */}
      {/* Wrapper is full-width + position:relative so the right-margin button   */}
      {/* can be placed via position:absolute without disturbing the layout.      */}
      <div className="relative w-full flex flex-col items-center">

        {/* Mobile: combined split view */}
        <div className="md:hidden w-full max-w-4xl h-[360px] rounded-[24px] overflow-hidden border border-gray-100 dark:border-gray-800 relative">
          {/* Glass layer — full container, grid background */}
          <LiquidGlass
            className="w-full h-full"
            {...sbs.props}
            renderScale={SBS_RENDER_SCALE}
            onLensMove={moveSbsLens}
          >
            <div
              className="absolute inset-0 bg-[#f4f0ff] dark:bg-gray-950"
              style={{
                backgroundImage: "linear-gradient(to right, rgba(100,100,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,100,255,0.18) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
          </LiquidGlass>

          {/* Gray overlay — sits above the glass, left edge tracks lens center */}
          <div
            className="absolute inset-y-0 right-0 bg-[#808080] pointer-events-none"
            style={{ left: `${sbs.props.lensX * 100}%` }}
          />

          {/* Displacement map — above the gray overlay, positioned relative to outer container.
              clipPath hides the left half so only the right half (on the gray side) shows. */}
          {mobileMapUrl && (
            <img
              src={mobileMapUrl}
              alt="Displacement map"
              draggable={false}
              className="pointer-events-none absolute"
              style={{
                width: sbs.props.lensWidth * SBS_RENDER_SCALE,
                height: sbs.props.lensHeight * SBS_RENDER_SCALE,
                left: `calc(${sbs.props.lensX * 100}% - ${(sbs.props.lensWidth * SBS_RENDER_SCALE) / 2}px)`,
                top: `calc(${sbs.props.lensY * 100}% - ${(sbs.props.lensHeight * SBS_RENDER_SCALE) / 2}px)`,
                clipPath: "inset(0 0 0 50%)",
              }}
            />
          )}
        </div>

        {/* Desktop: two separate panels side by side */}
        <div className="hidden md:flex w-full max-w-4xl gap-8">
          <div className="flex-1">
            <div className="w-full h-[360px] rounded-[24px] overflow-hidden border border-gray-100 dark:border-gray-800 bg-[#f4f0ff] dark:bg-gray-950 relative">
              <LiquidGlass
                className="w-full h-full"
                {...sbs.props}
                renderScale={SBS_RENDER_SCALE}
                onLensMove={moveSbsLens}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "linear-gradient(to right, rgba(100,100,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,100,255,0.18) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
              </LiquidGlass>
            </div>
          </div>

          <div className="flex-1">
            <div className="w-full h-[360px]">
              <MapPreview
                lensWidth={sbs.props.lensWidth}
                lensHeight={sbs.props.lensHeight}
                borderRadius={sbs.props.borderRadius}
                depth={sbs.props.depth}
                curvature={sbs.props.curvature}
                splay={sbs.props.splay}
                glow={sbs.props.glow}
                edgeHighlight={sbs.props.edgeHighlight}
                specularAngle={sbs.props.specularAngle}
                lensX={sbs.props.lensX}
                lensY={sbs.props.lensY}
                renderScale={SBS_RENDER_SCALE}
                onLensMove={moveSbsLens}
              />
            </div>
          </div>
        </div>

        {/* Description + unified 2-column controls */}
        <div className="w-full max-w-4xl">
          <div className="mt-5 mb-4 text-sm text-gray-500 text-center max-w-xl mx-auto space-y-1">
            <p>On the left is the refracted result, on the right the map that drives it.</p>
            <p>
              <span className="font-bold text-red-400">Red</span> and{" "}
              <span className="font-bold text-green-400">green</span> encode per-pixel displacement — how far each pixel bends horizontally and vertically. A neutral 50% grey means no bend.{" "}
              <span className="font-bold text-blue-400">Blue</span> is a specular shine field that a second filter pass lifts it into a rim highlight.
            </p>
          </div>
          <DebugPanel
            sliders={GLASS_SLIDERS}
            values={sbs.props}
            onChange={sbs.patch}
            isResetting={sbs.isResetting}
            columns={2}
          >
            <div className="flex lg:hidden justify-center mt-3 pt-4 border-t border-gray-800">
              <ResetButton onClick={() => sbs.triggerReset()} spinning={sbs.spinning} />
            </div>
          </DebugPanel>
        </div>

        {/* Reset centred in right margin on lg+ */}
        <div
          className="hidden lg:flex flex-col items-center justify-center"
          style={{ position: "absolute", left: "calc(50% + min(100%, 56rem) / 4 + 25vw)", top: "180px", transform: "translateX(-50%) translateY(-50%)" }}
        >
          <ResetButton onClick={() => sbs.triggerReset()} spinning={sbs.spinning} />
        </div>
      </div>

      <div className="w-full h-px bg-gray-200 dark:bg-gray-800" />

      {/* ── Three Demos ──────────────────────────────────────────────────────── */}
      <div className="relative w-full flex flex-col md:flex-row items-center md:items-start justify-center gap-8">

        {/* 1. Image Refraction */}
        <div className="flex flex-col items-center w-full max-w-lg md:max-w-sm">
          <div className="w-full h-[320px] rounded-xl overflow-hidden border border-gray-800 bg-gray-950">
            <LiquidGlass
              className="w-full h-full"
              {...imageExp.props}
              renderScale={2.5}
              onLensMove={(x, y) => { imageExp.patch("lensX", x); imageExp.patch("lensY", y); }}
            >
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${IMAGE})` }} />
            </LiquidGlass>
          </div>
          <span className="mt-4 mb-2 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            Image Refraction
          </span>
          <p className="text-sm text-gray-500 text-center mb-4 max-w-xs">
            Drag the lens over the image. The displacement map creates a classic refraction effect.
          </p>
          <DebugPanel
            sliders={GLASS_SLIDERS}
            values={imageExp.props}
            onChange={imageExp.patch}
            isResetting={imageExp.isResetting}
          >
            <div className="flex justify-center mt-3 pt-4 border-t border-gray-800">
              <ResetButton onClick={() => imageExp.triggerReset()} spinning={imageExp.spinning} />
            </div>
          </DebugPanel>
        </div>

        {/* 2. Text Refraction */}
        <div className="flex flex-col items-center w-full max-w-lg md:max-w-sm">
          <div className="w-full h-[320px] rounded-xl overflow-hidden border border-gray-800 bg-gray-950 flex items-center justify-center relative">
            <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <LiquidGlass
              className="w-full h-full"
              {...textExp.props}
              renderScale={2.5}
              onLensMove={(x, y) => { textExp.patch("lensX", x); textExp.patch("lensY", y); }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <h1
                  className="text-white text-6xl font-bold tracking-widest uppercase text-center w-full"
                  style={{ textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
                >
                  {htmlText}
                </h1>
              </div>
            </LiquidGlass>
          </div>
          <span className="mt-4 mb-2 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            Live HTML Refraction
          </span>
          <p className="text-sm text-gray-500 text-center mb-4 max-w-xs">
            The SVG filter bends live DOM text without rasterization. The text remains fully selectable.
          </p>
          <DebugPanel
            sliders={GLASS_SLIDERS}
            values={textExp.props}
            onChange={textExp.patch}
            isResetting={textExp.isResetting}
          >
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
            <div className="flex justify-center mt-3 pt-4 border-t border-gray-800">
              <ResetButton onClick={() => textExp.triggerReset()} spinning={textExp.spinning} />
            </div>
          </DebugPanel>
        </div>

        {/* 3. UI Component Refraction */}
        <div className="flex flex-col items-center w-full max-w-lg md:max-w-sm">
          <div className="w-full h-[320px] rounded-xl overflow-hidden border border-gray-800 bg-gray-950 flex items-center justify-center relative">
            <LiquidGlass
              className="w-full h-full"
              {...cardExp.props}
              renderScale={3}
              onLensMove={(x, y) => { cardExp.patch("lensX", x); cardExp.patch("lensY", y); }}
            >
              <div className="absolute inset-x-8 inset-y-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-5 flex flex-col justify-between shadow-2xl overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md" />
                  <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium text-white">Pro</div>
                </div>
                {/* Animated sparkline — demonstrates live DOM refraction */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 36 }}>
                  {(["U","D","U","D","U","D","U"] as const).map((dir, i) => (
                    <div key={i} style={{
                      flex: 1,
                      height: "100%",
                      background: "rgba(255,255,255,0.4)",
                      borderRadius: "2px 2px 0 0",
                      transformOrigin: "bottom",
                      animation: `${dir === "U" ? "lgBarUp" : "lgBarDown"} 2.8s ease-in-out infinite`,
                      animationDelay: `${i * 0.22}s`,
                    }} />
                  ))}
                </div>
                <div className="min-w-0">
                  <div className="text-white/80 font-mono text-xs mb-1">BALANCE</div>
                  <div className="text-white font-bold text-2xl font-mono tracking-tight whitespace-nowrap truncate">${displayBalance.toLocaleString("en-US")}.00</div>
                </div>
              </div>
            </LiquidGlass>
          </div>
          <span className="mt-4 mb-2 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            UI Refraction
          </span>
          <p className="text-sm text-gray-500 text-center mb-4 max-w-xs">
Animated elements demonstrate real-time refraction on CSS gradients.
          </p>
          <DebugPanel
            sliders={GLASS_SLIDERS}
            values={cardExp.props}
            onChange={cardExp.patch}
            isResetting={cardExp.isResetting}
          >
            <div className="flex justify-center mt-3 pt-4 border-t border-gray-800">
              <ResetButton onClick={() => cardExp.triggerReset()} spinning={cardExp.spinning} />
            </div>
          </DebugPanel>
        </div>

        {/* Shared reset — centred in right margin on lg+ */}
        <div
          className="hidden lg:flex flex-col items-center justify-center"
          style={{ position: "absolute", left: "calc(100% + (100vw - 100%) / 4)", top: "160px", transform: "translateX(-50%) translateY(-50%)" }}
        >
          <ResetButton onClick={handleDemosReset} spinning={demosSpinning} />
        </div>
      </div>

    </div>
  );
}
