"use client";

import React, { useRef } from "react";
import LoadingAnimation3D, { LoadingAnimation3DHandle } from "./_components/3D/LoadingAnimation3D";
import PreRenderedAnimation from "./_components/PreRenderedAnimation";
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

  const glb         = useAnimatedReset(GLB_DEFAULTS);
  const preRendered = useAnimatedReset(PRE_RENDERED_DEFAULTS);

  const [isGlbPaused,         setIsGlbPaused]         = useState(false);
  const [isPreRenderedPaused, setIsPreRenderedPaused] = useState(false);

  const handleGlbReset = () => {
    glbRef.current?.resetRotation();
    glb.triggerReset();
  };

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

        {/* Pre-rendered Loading Animation */}
        <div className="flex flex-col items-center w-full">
          <div className="w-full h-[280px] flex items-center justify-center">
            <PreRenderedAnimation
              className="w-32 h-32 md:w-48 md:h-48"
              playbackSpeed={preRendered.props.playbackSpeed}
              isPaused={isPreRenderedPaused}
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
