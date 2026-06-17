"use client";

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

export interface CubePlainHandle {
  resetRotation: () => void;
}

export interface CubePlainProps {
  image?: string;
  className?: string;
  viewScale?: number;
  size?: number;
}

// ─── Vertex Shader ────────────────────────────────────────────────────────────
const vertexShader = `
  varying vec3 vViewPosition;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = mvPosition.xyz;
    gl_Position   = projectionMatrix * mvPosition;
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
    float screenAspect = uFrustumHalfSize.x / uFrustumHalfSize.y;
    vec2 rawUV    = vec2(
      vViewPosition.x / uFrustumHalfSize.x * 0.5 + 0.5,
      vViewPosition.y / uFrustumHalfSize.y * 0.5 + 0.5
    );
    vec2 normCube = (rawUV - 0.5) / uCubeHalf;
    vec2 baseUV   = normCube * 0.5 * uViewScale + 0.5;
    vec2 uv       = aspectCorrect(baseUV, screenAspect, uImageAspect);

    vec2  fade     = smoothstep(0.0, 0.04, min(uv, 1.0 - uv));
    float edgeFade = min(fade.x, fade.y);

    if (!uHasImage || edgeFade <= 0.0) { gl_FragColor = vec4(0.0); return; }

    vec4 texColor = texture2D(uImageTex, clamp(uv, 0.001, 0.999));
    gl_FragColor  = vec4(texColor.rgb, texColor.a * edgeFade);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────

type ResetAnim = { startQuat: THREE.Quaternion; startTime: number };

const CubePlain = forwardRef<CubePlainHandle, CubePlainProps>(({
  image,
  className = "",
  viewScale = 0.95,
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

  // ── Image loader ────────────────────────────────────────────────────────────
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
      (err) => console.error("[CubePlain] Failed to load image:", err)
    );
    return () => { isMounted = false; };
  }, [image]);

  // ── Uniform-only updates (no scene rebuild) ───────────────────────────────
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uViewScale.value = viewScale;
  }, [viewScale]);

  // ── Size changes (Geometry & Uniform) ───────────────────────────────────────
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
        uImageTex:        { value: fallbackTex },
        uHasImage:        { value: false },
        uImageAspect:     { value: 1.0 },
        uFrustumHalfSize: { value: frustumHalfSize },
        uCubeHalf:        { value: computeCubeHalf(initAspect) },
        uViewScale:       { value: viewScale },
      },
      transparent: true, depthWrite: false, side: THREE.FrontSide,
    });
    materialRef.current = material;

    // Reapply texture if already loaded before this scene rebuild.
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

CubePlain.displayName = "CubePlain";
export default CubePlain;
