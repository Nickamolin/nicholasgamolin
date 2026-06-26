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
  /** Splay — fans the refraction direction from axis-aligned/mitered (0) to radial/smooth (1) */
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
 * The BLUE channel is an independent specular shine field (edgeHighlight +
 * glow, steered by specularAngle). feDisplacementMap reads only R/G, so blue
 * never affects the refraction; a separate filter pass extracts it as a rim
 * highlight. This is Aave's approach — the edge/shine lives in the map itself
 * rather than being a white border stamped on afterwards.
 */
export function generateDisplacementMap(
  lensW: number,
  lensH: number,
  borderRadius: number,
  depth: number,
  curvature: number,
  splay: number,
  glow = 0,
  edgeHighlight = 0,
  specularAngle = 45,
  pixelRatio = 1
): { dispUrl: string; specUrl: string; previewUrl: string } {
  const pw = Math.ceil(lensW * pixelRatio);
  const ph = Math.ceil(lensH * pixelRatio);

  const canvas = document.createElement("canvas");
  canvas.width = pw;
  canvas.height = ph;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { dispUrl: "", specUrl: "" };

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
  const rawB = new Float32Array(pw * ph); // specular shine field → blue channel, 0..1
  const rawFade = new Float32Array(pw * ph); // anti-aliased boundary fade, 0..1
  let maxMag = 1e-6;

  // Light direction for the specular term. The rim is brightest where its
  // outward normal faces this direction, and dims (down to an ambient floor)
  // on the opposite side — which is what `specularAngle` visibly sweeps.
  const La = (specularAngle * Math.PI) / 180;
  const Lx = Math.cos(La);
  const Ly = Math.sin(La);

  for (let j = 0; j < ph; j++) {
    for (let i = 0; i < pw; i++) {
      // Map physical pixel back to logical coordinate space.
      const px = i / pixelRatio - cx + 0.5 / pixelRatio;
      const py = j / pixelRatio - cy + 0.5 / pixelRatio;
      const d = sdfRoundedRect(px, py, hw, hh, r);
      if (d >= 0) continue;

      // Smooth anti-aliased fade over 4 logical pixels at the boundary using a
      // smoothstep curve (zero derivative at both ends), so the displacement
      // and blur mask ramp up without a visible kink. 4px gives enough range
      // that even non-Retina screens have several samples across the fade zone.
      // Previously this was a linear ramp over only 2px, which was too thin.
      const t = Math.min(1, -d / 4);
      const edgeFade = t * t * (3 - 2 * t);  // smoothstep
      rawFade[j * pw + i] = edgeFade;

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
      const idx = j * pw + i;

      // Outward normal of the bezel (radial). Used by BOTH the displacement
      // direction and the directional specular term below.
      const dirX = rho > 0 ? nx / rho : 0;
      const dirY = rho > 0 ? ny / rho : 0;

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

      // ── Specular shine field (→ blue channel) ──
      //   • edgeHighlight: a TRUE fixed-width rim measured by the signed-distance
      //     field (`-d` = logical px inside the boundary). Because the SDF gives
      //     exact Euclidean distance to the edge, the band is exactly `borderPx`
      //     wide everywhere — straight sides AND rounded corners — independent of
      //     lens size or aspect. The previous version measured width in
      //     superellipse `rho`-space, whose isolines bunch up unevenly, so the rim
      //     ballooned into thick blobs at the corners along the light axis (and got
      //     thicker as the lens was stretched). It is still DIRECTIONAL — only the
      //     two ends aligned with the specular angle light up — but now with a
      //     constant, pixel-thin width.
      //   • glow: tied to the displacement magnitude `m`, so blue is only added
      //     where pixels are actually refracting. This matches Aave — glow
      //     brightens displaced pixels rather than painting a flat radial gradient
      //     that ignores the displacement map. Its width follows `depth`.
      // borderPx controls the width of the edge highlight band.
      // 1.5px keeps it as a crisp, pixel-thin rim glint.
      // The gap between the highlight and the glow zone is closed below by
      // letting glow appear wherever m>0 (no edgeFade suppression).
      const borderPx = 1.5;
      const distEdge = -d; // d<0 inside the shape, so -d is the distance from the rim
      // Brightest right at the rim (distEdge→0), falling off over `borderPx`. The
      // sqrt keeps it near-full across the thin band so it reads as a crisp border
      // rather than a soft inward gradient.
      const edgeProfile = distEdge < borderPx
        ? Math.sqrt(1 - distEdge / borderPx)
        : 0;
      // Square m so the glow falls off faster toward the centre (concave/quadratic
      // rather than linear). At high depth m spans the whole lens, and m^2 keeps
      // it concentrated near the rim — giving the rounded "glass bubble" look
      // instead of a flat linear ramp across the face.
      const glowProfile = m * m;
      const dot = Math.abs(dirX * Lx + dirY * Ly);
      // Edge: a sharp two-ended glint along the light axis (no shine on the
      // perpendicular ends), so it reads as a directional border segment.
      const edgeDir = Math.pow(dot, 4);
      // Glow: follows the specular angle just like the edge, but with a softer,
      // broader falloff (dot² vs the edge's dot⁴) so it reads as a diffuse shine
      // on the two light-facing ends rather than a tight glint. A small ambient
      // floor keeps it from cutting off to nothing on the perpendicular ends.
      const glowDir = 0.1 + 0.9 * Math.pow(dot, 2);
      rawB[idx] = Math.min(
        // edgeHighlight: sharp rim glint (SDF-width band, directional).
        edgeHighlight * edgeProfile * edgeDir
        // glow: brightens the displaced bezel wherever m>0. No edgeFade
        // multiplier — glow appears right from the rim so it naturally bridges
        // the gap left by the 1.5px highlight band. The specular canvas already
        // clips to inside pixels, so no boundary bleed is possible.
        + glow * glowProfile * glowDir,
        1
      );

      if (m <= 0) continue;

      // ── Displacement direction, morphed by `splay` ──
      // splay fans the refraction vectors between two regimes (matching Aave):
      //   • splay = 1 → RADIAL: vectors point straight out from the centre, so the
      //     hues rotate smoothly with no creases (Aave's map at splay 1).
      //   • splay = 0 → BOXY: vectors align toward the nearest edge, giving a
      //     squared-off bevel (Aave's map at splay 0) — but the CORNERS STAY SOFT.
      // The trick is to take the gradient of a p-norm and raise its exponent as
      // splay drops, rather than hard-picking the nearest edge. A p-norm gradient
      // rotates *continuously* across the diagonal (both components stay comparable
      // there), so the corner transition is smooth at every splay — no harsh miter
      // seam like a `nearest-edge` selection produces.
      const pDir = 2 + (1 - splay) * 3;  // splay 1 → p=2 (round), splay 0 → p=5 (boxy but smooth corners)
      const gx = Math.sign(nx) * Math.pow(absNx, pDir - 1);
      const gy = Math.sign(ny) * Math.pow(absNy, pDir - 1);
      const gLen = Math.hypot(gx, gy) || 1;
      const ddx = gx / gLen;
      const ddy = gy / gLen;

      // Convex lens: the leading minus makes dispX > 0 when reading from the left,
      // creating a white/yellow top-left corner in the map exactly like Aave.
      const dispX = -ddx * m;
      const dispY = -ddy * m;

      rawX[idx] = dispX;
      rawY[idx] = dispY;
      maxMag = Math.max(maxMag, Math.abs(dispX), Math.abs(dispY));
    }
  }

  // ── Write displacement map pixels ──────────────────────────────────────────
  // R/G store full displacement (NOT pre-multiplied by fade). The feMerge
  // "over"-composites the PNG (alpha=fade) on top of the neutral flood (128),
  // naturally producing: 128 + disp*fade — a correct linear blend.
  // ALPHA encodes the rounded-rect coverage (anti-aliased at the rim) so the
  // SVG filter can use it as a mask for the backdrop blur.
  // BLUE stays at the neutral 128 (not used by feDisplacementMap and keeping
  // it neutral means the map preview looks correctly grey rather than brown).
  //
  // ── Specular canvas ────────────────────────────────────────────────────────
  // SVG filter primitives work in PRE-MULTIPLIED alpha. If we encoded rawB in
  // the disp PNG's blue channel, feColorMatrix would see
  //   B_premul = rawB × edgeFade
  // and at the rim (edgeFade → 0) the edge highlight would be crushed to zero
  // even when rawB = 1 — producing a dark rim between the highlight and glow.
  // Fix: use a SECOND canvas whose alpha = rawB directly, with alpha=255
  // everywhere inside the shape. The feImage that loads it is NOT pre-multiplied
  // by edgeFade, so the highlight appears at full amplitude right at the rim.
  const specCanvas = document.createElement("canvas");
  specCanvas.width = pw;
  specCanvas.height = ph;
  const specCtx = specCanvas.getContext("2d");
  if (!specCtx) return { dispUrl: "", specUrl: "", previewUrl: "" };
  const specData = specCtx.createImageData(pw, ph);
  const sd = specData.data;

  // ── Preview canvas ─────────────────────────────────────────────────────────
  // A fully-opaque version of the displacement map for the UI preview.
  // The disp PNG uses alpha=edgeFade (needed by the SVG filter for blur masking),
  // which creates a soft semi-transparent edge and crushes the blue-channel edge
  // highlight to near-invisible when composited over the grey background.
  // The preview canvas writes alpha=255 everywhere: neutral grey (128,128,128)
  // outside the lens, actual R/G/B values inside, so the map is rendered crisply
  // with the full specular field visible.
  const prevCanvas = document.createElement("canvas");
  prevCanvas.width = pw;
  prevCanvas.height = ph;
  const prevCtx = prevCanvas.getContext("2d");
  if (!prevCtx) return { dispUrl: "", specUrl: "", previewUrl: "" };
  const prevData = prevCtx.createImageData(pw, ph);
  const pd = prevData.data;

  for (let k = 0; k < pw * ph; k++) {
    const idx = k * 4;
    const fade = rawFade[k];
    const r = Math.round(128 + (rawX[k] / maxMag) * 127);
    const g = Math.round(128 + (rawY[k] / maxMag) * 127);
    const b = Math.round(128 + rawB[k] * 127);
    // Displacement canvas: alpha=edgeFade (used by the SVG filter for masking)
    data[idx + 0] = r;
    data[idx + 1] = g;
    data[idx + 2] = b;
    data[idx + 3] = Math.round(255 * fade);
    // Specular canvas: solid white, alpha = rawB (no edgeFade premultiplication).
    // Pixels outside the lens are left as RGBA(0,0,0,0) (canvas default).
    if (fade > 0) {
      sd[idx + 0] = 255;
      sd[idx + 1] = 255;
      sd[idx + 2] = 255;
      sd[idx + 3] = Math.round(rawB[k] * 255);
    }
    // Preview canvas: fully opaque. Neutral grey outside, actual values inside.
    pd[idx + 0] = fade > 0 ? r : 128;
    pd[idx + 1] = fade > 0 ? g : 128;
    pd[idx + 2] = fade > 0 ? b : 128;
    pd[idx + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  specCtx.putImageData(specData, 0, 0);
  prevCtx.putImageData(prevData, 0, 0);
  return {
    dispUrl: canvas.toDataURL("image/png"),
    specUrl: specCanvas.toDataURL("image/png"),
    previewUrl: prevCanvas.toDataURL("image/png"),
  };
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
  // dispUrl drives the displacement / blur-mask feImage.
  // specUrl drives a separate feImage for the specular highlight — kept separate
  // so its alpha (rawB) is NOT premultiplied by edgeFade in the filter pipeline.
  const [dispUrl, setDispUrl] = useState<string>("");
  const [specUrl, setSpecUrl] = useState<string>("");
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

  // Regenerate displacement + specular maps when shape params change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dpr = window.devicePixelRatio || 1;
    const { dispUrl: du, specUrl: su } = generateDisplacementMap(rw, rh, borderRadius, depth, curvature, splay, glow, edgeHighlight, specularAngle, dpr);
    setDispUrl(du);
    setSpecUrl(su);
    // Change filter ID to bust Safari's filter cache
    setFilterId(`lg-filter-${baseId}-${Date.now()}`);
  }, [rw, rh, borderRadius, depth, curvature, splay, glow, edgeHighlight, specularAngle, baseId]);

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
  // Aave's scale slider maps to a much larger displacement than lens dimensions alone —
  // multiplying by 1000 gives ~200px at scale=0.2, matching Aave's strong magnification.
  const displacementScale = scale * 400;
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
      {dispUrl && (
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

              {/* Displacement map image (R=dispX, G=dispY, B=128 neutral, A=edgeFade) */}
              <feImage
                id={`${filterId}-img`}
                href={dispUrl}
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

              {/* Backdrop blur — masked to the lens interior using the map's alpha.
                  blur=0 collapses to an identity (feGaussianBlur with stdDeviation=0
                  passes through unchanged, feComposite in/out split and add back up). */}
              <feGaussianBlur in="displaced" stdDeviation={blur} edgeMode="duplicate" result="blurredFull" />
              <feComposite in="blurredFull" in2="displacementMapCentered" operator="in" result="blurredInLens" />
              <feComposite in="displaced" in2="displacementMapCentered" operator="out" result="sharpOutsideLens" />
              {/* Arithmetic add instead of feMerge to keep a true linear cross-fade.
                  feMerge "over" at the anti-aliased rim (alpha≈0.5) yields
                  a + (1−a)² = 0.75 — a translucent ring and dark halo. Adding the two
                  pre-masked halves (blurred·a + sharp·(1−a)) keeps alpha at 1 everywhere. */}
              <feComposite in="blurredInLens" in2="sharpOutsideLens" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="refracted" />

              {/* ── Specular rim highlight ──
                  A separate feImage loads the specular canvas (RGBA white, alpha=rawB).
                  Because this PNG has alpha=255 everywhere inside the lens (NOT edgeFade),
                  the filter sees the straight rawB value — no premultiplication by edgeFade.
                  This means the edge highlight appears at full brightness right at the
                  rim (where edgeFade≈0 would have crushed it in the disp PNG). */}
              {specUrl && (
                <feImage
                  href={specUrl}
                  x={imgX}
                  y={imgY}
                  width={rw}
                  height={rh}
                  preserveAspectRatio="none"
                  result="specularMap"
                />
              )}
              <feBlend in="specularMap" in2="refracted" mode="screen" />

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
            filter: (dispUrl && containerSize.w > 0) ? `url(#${filterId})` : undefined,
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

          {/* Backdrop blur + specular rim highlight are both handled inside the SVG
              filter pipeline — no DOM layers needed for either. The specular is
              extracted from displacementMapCentered inside the filter graph, so it
              is anti-aliased by the map's alpha rather than a CSS border-radius clip
              (which Chromium doesn't anti-alias on CSS-filtered elements). */}

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
