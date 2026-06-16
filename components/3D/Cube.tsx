"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

interface CubeProps {
  image?: string;
  className?: string;
  ior?: number;             // Index of refraction (default: 1.6)
  dispersion?: number;      // Chromatic dispersion (default: 0.04)
  glassColor?: string;      // Hex color of glass (default: "#e0f2fe")
  glassOpacity?: number;    // Opacity of the glass body (default: 0.12)
  size?: number;            // Size of the cube (default: 1.5)
  depthOffset?: number;     // Multiplier for depth offset behind the center (default: 0.5)
  imageScale?: number;      // Scale multiplier to cover edges and prevent gaps (default: 1.35)
}

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

const fragmentShader = `
  uniform sampler2D uImageTex;
  uniform vec2 uImageSize;
  uniform float uIor;
  uniform vec3 uGlassColor;
  uniform float uGlassOpacity;
  uniform float uDispersion;
  uniform float uDepthOffset;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
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
    
    // Virtual plane positioned behind the center of the cube (portal effect)
    float targetZ = vCubeCenterViewZ - uDepthOffset;
    
    float t_r = (abs(R_r.z) > 0.0001) ? (targetZ - vViewPosition.z) / R_r.z : 0.0;
    float t_g = (abs(R_g.z) > 0.0001) ? (targetZ - vViewPosition.z) / R_g.z : 0.0;
    float t_b = (abs(R_b.z) > 0.0001) ? (targetZ - vViewPosition.z) / R_b.z : 0.0;
    
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
    
    // Glossy glass specular highlights
    vec3 lightDir = normalize(vec3(1.2, 1.5, 2.0));
    vec3 halfDir = normalize(lightDir + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(normal, halfDir), 0.0), 48.0);
    vec3 specularColor = vec3(1.0) * spec * 0.95;
    
    // Fresnel reflection
    float fresnel = pow(1.0 - max(dot(normal, vec3(0.0, 0.0, 1.0)), 0.0), 3.5);
    vec3 reflectionColor = vec3(1.0) * fresnel * 0.6;
    
    vec3 baseGlass = uGlassColor * uGlassOpacity;
    vec3 color = mix(baseGlass, imageColor, imageAlpha);
    
    color += specularColor + reflectionColor;
    
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
  depthOffset = 0.5,
  imageScale = 1.0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

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
        
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        
        const img = texture.image;
        const aspect = img.width / img.height;
        
        // Bounding box of the cube's isometric projection silhouette
        const silWidth = size * Math.sqrt(2);
        const silHeight = size * Math.sqrt(8 / 3);
        const silAspect = silWidth / silHeight; // approx 0.866
        
        // Fit image inside the silhouette using "object-cover" scaling rules
        const sizeVec = new THREE.Vector2();
        if (aspect > silAspect) {
          // Image is wider than the silhouette: fit to height and expand width
          sizeVec.set(silHeight * aspect * imageScale, silHeight * imageScale);
        } else {
          // Image is taller than the silhouette: fit to width and expand height
          sizeVec.set(silWidth * imageScale, (silWidth / aspect) * imageScale);
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
  }, [image, size, imageScale]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    
    const initialWidth = container.clientWidth || 300;
    const initialHeight = container.clientHeight || 300;
    const aspect = initialWidth / initialHeight;
    
    const frustumSize = 3.0;
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      100
    );
    
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(initialWidth, initialHeight);
    renderer.setClearColor(0x000000, 0);

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Trackball Controls to rotate the camera around the cube
    const controls = new TrackballControls(camera, renderer.domElement);
    controls.noZoom = true;
    controls.noPan = true;
    controls.rotateSpeed = 2.5;

    let geometry: THREE.BufferGeometry;
    try {
      geometry = new RoundedBoxGeometry(size, size, size, 5, 0.06);
    } catch (e) {
      geometry = new THREE.BoxGeometry(size, size, size);
    }

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
        uDepthOffset: { value: size * depthOffset },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
    });
    materialRef.current = material;

    // The cube mesh is positioned at the origin and rotated isometrically
    const cubeMesh = new THREE.Mesh(geometry, material);
    cubeMesh.rotation.y = Math.PI / 4;
    cubeMesh.rotation.x = Math.atan(1 / Math.sqrt(2));
    scene.add(cubeMesh);

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
      controls.handleResize();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      fallbackTex.dispose();
      renderer.dispose();
    };
  }, [ior, dispersion, glassColor, glassOpacity, size, depthOffset]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[300px] select-none active:cursor-grabbing cursor-grab ${className}`}
    />
  );
};

export default Cube;
