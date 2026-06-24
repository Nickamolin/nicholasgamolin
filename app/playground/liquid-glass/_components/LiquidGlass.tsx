"use client";

import React, { useRef, useEffect, useId, useCallback, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LiquidGlassProps {
  /** Width of the glass lens in px */
  lensWidth?: number;
  /** Height of the glass lens in px */
  lensHeight?: number;
  /** Border radius of the lens shape in px */
  borderRadius?: number;
  /** Displacement scale — overall refraction strength (0–0.2) */
  scale?: number;
  /** Depth — controls how far the center of the lens displaces (5–60) */
  depth?: number;
  /** Curvature — controls the falloff exponent (0–80) */
  curvature?: number;
  /** Splay — ratio of X to Y displacement (0–1) */
  splay?: number;
  /** Chromatic aberration strength (0–1) */
  chroma?: number;
  /** Backdrop blur inside the lens in px (0–10) */
  blur?: number;
  /** White fill opacity inside the lens (0–0.5) */
  glow?: number;
  /** Inset edge highlight opacity (0–1) */
  edgeHighlight?: number;
  /** Specular gradient angle in degrees (0–180) */
  specularAngle?: number;
  /** Multiplier applied to lensWidth/lensHeight at render time (borderRadius is NOT scaled).
   *  Use this to match a reference implementation's pixel size while keeping slider values identical. */
  renderScale?: number;
  /** Lens X position, 0–1 normalized within the container */
  lensX?: number;
  /** Lens Y position, 0–1 normalized within the container */
  lensY?: number;
  /** Whether the lens is draggable by the user */
  draggable?: boolean;
  onLensMove?: (x: number, y: number) => void;
  children: React.ReactNode;
  className?: string;
}

// ─── Displacement map generation ─────────────────────────────────────────────

// Signed distance field for a rounded rectangle, centred at the origin.
// `hw`/`hh` are the half-extents, `r` the corner radius.
// Returns a negative value inside the shape and positive outside.
function sdfRoundedRect(px: number, py: number, hw: number, hh: number, r: number): number {
  const qx = Math.abs(px) - (hw - r);
  const qy = Math.abs(py) - (hh - r);
  return (
    Math.min(Math.max(qx, qy), 0) +
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) -
    r
  );
}

/**
 * Generates the displacement map that drives the refraction.
 *
 * The map encodes a per-pixel offset vector in its red (X) and green (Y)
 * channels, where 128 means "no displacement". Displacement direction is
 * radial from centre (smooth everywhere), and magnitude follows a power
 * law from edge (max) to centre (zero). The border-radius SDF is used
 * only as a mask — pixels outside the rounded rect stay neutral.
 *
 * When edgeHighlight > 0, a narrow band of boosted displacement is added
 * near the shape boundary, creating a visible coloured rim in the map
 * (matching Aave's approach where the edge highlight lives in the map itself).
 */
export function generateDisplacementMap(
  lensW: number,
  lensH: number,
  borderRadius: number,
  depth: number,
  curvature: number,
  splay: number,
  pixelRatio = 1
): string {
  const pw = Math.ceil(lensW * pixelRatio);
  const ph = Math.ceil(lensH * pixelRatio);

  const canvas = document.createElement("canvas");
  canvas.width = pw;
  canvas.height = ph;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const imageData = ctx.createImageData(pw, ph);
  const data = imageData.data;

  // All geometry stays in logical (CSS) pixel space; we just sample more
  // physical pixels so the preview image is sharp on Retina screens.
  const cx = lensW / 2;
  const cy = lensH / 2;
  const hw = cx;
  const hh = cy;
  const r = Math.max(0, Math.min(borderRadius, Math.min(hw, hh)));

  // Cap the bezel width at the lens "inradius" (distance from centre to the nearest
  // edge) so a large depth ramps the displacement all the way down to 0 (neutral) at
  // the centre rather than leaving a saturated core.
  const tc = -sdfRoundedRect(0, 0, hw, hh, r);
  const band = Math.min(Math.max(1, depth), tc);
  const exp = 1.3 + curvature * 0.0075;   // 1.3 at curv 0, ~1.9 at curv 80 (matches Aave's measured ρ^exp)

  const rawX = new Float32Array(pw * ph);
  const rawY = new Float32Array(pw * ph);
  let maxMag = 1e-6;

  for (let j = 0; j < ph; j++) {
    for (let i = 0; i < pw; i++) {
      // Map physical pixel back to logical coordinate space.
      const px = i / pixelRatio - cx + 0.5 / pixelRatio;
      const py = j / pixelRatio - cy + 0.5 / pixelRatio;
      const d = sdfRoundedRect(px, py, hw, hh, r);
      if (d >= 0) continue;

      // Superellipse (p-norm) gradient field.
      // A superellipse |x|^n + |y|^n = 1 creates a perfectly smooth distance
      // metric that pushes inward at the corners but NEVER has a diagonal crease.
      // We map borderRadius to n: r=0 -> n=16 (rectangle), r=max -> n=2 (circle)
      const maxR = Math.min(hw, hh) || 1;
      const nR = Math.min(r / maxR, 1.0);
      const n = 2 + 14 * Math.pow(1 - nR, 2.0);

      const nx = px / (hw || 1);
      const ny = py / (hh || 1);
      const absNx = Math.abs(nx);
      const absNy = Math.abs(ny);
      
      const rho = Math.pow(Math.pow(absNx, n) + Math.pow(absNy, n), 1 / n);

      // depth controls the width of the displaced bezel in pixels.
      // We multiply by 2 because Aave's depth scale maps to a wider physical band 
      // (a depth of 10 in Aave corresponds to ~20 pixels of penetration).
      const bandRho = Math.min((Math.max(0.001, depth) * 2) / Math.min(hw, hh), 1.0);
      const startRho = 1.0 - bandRho;

      let m = 0;
      if (rho > startRho) {
        // We MUST cap s at 1.0. Otherwise, corners (where rho can slightly exceed 1.0) 
        // will massively inflate maxMag at low depth values, crushing the gradient
        // intensity everywhere else and making the map look faintly grey / invisible.
        const s = Math.min((rho - startRho) / bandRho, 1.0);
        m = Math.pow(s, exp);
      }

      if (m <= 0) continue;

      // Normalize the direction vector so the displacement magnitude exactly equals m.
      // Without this division by rho, the magnitude would be m * rho, effectively
      // making the gradient profile rho^(exp+1) which is way too shallow/flat.
      const dirX = rho > 0 ? nx / rho : 0;
      const dirY = rho > 0 ? ny / rho : 0;

      // Convex lens: mapping -dirX makes dispX > 0 when reading from the left,
      // creating a white/yellow top-left corner in the map exactly like Aave.
      const dispX = -dirX * m * splay;
      const dispY = -dirY * m;

      const idx = j * pw + i;
      rawX[idx] = dispX;
      rawY[idx] = dispY;
      maxMag = Math.max(maxMag, Math.abs(dispX), Math.abs(dispY));
    }
  }

  for (let k = 0; k < pw * ph; k++) {
    const idx = k * 4;
    data[idx + 0] = 128 + (rawX[k] / maxMag) * 127;
    data[idx + 1] = 128 + (rawY[k] / maxMag) * 127;
    data[idx + 2] = 128;
    data[idx + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

// ─── LiquidGlass component ────────────────────────────────────────────────────

export default function LiquidGlass({
  lensWidth = 120,
  lensHeight = 80,
  borderRadius = 28,
  scale = 0.1,
  depth = 10,
  curvature = 40,
  splay = 1.0,
  chroma = 0.2,
  blur = 0,
  glow = 0.1,
  edgeHighlight = 0.25,
  specularAngle = 45,
  renderScale = 1,
  lensX = 0.5,
  lensY = 0.5,
  draggable = true,
  onLensMove,
  children,
  className = "",
}: LiquidGlassProps) {
  const rw = lensWidth * renderScale;
  const rh = lensHeight * renderScale;
  const baseId = useId().replace(/:/g, "");
  const [filterId, setFilterId] = useState(`lg-filter-${baseId}`);
  const [mapUrl, setMapUrl] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  // The stage spans the full inner box regardless of any padding on the
  // container, so the filtered content, the displacement map and the lens
  // overlay all share one coordinate system (keeps the refraction aligned).
  const stageRef = useRef<HTMLDivElement>(null);

  const [internalX, setInternalX] = useState(lensX);
  const [internalY, setInternalY] = useState(lensY);
  const isDragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, lx: 0, ly: 0 });

  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!stageRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContainerSize({
        w: entries[0].contentRect.width,
        h: entries[0].contentRect.height,
      });
    });
    observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync external lensX/Y to internal state
  useEffect(() => { setInternalX(lensX); }, [lensX]);
  useEffect(() => { setInternalY(lensY); }, [lensY]);

  // Regenerate displacement map when shape params change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = generateDisplacementMap(rw, rh, borderRadius, depth, curvature, splay);
    setMapUrl(url);
    // Change filter ID to bust Safari's filter cache
    setFilterId(`lg-filter-${baseId}-${Date.now()}`);
  }, [rw, rh, borderRadius, depth, curvature, splay, baseId]);

  // ── Pointer drag handling ──
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!draggable) return;
    e.preventDefault();
    isDragging.current = true;
    dragStart.current = {
      mx: e.clientX,
      my: e.clientY,
      lx: internalX,
      ly: internalY,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [draggable, internalX, internalY]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const dx = (e.clientX - dragStart.current.mx) / rect.width;
    const dy = (e.clientY - dragStart.current.my) / rect.height;
    const nx = Math.max(0, Math.min(1, dragStart.current.lx + dx));
    const ny = Math.max(0, Math.min(1, dragStart.current.ly + dy));
    setInternalX(nx);
    setInternalY(ny);
    onLensMove?.(nx, ny);
  }, [onLensMove]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // ── Lens pixel position ──
  // We want the lens centered on (internalX, internalY) fraction of container
  // But we don't know container size at render time, so use CSS calc
  const lensLeft = `calc(${internalX * 100}% - ${rw / 2}px)`;
  const lensTop = `calc(${internalY * 100}% - ${rh / 2}px)`;

  // Overall refraction strength in user-space px. The encoded map spans the
  // full channel range, so the visible offset is roughly `displacementScale / 2`.
  const displacementScale = scale * Math.max(rw, rh);
  // Per-channel scales for chromatic aberration: red bends a little more than
  // blue, splitting the colour fringe along the rim. chroma === 0 → no split.
  const scaleR = displacementScale * (1 + chroma * 0.4);
  const scaleG = displacementScale;
  const scaleB = displacementScale * (1 - chroma * 0.4);

  // Calculate exact pixel position for the lens displacement map image
  const imgX = containerSize.w > 0 ? (internalX * containerSize.w - rw / 2) : 0;
  const imgY = containerSize.h > 0 ? (internalY * containerSize.h - rh / 2) : 0;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* ── Hidden SVG filter definition ── */}
      {mapUrl && (
        <svg
          viewBox="0 0 0 0"
          width="0"
          height="0"
          style={{ position: "absolute", pointerEvents: "none" }}
          aria-hidden="true"
        >
          <defs>
            <filter
              id={filterId}
              filterUnits="userSpaceOnUse"
              primitiveUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              {/* Flood with neutral displacement (128 = 0.5 for no displacement) */}
              <feFlood floodColor="#808080" floodOpacity="1" result="neutral" />

              {/* The displacement map image */}
              <feImage
                id={`${filterId}-img`}
                href={mapUrl}
                x={imgX}
                y={imgY}
                width={rw}
                height={rh}
                preserveAspectRatio="none"
                result="displacementMapCentered"
              />

              {/* Merge the lens map over the neutral flood without clipping */}
              <feMerge result="displacementMap">
                <feMergeNode in="neutral" />
                <feMergeNode in="displacementMapCentered" />
              </feMerge>

              {/* Displace each colour channel by a slightly different amount to
                  produce chromatic aberration, then recombine via screen blend. */}
              <feDisplacementMap
                in="SourceGraphic"
                in2="displacementMap"
                scale={scaleR}
                xChannelSelector="R"
                yChannelSelector="G"
                result="dispR"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="displacementMap"
                scale={scaleG}
                xChannelSelector="R"
                yChannelSelector="G"
                result="dispG"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="displacementMap"
                scale={scaleB}
                xChannelSelector="R"
                yChannelSelector="G"
                result="dispB"
              />

              {/* Keep only one colour channel from each pass (alpha preserved). */}
              <feColorMatrix
                in="dispR"
                type="matrix"
                values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result="chR"
              />
              <feColorMatrix
                in="dispG"
                type="matrix"
                values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
                result="chG"
              />
              <feColorMatrix
                in="dispB"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
                result="chB"
              />

              <feBlend in="chR" in2="chG" mode="screen" result="chRG" />
              <feBlend in="chRG" in2="chB" mode="screen" result="displaced" />


            </filter>
          </defs>
        </svg>
      )}

      {/* ── Stage: shares one coordinate system for content + overlay ── */}
      <div ref={stageRef} style={{ position: "absolute", inset: 0 }}>
        {/* Content with filter applied */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            filter: (mapUrl && containerSize.w > 0) ? `url(#${filterId})` : undefined,
            willChange: "filter",
          }}
        >
          {children}

        </div>

        {/* ── Lens overlay layers ── */}
        <div
          style={{
            position: "absolute",
            left: lensLeft,
            top: lensTop,
            width: rw,
            height: rh,
            borderRadius,
            pointerEvents: draggable ? "auto" : "none",
            cursor: draggable ? "grab" : "default",
            willChange: "transform",
            userSelect: "none",
            touchAction: "none",
          }}
          onPointerDown={handlePointerDown}
        >
          {/* Edge highlight ring: A subtle inner border and shine on the lens itself */}
          {edgeHighlight > 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius,
                boxShadow: `
                  inset 0 0 0 1px rgba(255,255,255,${edgeHighlight * 0.4}),
                  inset 0 0 12px 0 rgba(255,255,255,${edgeHighlight * 0.15})
                `,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Backdrop blur layer */}
          {blur > 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius,
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
              }}
            />
          )}

          {/* White glow/fill */}
          {glow > 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius,
                background: `rgba(255,255,255,${glow})`,
                pointerEvents: "none",
              }}
            />
          )}

          {/* Grounding drop shadow */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius,
              boxShadow: "0 6px 20px rgba(0,0,0,0.22)",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}
