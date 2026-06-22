"use client";

import React, { useRef } from "react";
import Cube, { CubeHandle } from "./_components/Cube/Cube";
import CubeClassic, { CubeClassicHandle } from "./_components/Cube/CubeClassic";
import CubePlain, { CubePlainHandle } from "./_components/Cube/CubePlain";
import CubeHtmlToImageRefraction from "./_components/Cube/CubeHtmlToImageRefraction";
import { useState } from "react";
import { DebugPanel, fmt1, fmt2, makeDefaults, SliderDef } from "../_components/DebugPanel";
import { ResetButton } from "../_components/ResetButton";
import { useAnimatedReset } from "../_components/useAnimatedReset";

// ─── Image ───────────────────────────────────────────────────────────────────

const IMAGE = "https://zvajkoxglyawliuigirq.supabase.co/storage/v1/object/public/art/watcher.PNG";

// ─── Slider configs ───────────────────────────────────────────────────────────

const CUBE_SLIDERS: SliderDef[] = [
  { label: "Dispersion", key: "dispersion",         min: 0,   max: 0.20, step: 0.005, defaultValue: 0.04, format: fmt2 },
  { label: "Refraction", key: "refractionStrength", min: 0,   max: 0.5,  step: 0.01,  defaultValue: 0.18, format: fmt2 },
  { label: "View Scale", key: "viewScale",           min: 0.5, max: 2.0,  step: 0.05,  defaultValue: 1.05, format: fmt2 },
  { label: "Opacity",    key: "glassOpacity",        min: 0,   max: 0.5,  step: 0.01,  defaultValue: 0.1,  format: fmt2 },
  { label: "Size",       key: "size",                min: 0.5, max: 3.0,  step: 0.1,   defaultValue: 1.5,  format: fmt1 },
];

const CLASSIC_SLIDERS: SliderDef[] = [
  { label: "IOR",         key: "ior",         min: 1.0, max: 2.5,  step: 0.01,  defaultValue: 1.6,  format: fmt2 },
  { label: "Dispersion",  key: "dispersion",  min: 0,   max: 0.20, step: 0.005, defaultValue: 0.04, format: fmt2 },
  { label: "Opacity",     key: "glassOpacity",min: 0,   max: 0.5,  step: 0.01,  defaultValue: 0.12, format: fmt2 },
  { label: "Depth Offset",key: "depthOffset", min: 0.1, max: 2.0,  step: 0.05,  defaultValue: 0.5,  format: fmt2 },
  { label: "Image Scale", key: "imageScale",  min: 0.5, max: 2.0,  step: 0.05,  defaultValue: 1.0,  format: fmt2 },
  { label: "Size",        key: "size",        min: 0.5, max: 3.0,  step: 0.1,   defaultValue: 1.5,  format: fmt1 },
];

const PLAIN_SLIDERS: SliderDef[] = [
  { label: "View Scale", key: "viewScale", min: 0.5, max: 2.0, step: 0.05, defaultValue: 0.95, format: fmt2 },
  { label: "Size",       key: "size",      min: 0.5, max: 3.0, step: 0.1,  defaultValue: 1.5,  format: fmt1 },
];

const CUBE_DEFAULTS    = makeDefaults(CUBE_SLIDERS);
const CLASSIC_DEFAULTS = makeDefaults(CLASSIC_SLIDERS);
const PLAIN_DEFAULTS   = makeDefaults(PLAIN_SLIDERS);

// ─── RefractionExperiments ───────────────────────────────────────────────────

export default function RefractionExperiments() {
  const cubeRef    = useRef<CubeHandle>(null);
  const classicRef = useRef<CubeClassicHandle>(null);
  const plainRef   = useRef<CubePlainHandle>(null);
  const domRef     = useRef<CubeHandle>(null);

  // Each experiment card gets its own animated reset state
  const cube    = useAnimatedReset(CUBE_DEFAULTS);
  const classic = useAnimatedReset(CLASSIC_DEFAULTS);
  const plain   = useAnimatedReset(PLAIN_DEFAULTS);
  const dom     = useAnimatedReset(CUBE_DEFAULTS);

  const [htmlText, setHtmlText] = useState("TEXT");

  // Shared reset: resets all three comparison cubes + cameras together
  const [sharedSpinning, setSharedSpinning] = useState(false);
  const handleSharedReset = () => {
    cubeRef.current?.resetRotation();
    classicRef.current?.resetRotation();
    plainRef.current?.resetRotation();
    setSharedSpinning(true);
    cube.triggerReset();
    classic.triggerReset();
    plain.triggerReset(() => setSharedSpinning(false));
  };

  const handleDomReset = () => {
    domRef.current?.resetRotation();
    dom.triggerReset(() => setHtmlText("TEXT"));
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl">

      {/* Row 1: Comparison cubes */}
      <div className="flex flex-row items-start justify-center w-full gap-4">

        {/* Screen-space */}
        <div className="flex flex-col items-center w-full">
          <div className="w-full h-[280px]">
            <Cube
              ref={cubeRef}
              image={IMAGE}
              className="w-full h-full"
              dispersion={cube.props.dispersion}
              refractionStrength={cube.props.refractionStrength}
              viewScale={cube.props.viewScale}
              glassOpacity={cube.props.glassOpacity}
              size={cube.props.size}
            />
          </div>
          <span className="mt-3 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            Screen-space refraction
          </span>
          <DebugPanel sliders={CUBE_SLIDERS} values={cube.props} onChange={cube.patch} isResetting={cube.isResetting} />
        </div>

        {/* Virtual-plane */}
        <div className="flex flex-col items-center w-full">
          <div className="w-full h-[280px]">
            <CubeClassic
              ref={classicRef}
              image={IMAGE}
              className="w-full h-full"
              ior={classic.props.ior}
              dispersion={classic.props.dispersion}
              glassOpacity={classic.props.glassOpacity}
              depthOffset={classic.props.depthOffset}
              imageScale={classic.props.imageScale}
              size={classic.props.size}
            />
          </div>
          <span className="mt-3 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            Virtual-plane refraction
          </span>
          <DebugPanel sliders={CLASSIC_SLIDERS} values={classic.props} onChange={classic.patch} isResetting={classic.isResetting} />
        </div>

        {/* No refraction */}
        <div className="flex flex-col items-center w-full">
          <div className="w-full h-[280px]">
            <CubePlain
              ref={plainRef}
              image={IMAGE}
              className="w-full h-full"
              viewScale={plain.props.viewScale}
              size={plain.props.size}
            />
          </div>
          <span className="mt-3 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            No refraction (reference)
          </span>
          <DebugPanel sliders={PLAIN_SLIDERS} values={plain.props} onChange={plain.patch} isResetting={plain.isResetting} />
        </div>

        {/* Shared reset — vertically centred against the canvases */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center" style={{ height: "280px" }}>
          <ResetButton onClick={handleSharedReset} spinning={sharedSpinning} />
        </div>

      </div>

      {/* Row 2: html-to-image refraction — first column only */}
      <div className="flex flex-row items-start justify-center w-full gap-4 mt-12">

        {/* html-to-image — first column */}
        <div className="flex flex-col items-center w-full">
          <div className="w-full h-[280px]">
            <CubeHtmlToImageRefraction
              ref={domRef}
              className="w-full h-full"
              dispersion={dom.props.dispersion}
              refractionStrength={dom.props.refractionStrength}
              viewScale={dom.props.viewScale}
              glassOpacity={dom.props.glassOpacity}
              size={dom.props.size}
            >
              <h1
                className="text-white text-6xl md:text-8xl font-bold tracking-widest uppercase"
                style={{ textShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
              >
                {htmlText}
              </h1>
            </CubeHtmlToImageRefraction>
          </div>
          <span className="mt-3 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            html-to-image Refraction
          </span>
          <DebugPanel sliders={CUBE_SLIDERS} values={dom.props} onChange={dom.patch} isResetting={dom.isResetting}>
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
              <ResetButton onClick={handleDomReset} spinning={dom.spinning} />
            </div>
          </DebugPanel>
        </div>

        {/* Invisible placeholders to match the 3-column + reset-btn layout above */}
        <div className="w-full opacity-0 pointer-events-none" />
        <div className="w-full opacity-0 pointer-events-none" />
        <div className="flex-shrink-0 w-10 opacity-0 pointer-events-none" />

      </div>

    </div>
  );
}
