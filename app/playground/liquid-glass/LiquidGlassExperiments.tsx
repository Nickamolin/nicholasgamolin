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
  lensX: number;
  lensY: number;
  onLensMove: (x: number, y: number) => void;
}

function MapPreview({
  lensWidth, lensHeight, borderRadius, depth, curvature, splay, lensX, lensY, onLensMove,
}: MapPreviewProps) {
  const [mapUrl, setMapUrl] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const start = useRef({ mx: 0, my: 0, lx: 0, ly: 0 });

  useEffect(() => {
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
    setMapUrl(generateDisplacementMap(lensWidth, lensHeight, borderRadius, depth, curvature, splay, dpr));
  }, [lensWidth, lensHeight, borderRadius, depth, curvature, splay]);

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
            width: lensWidth,
            height: lensHeight,
            left: `calc(${lensX * 100}% - ${lensWidth / 2}px)`,
            top: `calc(${lensY * 100}% - ${lensHeight / 2}px)`,
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
  { label: "Width",          key: "lensWidth",     min: 20,  max: 280, step: 1,    defaultValue: 70,   format: fmt1 },
  { label: "Height",         key: "lensHeight",    min: 20,  max: 280, step: 1,    defaultValue: 60,   format: fmt1 },
  { label: "BorderRadius",   key: "borderRadius",  min: 0,   max: 100, step: 1,    defaultValue: 28,   format: fmt1 },
  { label: "Scale",          key: "scale",         min: 0.0, max: 0.2, step: 0.005,defaultValue: 0.1,  format: (v) => v.toFixed(3) },
  { label: "Depth",          key: "depth",         min: 1,   max: 60,  step: 1,    defaultValue: 10,   format: fmt1 },
  { label: "Curvature",      key: "curvature",     min: 0,   max: 80,  step: 1,    defaultValue: 40,   format: fmt1 },
  { label: "Splay",          key: "splay",         min: 0.0, max: 2.0, step: 0.05, defaultValue: 1.0,  format: fmt2 },
  { label: "Chroma",         key: "chroma",        min: 0.0, max: 1.0, step: 0.01, defaultValue: 0.2,  format: fmt2 },
  { label: "Blur",           key: "blur",          min: 0.0, max: 10,  step: 0.5,  defaultValue: 0.0,  format: fmt1 },
  { label: "Glow",           key: "glow",          min: 0.0, max: 0.5, step: 0.01, defaultValue: 0.1,  format: fmt2 },
  { label: "Edge Highlight", key: "edgeHighlight", min: 0.0, max: 1.0, step: 0.01, defaultValue: 0.25, format: fmt2 },
  { label: "Specular Angle", key: "specularAngle", min: 0,   max: 360, step: 1,    defaultValue: 45,   format: fmt1 },
];

const GLASS_DEFAULTS = makeDefaults(GLASS_SLIDERS);

// How far the right-margin reset buttons sit outside the content area.
// This mirrors the sidebar position on the left: sidebar is at left: --spacing-page-x
// and is 9rem wide; the reset button sits ~halfway into the symmetric right margin.
const MARGIN_RIGHT = "-6rem";

// ─── LiquidGlassExperiments ──────────────────────────────────────────────────

export default function LiquidGlassExperiments() {
  const sbs = useAnimatedReset({ ...GLASS_DEFAULTS, lensX: 0.5, lensY: 0.5 });
  const moveSbsLens = (x: number, y: number) => {
    sbs.patch("lensX", x);
    sbs.patch("lensY", y);
  };

  const imageExp = useAnimatedReset({ ...GLASS_DEFAULTS, lensWidth: 150, lensHeight: 170, borderRadius: 40, scale: 0.12, lensX: 0.5, lensY: 0.5 });
  const textExp  = useAnimatedReset({ ...GLASS_DEFAULTS, lensWidth: 230, lensHeight: 130, borderRadius: 40, scale: 0.07, chroma: 0.15, blur: 0, lensX: 0.5, lensY: 0.5 });
  const cardExp  = useAnimatedReset({ ...GLASS_DEFAULTS, lensWidth: 180, lensHeight: 210, borderRadius: 32, scale: 0.12, lensX: 0.5, lensY: 0.5 });

  const [htmlText, setHtmlText] = useState("GLASS");

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

      {/* ── Side-by-Side Demo ────────────────────────────────────────────────── */}
      {/* Wrapper is full-width + position:relative so the right-margin button   */}
      {/* can be placed via position:absolute without disturbing the layout.      */}
      <div className="relative w-full flex flex-col items-center">

        {/* Two previews */}
        <div className="flex flex-col md:flex-row w-full max-w-4xl gap-8">
          <div className="flex-1">
            <div className="w-full h-[360px] rounded-[24px] overflow-hidden border border-gray-100 dark:border-gray-800 bg-[#f4f0ff] dark:bg-gray-950 relative">
              <LiquidGlass
                className="w-full h-full"
                {...sbs.props}
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
                lensX={sbs.props.lensX}
                lensY={sbs.props.lensY}
                onLensMove={moveSbsLens}
              />
            </div>
          </div>
        </div>

        {/* Description + unified 2-column controls */}
        <div className="w-full max-w-4xl">
          <p className="mt-5 mb-1 text-sm text-gray-500 text-center max-w-lg mx-auto">
            On the left is the refracted result, on the right the map that drives it.
          </p>
          <DebugPanel
            sliders={GLASS_SLIDERS}
            values={sbs.props}
            onChange={sbs.patch}
            isResetting={sbs.isResetting}
            columns={2}
          />
        </div>

        {/* Reset in the right margin — vertically centred against the two panels */}
        <div
          className="hidden md:flex flex-col items-center justify-center"
          style={{ position: "absolute", right: MARGIN_RIGHT, top: "180px", transform: "translateY(-50%)" }}
        >
          <ResetButton onClick={() => sbs.triggerReset()} spinning={sbs.spinning} />
        </div>
      </div>

      <div className="w-full h-px bg-gray-200 dark:bg-gray-800" />

      {/* ── Three Demos ──────────────────────────────────────────────────────── */}
      <div className="relative w-full flex flex-col md:flex-row items-start justify-center gap-8">

        {/* 1. Image Refraction */}
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="w-full h-[320px] rounded-xl overflow-hidden border border-gray-800 bg-gray-950">
            <LiquidGlass
              className="w-full h-full"
              {...imageExp.props}
              onLensMove={(x, y) => { imageExp.patch("lensX", x); imageExp.patch("lensY", y); }}
            >
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${IMAGE})` }} />
            </LiquidGlass>
          </div>
          <span className="mt-4 mb-2 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            Image Refraction
          </span>
          <p className="text-xs text-gray-500 text-center mb-4 max-w-xs">
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
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="w-full h-[320px] rounded-xl overflow-hidden border border-gray-800 bg-gray-950 flex items-center justify-center relative">
            <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            <LiquidGlass
              className="w-full h-full"
              {...textExp.props}
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
          <p className="text-xs text-gray-500 text-center mb-4 max-w-xs">
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
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="w-full h-[320px] rounded-xl overflow-hidden border border-gray-800 bg-gray-950 flex items-center justify-center relative p-8">
            <LiquidGlass
              className="w-full h-full"
              {...cardExp.props}
              onLensMove={(x, y) => { cardExp.patch("lensX", x); cardExp.patch("lensY", y); }}
            >
              <div className="absolute inset-8 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 flex flex-col justify-between shadow-2xl">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md" />
                  <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium text-white">Pro</div>
                </div>
                <div>
                  <div className="text-white/80 font-mono text-xs mb-1">BALANCE</div>
                  <div className="text-white font-bold text-3xl font-mono tracking-tight">$12,450.00</div>
                </div>
              </div>
            </LiquidGlass>
          </div>
          <span className="mt-4 mb-2 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            UI Refraction
          </span>
          <p className="text-xs text-gray-500 text-center mb-4 max-w-xs">
            Refracting standard CSS gradients and rounded borders, adding tactile depth to flat UI components.
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

        {/* Row-level reset in the right margin — vertically centred against the panels */}
        <div
          className="hidden md:flex flex-col items-center justify-center"
          style={{ position: "absolute", right: MARGIN_RIGHT, top: "160px", transform: "translateY(-50%)" }}
        >
          <ResetButton onClick={handleDemosReset} spinning={demosSpinning} />
        </div>
      </div>

    </div>
  );
}
