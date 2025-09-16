"use client"
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1 / 1, 0.1, 1000);

      const renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(300, 300);
      renderer.setClearColor(0x000000, 0); // transparent background
      containerRef.current?.appendChild(renderer.domElement);

      camera.position.z = 4; // further back for model

      // LIGHTS
      const directionalLight = new THREE.DirectionalLight(0xffffff, 15);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      // Glossy white material
      const whiteGlossyMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.8,
        roughness: 0.2,
      });

      let model: THREE.Object3D | null = null;

      // LOAD GLB MODEL
      const loader = new GLTFLoader();
      loader.load(
        '/Logo.glb', // put your model inside `public/`
        (gltf) => {
          model = gltf.scene;

          model.traverse((child: any) => {
            if (child.isMesh) {
              child.material = whiteGlossyMaterial;
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });

          model.scale.set(1, 1, 1); // adjust if too small/large
          model.position.set(0, 0, 0);
          scene.add(model);
        },
        undefined,
        (error) => console.error('Error loading GLB:', error)
      );

      // ANIMATION LOOP (single loop for everything)
      const animate = () => {
        requestAnimationFrame(animate);

        if (model) {
          model.rotation.y += 0.01; // rotate the model
          model.rotation.x += 0.01;
        }

        renderer.render(scene, camera);
      };
      animate();

      // HANDLE RESIZE
      const handleResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  return <div ref={containerRef} />;
};

export default ThreeScene;
