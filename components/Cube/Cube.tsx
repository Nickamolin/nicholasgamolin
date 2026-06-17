"use client";

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

export interface CubeHandle {
  resetRotation: () => void;
}

export interface CubeProps {
  image?: string;
  className?: string;
  ior?: number;
  dispersion?: number;
  refractionStrength?: number;
  viewScale?: number;
  glassColor?: string;
  glassOpacity?: number;
  size?: number;
}

// ─── Vertex Shader ────────────────────────────────────────────────────────────
const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// ─── Fragment Shader ──────────────────────────────────────────────────────────
const fragmentShader = `
  uniform sampler2D uImageTex;
  uniform bool      uHasImage;
  uniform float     uImageAspect;
  uniform vec2      uFrustumHalfSize;
  uniform vec2      uCubeHalf;
  uniform float     uViewScale;
  uniform float     uIor;
  uniform float     uDispersion;
  uniform float     uRefractionStrength;
  uniform vec3      uGlassColor;
  uniform float     uGlassOpacity;

  varying vec3 vNormal;
  varying vec3 vViewPosition;

  vec2 aspectCorrect(vec2 uv, float screenAspect, float imgAspect) {
    if (imgAspect > screenAspect) {
      uv.x = (uv.x - 0.5) * (screenAspect / imgAspect) + 0.5;
    } else {
      uv.y = (uv.y - 0.5) * (imgAspect / screenAspect) + 0.5;
    }
    return uv;
  }

  void main() {
    vec3  normal       = normalize(vNormal);
    float screenAspect = uFrustumHalfSize.x / uFrustumHalfSize.y;

    vec2 rawUV    = vec2(
      vViewPosition.x / uFrustumHalfSize.x * 0.5 + 0.5,
      vViewPosition.y / uFrustumHalfSize.y * 0.5 + 0.5
    );
    vec2 normCube = (rawUV - 0.5) / uCubeHalf;
    vec2 baseUV   = normCube * 0.5 * uViewScale + 0.5;

    float strR = uRefractionStrength * (1.0 - uDispersion * 2.0);
    float strG = uRefractionStrength;
    float strB = uRefractionStrength * (1.0 + uDispersion * 2.0);

    vec2 uvR_raw = baseUV - normal.xy * strR;
    vec2 uvG_raw = baseUV - normal.xy * strG;
    vec2 uvB_raw = baseUV - normal.xy * strB;

    float r = 0.0, g = 0.0, b = 0.0, imgAlpha = 0.0;
    if (uHasImage) {
      vec2 uvR = aspectCorrect(uvR_raw, screenAspect, uImageAspect);
      vec2 uvG = aspectCorrect(uvG_raw, screenAspect, uImageAspect);
      vec2 uvB = aspectCorrect(uvB_raw, screenAspect, uImageAspect);

      vec2  fadeEdge = smoothstep(0.0, 0.04, min(uvG, 1.0 - uvG));
      float edgeFade = min(fadeEdge.x, fadeEdge.y);

      r = texture2D(uImageTex, clamp(uvR, 0.001, 0.999)).r;
      g = texture2D(uImageTex, clamp(uvG, 0.001, 0.999)).g;
      b = texture2D(uImageTex, clamp(uvB, 0.001, 0.999)).b;
      imgAlpha = 0.95 * edgeFade;
    }

    vec3 imageColor = vec3(r, g, b);
    vec3  lightDir  = normalize(vec3(1.2, 1.5, 2.0));
    vec3  halfDir   = normalize(lightDir + vec3(0.0, 0.0, 1.0));
    float spec      = pow(max(dot(normal, halfDir), 0.0), 56.0);
    vec3  specular  = vec3(1.0) * spec * 0.9;

    float fresnel   = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 3.5);
    vec3  edgeGlow  = vec3(1.0) * fresnel * 0.55;

    vec3  baseGlass = uGlassColor * uGlassOpacity;
    vec3  color     = mix(baseGlass, imageColor, imgAlpha) + specular + edgeGlow;
    float alpha     = max(imgAlpha, uGlassOpacity) + spec * 0.45 + fresnel * 0.35;

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

// ─────────────────────────────────────────────────────────────────────────────

type ResetAnim = { startQuat: THREE.Quaternion; startTime: number };

const Cube = forwardRef<CubeHandle, CubeProps>(({
  image,
  className = "",
  ior = 1.8,
  dispersion = 0.04,
  refractionStrength = 0.18,
  viewScale = 1.05,
  glassColor = "#e0f2fe",
  glassOpacity = 0.1,
  size = 1.5,
}, ref) => {
  const containerRef  = useRef<HTMLDivElement>(null);
  const materialRef   = useRef<THREE.ShaderMaterial | null>(null);
  const textureRef    = useRef<THREE.Texture | null>(null);
  const cameraRef     = useRef<THREE.OrthographicCamera | null>(null);
  const controlsRef   = useRef<TrackballControls | null>(null);
  const homeQuatRef   = useRef(new THREE.Quaternion());
  const resetAnimRef  = useRef<ResetAnim | null>(null);
  const meshRef       = useRef<THREE.Mesh | null>(null);
  const sizeRef       = useRef(size);

  useImperativeHandle(ref, () => ({
    resetRotation: () => {
      const cam = cameraRef.current;
      if (!cam) return;
      resetAnimRef.current = {
        startQuat: cam.quaternion.clone(),
        startTime: performance.now(),
      };
    },
  }));

  // ── Image loader ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!image) return;
    let isMounted = true;
    new THREE.TextureLoader().load(
      image,
      (texture) => {
        if (!isMounted) { texture.dispose(); return; }
        texture.minFilter      = THREE.LinearFilter;
        texture.generateMipmaps = false;
        textureRef.current = texture;
        if (materialRef.current) {
          materialRef.current.uniforms.uImageTex.value    = texture;
          materialRef.current.uniforms.uImageAspect.value = texture.image.width / texture.image.height;
          materialRef.current.uniforms.uHasImage.value    = true;
        }
      },
      undefined,
      (err) => console.error("[Cube] Failed to load image:", err)
    );
    return () => { isMounted = false; };
  }, [image]);

  // ── Uniform-only updates (no scene rebuild) ───────────────────────────────
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uIor.value                = ior;
    mat.uniforms.uDispersion.value         = dispersion;
    mat.uniforms.uRefractionStrength.value = refractionStrength;
    mat.uniforms.uViewScale.value          = viewScale;
    mat.uniforms.uGlassColor.value.set(glassColor);
    mat.uniforms.uGlassOpacity.value       = glassOpacity;
  }, [ior, dispersion, refractionStrength, viewScale, glassColor, glassOpacity]);

  // ── Size changes (Geometry & Uniforms) ──────────────────────────────────────
  useEffect(() => {
    sizeRef.current = size;
    const mesh = meshRef.current;
    const container = containerRef.current;
    const material = materialRef.current;
    if (!mesh || !container || !material) return;

    mesh.geometry.dispose();
    let geometry: THREE.BufferGeometry;
    try { geometry = new RoundedBoxGeometry(size, size, size, 5, 0.06); }
    catch { geometry = new THREE.BoxGeometry(size, size, size); }
    mesh.geometry = geometry;

    const frustumSize = 3.0;
    const aspect = container.clientWidth > 0 && container.clientHeight > 0
      ? container.clientWidth / container.clientHeight : 1;
      
    material.uniforms.uCubeHalf.value.set(
      (size * Math.sqrt(3)) / (2 * frustumSize * aspect),
      (size * Math.sqrt(3)) / (2 * frustumSize)
    );
  }, [size]);

  // ── Three.js scene (runs once) ─────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene       = new THREE.Scene();
    const frustumSize = 3.0;
    const initAspect  = container.clientWidth > 0 && container.clientHeight > 0
      ? container.clientWidth / container.clientHeight : 1;

    const camera = new THREE.OrthographicCamera(
      (frustumSize * initAspect) / -2, (frustumSize * initAspect) / 2,
       frustumSize / 2, frustumSize / -2, 0.1, 100
    );
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    homeQuatRef.current.copy(camera.quaternion);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || 300, container.clientHeight || 300);
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls       = new TrackballControls(camera, renderer.domElement);
    controls.noZoom      = true;
    controls.noPan       = true;
    controls.rotateSpeed = 2.5;
    controlsRef.current  = controls;

    let geometry: THREE.BufferGeometry;
    try { geometry = new RoundedBoxGeometry(sizeRef.current, sizeRef.current, sizeRef.current, 5, 0.06); }
    catch { geometry = new THREE.BoxGeometry(sizeRef.current, sizeRef.current, sizeRef.current); }

    const fallbackTex       = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1, THREE.RGBAFormat);
    fallbackTex.needsUpdate = true;

    const frustumHalfSize = new THREE.Vector2((frustumSize * initAspect) / 2, frustumSize / 2);
    const computeCubeHalf = (aspect: number) => new THREE.Vector2(
      (sizeRef.current * Math.sqrt(3)) / (2 * frustumSize * aspect),
      (sizeRef.current * Math.sqrt(3)) / (2 * frustumSize)
    );

    const material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader,
      uniforms: {
        uImageTex:           { value: fallbackTex },
        uHasImage:           { value: false },
        uImageAspect:        { value: 1.0 },
        uFrustumHalfSize:    { value: frustumHalfSize },
        uCubeHalf:           { value: computeCubeHalf(initAspect) },
        uViewScale:          { value: viewScale },
        uIor:                { value: ior },
        uDispersion:         { value: dispersion },
        uRefractionStrength: { value: refractionStrength },
        uGlassColor:         { value: new THREE.Color(glassColor) },
        uGlassOpacity:       { value: glassOpacity },
      },
      transparent: true, depthWrite: false, side: THREE.FrontSide,
    });
    materialRef.current = material;

    // If a texture was already loaded before this scene rebuild, reapply it immediately.
    if (textureRef.current) {
      material.uniforms.uImageTex.value    = textureRef.current;
      material.uniforms.uImageAspect.value = textureRef.current.image.width / textureRef.current.image.height;
      material.uniforms.uHasImage.value    = true;
    }

    const cubeMesh      = new THREE.Mesh(geometry, material);
    cubeMesh.rotation.y = Math.PI / 4;
    cubeMesh.rotation.x = Math.atan(1 / Math.sqrt(2));
    scene.add(cubeMesh);
    meshRef.current     = cubeMesh;

    const handleResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      if (w === 0 || h === 0) return;
      const a = w / h;
      camera.left = (frustumSize * a) / -2; camera.right  = (frustumSize * a) / 2;
      camera.top  =  frustumSize / 2;        camera.bottom =  frustumSize / -2;
      camera.updateProjectionMatrix();
      material.uniforms.uFrustumHalfSize.value.set((frustumSize * a) / 2, frustumSize / 2);
      material.uniforms.uCubeHalf.value.copy(computeCubeHalf(a));
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      controls.handleResize();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    const RESET_DURATION = 700;
    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const anim = resetAnimRef.current;
      if (anim) {
        const t     = Math.min((performance.now() - anim.startTime) / RESET_DURATION, 1);
        const eased = 1 - Math.pow(1 - t, 3);

        camera.quaternion.slerpQuaternions(anim.startQuat, homeQuatRef.current, eased);
        camera.position.set(0, 0, 5).applyQuaternion(camera.quaternion);

        if (t >= 1) { resetAnimRef.current = null; controls.reset(); }
      } else {
        controls.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      controls.dispose();
      cameraRef.current    = null;
      controlsRef.current  = null;
      resetAnimRef.current = null;
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      geometry.dispose(); material.dispose(); fallbackTex.dispose(); renderer.dispose();
    };
  }, []); // ← Rebuilds only on mount

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[300px] select-none cursor-grab active:cursor-grabbing ${className}`}
    />
  );
});

Cube.displayName = "Cube";
export default Cube;
