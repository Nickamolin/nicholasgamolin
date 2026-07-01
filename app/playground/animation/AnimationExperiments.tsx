"use client";

import React, { useRef, useEffect } from "react";
import LoadingAnimation3D, { LoadingAnimation3DHandle } from "./_components/3D/LoadingAnimation3D";
import PreRenderedAnimation, { PreRenderedAnimationHandle } from "./_components/PreRenderedAnimation";
import { useState } from "react";
import { DebugPanel, fmt2, makeDefaults, makeSelectDefaults, SelectDef, SliderDef } from "../_components/DebugPanel";
import { ResetButton } from "../_components/ResetButton";
import { PlayPauseButton } from "../_components/PlayPauseButton";
import { useAnimatedReset } from "../_components/useAnimatedReset";

// ─── Slider / select configs ─────────────────────────────────────────────────

const GLB_SLIDERS: SliderDef[] = [
  { label: "Framerate",   key: "targetFps",     min: 12,  max: 60,  step: 1,    defaultValue: 60,  format: (v) => v >= 60 ? "SMOOTH" : v.toFixed(0) },
  { label: "Speed",       key: "playbackSpeed", min: 0,   max: 2,   step: 0.1,  defaultValue: 1.0, format: fmt2 },
  { label: "Scale",       key: "modelScale",    min: 0.5, max: 2.0, step: 0.05, defaultValue: 1.0, format: fmt2 },
  { label: "Ortho Blend", key: "orthoBlend",    min: 0,   max: 1,   step: 0.01, defaultValue: 1.0, format: fmt2 },
];

const GLB_SELECTS: SelectDef[] = [
  {
    label: "Material",
    key: "materialType",
    defaultValue: "default",
    options: [
      { value: "default",   label: "Default"    },
      { value: "wireframe", label: "Wireframe"  },
      { value: "normal",    label: "Normal Map" },
    ],
  },
];

const PRE_RENDERED_SLIDERS: SliderDef[] = [
  { label: "Speed", key: "playbackSpeed", min: 0.1, max: 2.0, step: 0.1, defaultValue: 1.0, format: fmt2 },
];

const GLB_DEFAULTS          = { ...makeDefaults(GLB_SLIDERS), ...makeSelectDefaults(GLB_SELECTS) };
const PRE_RENDERED_DEFAULTS = makeDefaults(PRE_RENDERED_SLIDERS);

// ─── AnimationExperiments ─────────────────────────────────────────────────────

export default function AnimationExperiments() {
  const glbRef = useRef<LoadingAnimation3DHandle>(null);
  const preRenderedRef = useRef<PreRenderedAnimationHandle>(null);

  const glb         = useAnimatedReset(GLB_DEFAULTS);
  const preRendered = useAnimatedReset(PRE_RENDERED_DEFAULTS);

  const [isGlbPaused,         setIsGlbPaused]         = useState(false);
  const [isPreRenderedPaused, setIsPreRenderedPaused] = useState(false);
  const [isSynced,            setIsSynced]            = useState(true);

  // The GLB needs an async fetch + parse before it can play, while the video
  // starts almost instantly — without a shared gate the two begin playing at
  // different moments and drift out of phase for the rest of the loop. Hold
  // both frozen on frame one until they're both ready, then start together.
  const [isGlbReady,   setIsGlbReady]   = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const bothReady = isGlbReady && isVideoReady;

  const handleGlbReset = () => {
    glbRef.current?.resetRotation();
    glb.triggerReset();
  };

  // Once both animations are confirmed ready and running, slave the GLB mixer
  // to the video's currentTime on every rAF frame (master-clock mode).
  //
  // Delta-based accumulation is the root cause of always-on drift: rAF deltas
  // are floating-point and jitter frame-to-frame; tiny errors compound over
  // thousands of frames into visible phase offset. Slaving to the video's
  // currentTime means both animations share one clock — the browser's native
  // media pipeline — so they can never diverge, regardless of tab switches,
  // app focus changes, or display refresh rate.
  useEffect(() => {
    if (!bothReady || !isSynced) {
      glbRef.current?.setMasterTimeGetter(null);
      return;
    }
    glbRef.current?.setMasterTimeGetter(
      () => preRenderedRef.current?.getCurrentTime() ?? null
    );
    return () => { glbRef.current?.setMasterTimeGetter(null); };
  }, [bothReady, isSynced]);

  // Keep the two animations locked together across focus/visibility changes.
  //
  // Two separate event sources need separate handlers — combining them into one
  // callback with a single isActive check causes a tab-switch bug:
  //
  //   visibilitychange (tab switch): When switching BACK to the tab, this fires
  //   with document.hidden = false, but document.hasFocus() may not yet reflect
  //   the tab's focus state at that exact moment (focus hasn't transferred yet).
  //   Combined check → isActive = false → animations stay frozen even though
  //   the tab is visible. They never thaw because window.focus may not fire.
  //
  //   focus / blur (app switch): These fire when the OS-level Chrome window
  //   gains or loses focus (e.g. ⌘+Tab to another app). The tab stays visible
  //   so visibilitychange never fires, but Chrome throttles rAF via App Nap
  //   while the muted video keeps playing natively — they drift.
  //
  // Fix: handle each source independently. visibilitychange drives freeze/thaw
  // purely from document.hidden (no hasFocus check). focus/blur drive the same
  // only when the tab is already visible (so they handle app switches only).
  useEffect(() => {
    const freeze = () => {
      glbRef.current?.setFrozen(true);
      preRenderedRef.current?.setFrozen(true);
    };
    const thaw = () => {
      glbRef.current?.setFrozen(false);
      preRenderedRef.current?.setFrozen(false);
      // One rAF after thaw, re-align the GLB to the video's currentTime.
      //
      // This self-corrects any drift that accumulated while inactive — whether
      // from video.pause() failing silently (race with a pending play() promise),
      // from the browser keeping the video playing in a hidden tab, or from the
      // async media-pipeline start delay introducing a small offset per switch.
      //
      // The GLB's justThawedRef holds its clock on frame 0, so by the time this
      // callback fires (frame 1), the video has its true resumed currentTime and
      // the mixer can be snapped to match without a visible discontinuity.
      requestAnimationFrame(() => {
        const videoTime = preRenderedRef.current?.getCurrentTime();
        if (videoTime != null) glbRef.current?.syncMixerToTime(videoTime);
      });
    };


    // Tab switch: visibilitychange is the authoritative signal.
    // Do NOT gate on hasFocus() — it may not have updated yet when this fires.
    const onVisibility = () => (document.hidden ? freeze() : thaw());

    // App switch: only act when the tab is already visible, so this never
    // conflicts with onVisibility (tab switches don't fire focus/blur).
    const onFocus = () => { if (!document.hidden) thaw(); };
    const onBlur  = () => { if (!document.hidden) freeze(); };

    // Apply current state immediately on mount
    if (document.hidden || !document.hasFocus()) freeze(); else thaw();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-5xl">
      <div className="flex flex-row items-start justify-center w-full gap-4">

        {/* Animated GLB Model */}
        <div className="flex flex-col items-center w-full">
          <div className="w-full h-[280px]">
            <LoadingAnimation3D
              ref={glbRef}
              className="w-full h-full"
              playbackSpeed={glb.props.playbackSpeed}
              modelScale={glb.props.modelScale}
              targetFps={glb.props.targetFps}
              orthoBlend={glb.props.orthoBlend}
              materialType={glb.props.materialType}
              isPaused={isGlbPaused}
              hasStarted={bothReady}
              onReady={() => setIsGlbReady(true)}
            />
          </div>
          <span className="mt-3 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            Animated GLB Model
          </span>
          <DebugPanel sliders={GLB_SLIDERS} selects={GLB_SELECTS} values={glb.props} onChange={glb.patch} isResetting={glb.isResetting}>
            <div className="flex justify-center gap-6 mt-3 pt-4 border-t border-gray-800">
              <PlayPauseButton isPaused={isGlbPaused} onToggle={() => setIsGlbPaused((p) => !p)} />
              <ResetButton onClick={handleGlbReset} spinning={glb.spinning} />
            </div>
          </DebugPanel>
        </div>

        {/* Sync Toggle — centered between the two demos */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-10" style={{ height: "280px" }}>
          <button
            onClick={() => setIsSynced((s) => !s)}
            title={isSynced ? "Sync On" : "Sync Off"}
            className="group flex flex-col items-center gap-2 cursor-pointer"
            style={{ background: "none", border: "none", padding: 0 }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <img
                src={isSynced ? "/icons/buttons/equal.svg" : "/icons/buttons/equal_not.svg"}
                alt={isSynced ? "Sync On" : "Sync Off"}
                className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-all invert"
              />
            </div>
            <span className="text-[9px] font-subtitle font-medium tracking-[0.14em] uppercase text-gray-600 group-hover:text-gray-400 transition-colors whitespace-nowrap">
              {isSynced ? "Sync On" : "Sync Off"}
            </span>
          </button>
        </div>

        {/* Pre-rendered Loading Animation */}
        <div className="flex flex-col items-center w-full">
          <div className="w-full h-[280px] flex items-center justify-center">
            <PreRenderedAnimation
              ref={preRenderedRef}
              className="w-32 h-32 md:w-48 md:h-48"
              playbackSpeed={preRendered.props.playbackSpeed}
              isPaused={isPreRenderedPaused}
              hasStarted={bothReady}
              onReady={() => setIsVideoReady(true)}
            />
          </div>
          <span className="mt-3 text-xs font-subtitle font-medium tracking-[0.18em] uppercase text-gray-400">
            Pre-rendered Reference
          </span>
          <DebugPanel sliders={PRE_RENDERED_SLIDERS} values={preRendered.props} onChange={preRendered.patch}>
            <div className="flex justify-center mt-3 pt-4 border-t border-gray-800">
              <PlayPauseButton isPaused={isPreRenderedPaused} onToggle={() => setIsPreRenderedPaused((p) => !p)} />
            </div>
          </DebugPanel>
        </div>

        {/* Spacer to match refraction page alignment */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-10 opacity-0 pointer-events-none" style={{ height: "280px" }} />

      </div>
    </div>
  );
}
