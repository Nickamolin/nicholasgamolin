"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

interface CubeProps {
  image?: string;
  className?: string;
  ior?: number;             // Index of refraction (default: 1.6)
  dispersion?: number;      // Chromatic dispersion (default: 0.04)
  glassColor?: string;      // Hex color of glass (default: "#e0f2fe" - sky-100)
  glassOpacity?: number;    // Opacity of the glass body (default: 0.12)
  size?: number;            // Size of the cube (default: 1.5)
  autoRotateSpeed?: number; // Speed of rotation around the center axis (default: 0.006)
}

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vCubeCenterViewZ;

  void main() {
    // Transform normal to view space
    vNormal = normalize(normalMatrix * normal);
    
    // Transform vertex position to view space
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = mvPosition.xyz;
    
    // Pass the center of the cube in view space (needed for virtual plane depth)
    vCubeCenterViewZ = (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0)).z;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform sampler2D uImageTex;
  uniform vec2 uImageSize;
  uniform float uIor;
  uniform vec3 uGlassColor;
  uniform float uGlassOpacity;
  uniform float uDispersion;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vCubeCenterViewZ;

  void main() {
    vec3 normal = normalize(vNormal);
    
    // Camera is looking along (0, 0, -1) in view space for an orthographic view
    vec3 I = vec3(0.0, 0.0, -1.0);
    
    // Indices of refraction for Red, Green, and Blue channels to create chromatic dispersion
    float etaR = 1.0 / (uIor - uDispersion);
    float etaG = 1.0 / uIor;
    float etaB = 1.0 / (uIor + uDispersion);
    
    // Refract incoming rays
    vec3 R_r = refract(I, normal, etaR);
    vec3 R_g = refract(I, normal, etaG);
    vec3 R_b = refract(I, normal, etaB);
    
    // Find intersections with the virtual plane at z = vCubeCenterViewZ
    float t_r = (abs(R_r.z) > 0.0001) ? (vCubeCenterViewZ - vViewPosition.z) / R_r.z : 0.0;
    float t_g = (abs(R_g.z) > 0.0001) ? (vCubeCenterViewZ - vViewPosition.z) / R_g.z : 0.0;
    float t_b = (abs(R_b.z) > 0.0001) ? (vCubeCenterViewZ - vViewPosition.z) / R_b.z : 0.0;
    
    vec3 Q_r = vViewPosition + t_r * R_r;
    vec3 Q_g = vViewPosition + t_g * R_g;
    vec3 Q_b = vViewPosition + t_b * R_b;
    
    float halfW = uImageSize.x / 2.0;
    float halfH = uImageSize.y / 2.0;
    
    float r = 0.0;
    float g = 0.0;
    float b = 0.0;
    float rAlpha = 0.0;
    float gAlpha = 0.0;
    float bAlpha = 0.0;
    
    // Sample channels independently with boundary checks
    if (Q_r.x >= -halfW && Q_r.x <= halfW && Q_r.y >= -halfH && Q_r.y <= halfH) {
      vec2 uv = vec2(Q_r.x / uImageSize.x + 0.5, Q_r.y / uImageSize.y + 0.5);
      vec4 tex = texture2D(uImageTex, uv);
      r = tex.r;
      rAlpha = tex.a;
    }
    
    if (Q_g.x >= -halfW && Q_g.x <= halfW && Q_g.y >= -halfH && Q_g.y <= halfH) {
      vec2 uv = vec2(Q_g.x / uImageSize.x + 0.5, Q_g.y / uImageSize.y + 0.5);
      vec4 tex = texture2D(uImageTex, uv);
      g = tex.g;
      gAlpha = tex.a;
    }
    
    if (Q_b.x >= -halfW && Q_b.x <= halfW && Q_b.y >= -halfH && Q_b.y <= halfH) {
      vec2 uv = vec2(Q_b.x / uImageSize.x + 0.5, Q_b.y / uImageSize.y + 0.5);
      vec4 tex = texture2D(uImageTex, uv);
      b = tex.b;
      bAlpha = tex.a;
    }
    
    vec3 imageColor = vec3(r, g, b);
    float imageAlpha = (rAlpha + gAlpha + bAlpha) / 3.0;
    
    // Blinn-Phong specular highlight for a shiny glass finish
    vec3 lightDir = normalize(vec3(1.2, 1.5, 2.0)); // Top-right-front light source
    vec3 halfDir = normalize(lightDir + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(normal, halfDir), 0.0), 48.0);
    vec3 specularColor = vec3(1.0, 1.0, 1.0) * spec * 0.95;
    
    // Fresnel reflection term for high reflectivity at glancing angles
    float fresnel = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 3.5);
    vec3 reflectionColor = vec3(1.0) * fresnel * 0.6;
    
    // Combine base glass body and refracted image
    vec3 baseGlass = uGlassColor * uGlassOpacity;
    vec3 color = mix(baseGlass, imageColor, imageAlpha);
    
    // Add specular highlights and edge reflections
    color += specularColor + reflectionColor;
    
    // Compute alpha channel to allow background blending
    float alpha = max(imageAlpha, uGlassOpacity) + spec * 0.5 + fresnel * 0.4;
    
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
  }
`;

const Cube: React.FC<CubeProps> = ({
  image,
  className = "",
  ior = 1.6,
  dispersion = 0.04,
  glassColor = "#e0f2fe",
  glassOpacity = 0.12,
  size = 1.5,
  autoRotateSpeed = 0.006,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const currentTilt = useRef({ x: 0, y: 0 });
  const targetTilt = useRef({ x: 0, y: 0 });

  // Handle image loading and aspect ratio updates
  useEffect(() => {
    if (!image) return;

    const loader = new THREE.TextureLoader();
    let isMounted = true;

    loader.load(
      image,
      (texture) => {
        if (!isMounted) {
          texture.dispose();
          return;
        }
        
        // Prevent pixelated stretching and filter mipmapping issues
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        
        const img = texture.image;
        const aspect = img.width / img.height;
        
        // Determine bounds of virtual plane
        const sizeVec = new THREE.Vector2(1.0, 1.0);
        if (aspect > 1) {
          sizeVec.set(1.0, 1.0 / aspect);
        } else {
          sizeVec.set(aspect, 1.0);
        }

        if (materialRef.current) {
          materialRef.current.uniforms.uImageTex.value = texture;
          materialRef.current.uniforms.uImageSize.value = sizeVec;
          materialRef.current.needsUpdate = true;
        }
      },
      undefined,
      (err) => {
        console.error("Error loading image for Cube component:", err);
      }
    );

    return () => {
      isMounted = false;
    };
  }, [image]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // SCENE & RENDERER SETUP
    const scene = new THREE.Scene();
    
    const initialWidth = container.clientWidth || 300;
    const initialHeight = container.clientHeight || 300;
    const aspect = initialWidth / initialHeight;
    
    // We use an orthographic view as requested
    const frustumSize = 3.0;
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      100
    );
    
    // Position camera along view axis and look at center
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(initialWidth, initialHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background

    // Clean container and append canvas
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // GLASS CUBE GEOMETRY & MATERIAL
    let geometry: THREE.BufferGeometry;
    try {
      // Create rounded beveled edges for premium glass reflections
      geometry = new RoundedBoxGeometry(size, size, size, 5, 0.06);
    } catch (e) {
      // Fallback if RoundedBoxGeometry fails or has loading issues
      geometry = new THREE.BoxGeometry(size, size, size);
    }

    // 1x1 Transparent data texture fallback before image loads
    const fallbackTex = new THREE.DataTexture(
      new Uint8Array([0, 0, 0, 0]),
      1,
      1,
      THREE.RGBAFormat
    );
    fallbackTex.needsUpdate = true;

    const threeColor = new THREE.Color(glassColor);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uImageTex: { value: fallbackTex },
        uImageSize: { value: new THREE.Vector2(1.0, 1.0) },
        uIor: { value: ior },
        uDispersion: { value: dispersion },
        uGlassColor: { value: threeColor },
        uGlassOpacity: { value: glassOpacity },
      },
      transparent: true,
      depthWrite: false, // Avoid blocking pixel reads in transparency sorting
      side: THREE.DoubleSide,
    });
    materialRef.current = material;

    // PIVOT & MESH HIERARCHY
    const pivotGroup = new THREE.Group();
    const cubeMesh = new THREE.Mesh(geometry, material);

    // Standard isometric orientation to point a corner directly at camera:
    // 1. Rotate 45 deg on Y
    // 2. Rotate 35.264 deg on X
    cubeMesh.rotation.y = Math.PI / 4;
    cubeMesh.rotation.x = Math.atan(1 / Math.sqrt(2));

    pivotGroup.add(cubeMesh);
    scene.add(pivotGroup);

    // INTERACTIVE POINTER EVENTS
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      // Control tilt intensity (X-movement tilts Y, Y-movement tilts X)
      targetTilt.current.x = y * 0.35;
      targetTilt.current.y = x * 0.35;
    };

    const handlePointerLeave = () => {
      targetTilt.current.x = 0;
      targetTilt.current.y = 0;
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    // RESPONSIVE RESIZING
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;

      const currentAspect = w / h;
      camera.left = (frustumSize * currentAspect) / -2;
      camera.right = (frustumSize * currentAspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = frustumSize / -2;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // ANIMATION LOOP
    let animationFrameId: number;
    let spinAngle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto rotation around camera line of sight (Z axis)
      spinAngle += autoRotateSpeed;
      pivotGroup.rotation.z = spinAngle;

      // Interpolate hover tilt using smooth damping lerp
      currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * 0.08;
      currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * 0.08;

      // Apply the hover tilt to pivotGroup X and Y (leaving Z for the continuous rotation)
      pivotGroup.rotation.x = currentTilt.current.x;
      pivotGroup.rotation.y = currentTilt.current.y;

      renderer.render(scene, camera);
    };

    animate();

    // CLEANUP ON UNMOUNT
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      fallbackTex.dispose();
      renderer.dispose();
    };
  }, [ior, dispersion, glassColor, glassOpacity, size, autoRotateSpeed]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[300px] select-none cursor-grab active:cursor-grabbing ${className}`}
    />
  );
};

export default Cube;
