"use client";

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

export interface CubeClassicHandle {
  resetRotation: () => void;
}

export interface CubeClassicProps {
  image?: string;
  className?: string;
  ior?: number;
  dispersion?: number;
  glassColor?: string;
  glassOpacity?: number;
  size?: number;
  depthOffset?: number;
  imageScale?: number;
}

// ─── Vertex Shader ────────────────────────────────────────────────────────────
const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vCubeCenterViewZ;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = mvPosition.xyz;
    vCubeCenterViewZ = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// ─── Fragment Shader ──────────────────────────────────────────────────────────
const fragmentShader = `
  uniform sampler2D uImageTex;
  uniform vec2  uImageSize;
  uniform float uIor;
  uniform vec3  uGlassColor;
  uniform float uGlassOpacity;
  uniform float uDispersion;
  uniform float uDepthOffset;

  varying vec3  vNormal;
  varying vec3  vViewPosition;
  varying float vCubeCenterViewZ;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 I = vec3(0.0, 0.0, -1.0);

    float etaR = 1.0 / (uIor - uDispersion);
    float etaG = 1.0 / uIor;
    float etaB = 1.0 / (uIor + uDispersion);

    vec3 R_r = refract(I, normal, etaR);
    vec3 R_g = refract(I, normal, etaG);
    vec3 R_b = refract(I, normal, etaB);

    float targetZ = vCubeCenterViewZ - uDepthOffset;

    float t_r = (abs(R_r.z) > 0.0001) ? (targetZ - vViewPosition.z) / R_r.z : 0.0;
    float t_g = (abs(R_g.z) > 0.0001) ? (targetZ - vViewPosition.z) / R_g.z : 0.0;
    float t_b = (abs(R_b.z) > 0.0001) ? (targetZ - vViewPosition.z) / R_b.z : 0.0;

    vec3 Q_r = vViewPosition + t_r * R_r;
    vec3 Q_g = vViewPosition + t_g * R_g;
    vec3 Q_b = vViewPosition + t_b * R_b;

    float halfW = uImageSize.x / 2.0;
    float halfH = uImageSize.y / 2.0;

    float r = 0.0, g = 0.0, b = 0.0;
    float rA = 0.0, gA = 0.0, bA = 0.0;

    if (Q_r.x >= -halfW && Q_r.x <= halfW && Q_r.y >= -halfH && Q_r.y <= halfH) {
      vec2 uv = vec2(Q_r.x / uImageSize.x + 0.5, Q_r.y / uImageSize.y + 0.5);
      vec4 tex = texture2D(uImageTex, uv); r = tex.r; rA = tex.a;
    }
    if (Q_g.x >= -halfW && Q_g.x <= halfW && Q_g.y >= -halfH && Q_g.y <= halfH) {
      vec2 uv = vec2(Q_g.x / uImageSize.x + 0.5, Q_g.y / uImageSize.y + 0.5);
      vec4 tex = texture2D(uImageTex, uv); g = tex.g; gA = tex.a;
    }
    if (Q_b.x >= -halfW && Q_b.x <= halfW && Q_b.y >= -halfH && Q_b.y <= halfH) {
      vec2 uv = vec2(Q_b.x / uImageSize.x + 0.5, Q_b.y / uImageSize.y + 0.5);
      vec4 tex = texture2D(uImageTex, uv); b = tex.b; bA = tex.a;
    }

    vec3  imageColor = vec3(r, g, b);
    float imageAlpha = (rA + gA + bA) / 3.0;

    vec3  lightDir = normalize(vec3(1.2, 1.5, 2.0));
    vec3  halfDir  = normalize(lightDir + vec3(0.0, 0.0, 1.0));
    float spec     = pow(max(dot(normal, halfDir), 0.0), 48.0);
    vec3  specular = vec3(1.0) * spec * 0.95;

    float fresnel  = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 3.5);
    vec3  edgeGlow = vec3(1.0) * fresnel * 0.6;

    vec3  refractedColor = mix(imageColor, uGlassColor, uGlassOpacity);
    vec3  baseGlass      = uGlassColor * uGlassOpacity;
    vec3  color          = mix(baseGlass, refractedColor, imageAlpha) + specular + edgeGlow;
    float alpha          = max(imageAlpha, uGlassOpacity) + spec * 0.5 + fresnel * 0.4;

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

// ─────────────────────────────────────────────────────────────────────────────

type ResetAnim = { startQuat: THREE.Quaternion; startTime: number };

const CubeClassic = forwardRef<CubeClassicHandle, CubeClassicProps>(({
  image,
  className = "",
  ior = 1.6,
  dispersion = 0.04,
  glassColor = "#e0f2fe",
  glassOpacity = 0.12,
  size = 1.5,
  depthOffset = 0.5,
  imageScale = 1.0,
}, ref) => {
  const containerRef  = useRef<HTMLDivElement>(null);
  const materialRef   = useRef<THREE.ShaderMaterial | null>(null);
  const textureRef    = useRef<THREE.Texture | null>(null);
  const sizeVecRef    = useRef<THREE.Vector2 | null>(null);
  const cameraRef     = useRef<THREE.OrthographicCamera | null>(null);
  const controlsRef   = useRef<TrackballControls | null>(null);
  const homeQuatRef   = useRef(new THREE.Quaternion());
  const resetAnimRef  = useRef<ResetAnim | null>(null);
  const meshRef       = useRef<THREE.Mesh | null>(null);
  // Keep latest size for image scale computation without triggering rebuilds
  const sizeRef       = useRef(size);
  const imageScaleRef = useRef(imageScale);

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
  // Recompute sizeVec when image/size/imageScale change, but DON'T rebuild the scene.
  useEffect(() => {
    sizeRef.current       = size;
    imageScaleRef.current = imageScale;
  }, [size, imageScale]);

  useEffect(() => {
    if (!image) return;
    let isMounted = true;
    new THREE.TextureLoader().load(
      image,
      (texture) => {
        if (!isMounted) { texture.dispose(); return; }
        texture.minFilter      = THREE.LinearFilter;
        texture.generateMipmaps = false;

        const img       = texture.image;
        const aspect    = img.width / img.height;
        const s         = sizeRef.current;
        const iScale    = imageScaleRef.current;
        const silWidth  = s * Math.sqrt(2);
        const silHeight = s * Math.sqrt(8 / 3);
        const silAspect = silWidth / silHeight;

        const sizeVec = new THREE.Vector2();
        if (aspect > silAspect) {
          sizeVec.set(silHeight * aspect * iScale, silHeight * iScale);
        } else {
          sizeVec.set(silWidth * iScale, (silWidth / aspect) * iScale);
        }

        textureRef.current = texture;
        sizeVecRef.current = sizeVec;

        if (materialRef.current) {
          materialRef.current.uniforms.uImageTex.value  = texture;
          materialRef.current.uniforms.uImageSize.value = sizeVec;
          materialRef.current.needsUpdate               = true;
        }
      },
      undefined,
      (err) => console.error("[CubeClassic] Failed to load image:", err)
    );
    return () => { isMounted = false; };
  }, [image]);

  // ── Size changes (Geometry) ──────────────────────────────────────────────────
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    mesh.geometry.dispose();
    let geometry: THREE.BufferGeometry;
    try { geometry = new RoundedBoxGeometry(size, size, size, 5, 0.06); }
    catch { geometry = new THREE.BoxGeometry(size, size, size); }
    mesh.geometry = geometry;
  }, [size]);

  // ── Uniform-only updates (no scene rebuild) ───────────────────────────────
  useEffect(() => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uIor.value          = ior;
    mat.uniforms.uDispersion.value   = dispersion;
    mat.uniforms.uGlassColor.value.set(glassColor);
    mat.uniforms.uGlassOpacity.value = glassOpacity;
    mat.uniforms.uDepthOffset.value  = size * depthOffset;
  }, [ior, dispersion, glassColor, glassOpacity, size, depthOffset]);

  // Recompute sizeVec when imageScale or size changes (texture already loaded)
  useEffect(() => {
    const mat     = materialRef.current;
    const texture = textureRef.current;
    if (!mat || !texture) return;

    const img       = texture.image;
    const aspect    = img.width / img.height;
    const silWidth  = size * Math.sqrt(2);
    const silHeight = size * Math.sqrt(8 / 3);
    const silAspect = silWidth / silHeight;

    const sizeVec = new THREE.Vector2();
    if (aspect > silAspect) {
      sizeVec.set(silHeight * aspect * imageScale, silHeight * imageScale);
    } else {
      sizeVec.set(silWidth * imageScale, (silWidth / aspect) * imageScale);
    }
    sizeVecRef.current                   = sizeVec;
    mat.uniforms.uImageSize.value        = sizeVec;
    mat.needsUpdate                      = true;
  }, [imageScale, size]);

  // ── Three.js scene (runs once) ─────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene       = new THREE.Scene();
    const frustumSize = 3.0;
    const getAspect   = () => container.clientWidth > 0 && container.clientHeight > 0
      ? container.clientWidth / container.clientHeight : 1;

    const camera = new THREE.OrthographicCamera(
      (frustumSize * getAspect()) / -2, (frustumSize * getAspect()) / 2,
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

    const material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader,
      uniforms: {
        uImageTex:    { value: fallbackTex },
        uImageSize:   { value: new THREE.Vector2(1.0, 1.0) },
        uIor:         { value: ior },
        uDispersion:  { value: dispersion },
        uGlassColor:  { value: new THREE.Color(glassColor) },
        uGlassOpacity:{ value: glassOpacity },
        uDepthOffset: { value: sizeRef.current * depthOffset },
      },
      transparent: true, depthWrite: false, side: THREE.FrontSide,
    });
    materialRef.current = material;

    // Reapply texture + computed imageSize if already loaded before this scene rebuild.
    if (textureRef.current && sizeVecRef.current) {
      material.uniforms.uImageTex.value  = textureRef.current;
      material.uniforms.uImageSize.value = sizeVecRef.current;
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

CubeClassic.displayName = "CubeClassic";
export default CubeClassic;
