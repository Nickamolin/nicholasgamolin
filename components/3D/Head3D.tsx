"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

interface Head3DProps {
  className?: string;
}

const Head3D: React.FC<Head3DProps> = ({ className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initialization
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    scene.fog = new THREE.Fog(0x000000, 11, 13.7);

    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.01, 1000);
    camera.position.set(0, 0, 4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
    renderer.setSize(container.clientWidth, container.clientHeight);
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Post Processing
    const renderPass = new RenderPass(scene, camera);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composerRef.current = composer;

    // Controls
    const controls = new TrackballControls(camera, renderer.domElement);
    controls.noZoom = true;
    controls.noPan = true;

    // Load Model
    const loader = new GLTFLoader();
    loader.load(
      "/models/Head.glb",
      (gltf) => {
        const pointsGroup = new THREE.Group();

        gltf.scene.traverse((child: any) => {
          if (child.isMesh) {
            const geometry = child.geometry;
            const material = new THREE.MeshStandardMaterial({
              color: 0xffffff,
              transparent: false,
              wireframe: true,
              emissive: 0xffffff,
              emissiveIntensity: 1,
            });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.copy(child.position);
            mesh.rotation.copy(child.rotation);
            mesh.scale.copy(child.scale);

            pointsGroup.add(mesh);
          }
        });

        modelRef.current = pointsGroup;
        scene.add(pointsGroup);

        // Center and fit
        pointsGroup.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(pointsGroup);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);

        pointsGroup.position.sub(center);
        pointsGroup.updateMatrixWorld(true);

        const fov = THREE.MathUtils.degToRad(camera.fov);
        let cameraZ = Math.abs((maxDim / 1.5) / Math.tan(fov / 2));
        cameraZ *= 1.1; // Tighten the fit

        camera.position.set(0, 0, cameraZ);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();

        window.dispatchEvent(new Event("logo-loaded"));
      },
      undefined,
      (err) => console.error("Error loading Head.glb:", err)
    );

    // Resize Handling
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current || !composerRef.current) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);
      composerRef.current.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation loop
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      if (modelRef.current) {
        modelRef.current.rotation.y += 0.003;
      }

      controls.update();
      if (composerRef.current) {
        composerRef.current.render();
      }
    };

    animate();

    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full h-full active:cursor-grabbing ${isHovered ? 'cursor-grab' : ''} ${className}`}
    />
  );
};

export default Head3D;