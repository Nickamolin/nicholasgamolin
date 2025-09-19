"use client"
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1 / 1, 0.1, 1000);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(300, 300);
      renderer.setClearColor(0x000000, 0); // transparent background
      containerRef.current?.appendChild(renderer.domElement);

      camera.position.z = 4;

      // ✅ LIGHTING
      const directionalLight = new THREE.DirectionalLight(0xffffff, 15);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      // Material
      const whiteGlossyMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.8,
        roughness: 0.2,
      });

      let model: THREE.Object3D | null = null;

      // LOAD GLB MODEL
      const loader = new GLTFLoader();
      loader.load(
        "/Logo.glb", // put your model inside `public/`
        (gltf) => {
          model = gltf.scene;

          model.traverse((child: any) => {
            if (child.isMesh) {
              child.material = whiteGlossyMaterial;
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          model.scale.set(1, 1, 1);
          model.position.set(0, 0, 0);
          scene.add(model);
        },
        undefined,
        (error) => console.error("Error loading GLB:", error)
      );

      // ORBIT CONTROLS with inertia (desktop + mobile)
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; // inertia
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.8;
      controls.enableZoom = false; // disable zoom
      controls.enablePan = false;  // disable pan

      let isUserInteracting = false;
      let spinFactor = 1; // 1 = full auto-spin, 0 = paused
      const spinFadeSpeed = 0.005; // ✅ gentle fade (~3–4s)

      controls.addEventListener("start", () => {
        isUserInteracting = true;
        spinFactor = 0; // pause spin while dragging
      });

      controls.addEventListener("end", () => {
        isUserInteracting = false;
        // spinFactor will fade back in gradually
      });

      // ANIMATION LOOP
      const animate = () => {
        requestAnimationFrame(animate);

        if (model) {
          if (!isUserInteracting) {
            // Gradually restore spinFactor → 1
            spinFactor += (1 - spinFactor) * spinFadeSpeed;

            // Apply auto-spin scaled by spinFactor
            model.rotation.y += 0.01 * spinFactor; // ✅ restored to original speed
            model.rotation.x += 0.01 * spinFactor;
          }
        }

        controls.update(); // apply damping inertia
        renderer.render(scene, camera);
      };
      animate();

      // HANDLE RESIZE (always 300x300 + Retina)
      const handleResize = () => {
        const width = 300;
        const height = 300;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        controls.dispose();
      };
    }
  }, []);

  return <div ref={containerRef} />;
};

export default ThreeScene;
