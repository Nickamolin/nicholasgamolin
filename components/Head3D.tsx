"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

interface Head3DProps {
  className?: string;
}

const Head3D: React.FC<Head3DProps> = ({ className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initialization
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    // scene.fog = new THREE.Fog(0x000000, 14, 18.5);

    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.01, 1000);
    camera.position.set(0, 0, 4);
    cameraRef.current = camera;
    scene.add(camera);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.position.set(5, 10, 7.5);
    camera.add(directionalLight);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance

    // Extend the canvas by a specific factor
    const canvasScaleFactor = 1;

    // Add absolute positioning to center the larger canvas within the smaller container
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '50%';
    renderer.domElement.style.left = '50%';
    renderer.domElement.style.transform = 'translate(-50%, -50%)';
    // Let resize handler take care of sizing
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    {/* POST PROCESSING */ }
    const renderPass = new RenderPass(scene, camera);
    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);

    // BLOOM
    // const bloomPass = new UnrealBloomPass(
    //   new THREE.Vector2(window.innerWidth, window.innerHeight),
    //   0.5, // strength
    //   0.5, // radius
    //   0.01 // threshold
    // );
    // composer.addPass(bloomPass);

    // AFTERIMAGE
    // const afterimagePass = new AfterimagePass(0.9);
    // composer.addPass(afterimagePass);

    // Controls
    // const controls = new OrbitControls(camera, renderer.domElement);
    const controls = new TrackballControls(camera, renderer.domElement);
    controls.noZoom = true;
    controls.noPan = true;

    // Load Model (wireframe)
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
              roughness: 1,
              metalness: 0,
              flatShading: true,
              wireframe: true
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
        let cameraZ = Math.abs((maxDim / 1) / Math.tan(fov / 2));
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
      if (!container || !rendererRef.current || !cameraRef.current) return;

      const baseWidth = container.clientWidth;
      const baseHeight = container.clientHeight;

      cameraRef.current.aspect = baseWidth / baseHeight;
      cameraRef.current.updateProjectionMatrix();

      const extendedWidth = baseWidth * canvasScaleFactor;
      const extendedHeight = baseHeight * canvasScaleFactor;

      rendererRef.current.setSize(extendedWidth, extendedHeight);
      composer.setSize(extendedWidth, extendedHeight);

      // Ensure the canvas CSS dimensions match the extended size
      rendererRef.current.domElement.style.width = `${extendedWidth}px`;
      rendererRef.current.domElement.style.height = `${extendedHeight}px`;
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
      composer.render();
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

  return <div ref={containerRef} className={`relative overflow-visible w-full h-full min-h-[300px] ${className}`} />;
};

export default Head3D;