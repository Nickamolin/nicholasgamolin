"use client";

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface LoadingAnimation3DHandle {
  resetRotation: () => void;
  // Freeze/thaw the animation clock in place (no seek). Used to keep this in
  // lockstep with a sibling animation when the page loses focus/visibility.
  setFrozen: (frozen: boolean) => void;
  // Seek the mixer to an absolute time (in seconds, wraps at clip duration).
  // Used to re-align with the reference video after returning from a hidden tab.
  syncMixerToTime: (seconds: number) => void;
  // When set, the mixer is slaved to this external time source on every rAF
  // frame instead of the GLB's own delta accumulator. This is the only way to
  // guarantee zero drift — delta accumulation always compounds floating-point
  // error over time. Pass null to return to self-driven mode.
  setMasterTimeGetter: (getter: (() => number | null) | null) => void;
}

export interface LoadingAnimation3DProps {
  className?: string;
  playbackSpeed?: number;
  modelScale?: number;
  targetFps?: number;
  orthoBlend?: number;
  materialType?: string;
  isPaused?: boolean;
  hasStarted?: boolean; // Gate to hold on the first frame until a synced start signal arrives
  onReady?: () => void; // Fired once the model + mixer are set up and able to play
}

const LoadingAnimation3D = forwardRef<LoadingAnimation3DHandle, LoadingAnimation3DProps>(({
  className = "",
  playbackSpeed = 1.0,
  modelScale = 1.0,
  targetFps = 120,
  orthoBlend = 0.0,
  materialType = 'default',
  isPaused = false,
  hasStarted = true,
  onReady,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs for dynamic updates
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());
  const customMaterialsRef = useRef<Record<string, THREE.Material>>({});
  const controlsRef = useRef<OrbitControls | null>(null);

  // When true, the animation clock holds its current time (frozen in place).
  // Read live inside the rAF loop so freezing takes effect on the next frame.
  const frozenRef = useRef(false);
  // Flipped to true on every thaw so the first rAF tick after resuming always
  // gets delta = 0. This prevents the mixer from lurching ahead of the video:
  // video.play() is async (media pipeline latency) and may not have started
  // playing by the time the first rAF fires, so we hold the mixer in place for
  // that one tick to give the video a chance to catch up.
  const justThawedRef = useRef(false);
  // When set, drives the mixer from this external time source on every frame
  // (master-clock mode) instead of the GLB's own rAF delta accumulator.
  const masterTimeGetterRef = useRef<(() => number | null) | null>(null);

  // Keep a ref to props to avoid stale closures in the animation loop
  const propsRef = useRef({ targetFps, isPaused, orthoBlend, materialType, playbackSpeed, modelScale, hasStarted });

  const apiRef = useRef({
    resetRotation: () => {
      if (controlsRef.current) {
        controlsRef.current.reset();
      }
    },
  });

  useImperativeHandle(ref, () => ({
    resetRotation: () => apiRef.current.resetRotation(),
    setFrozen: (frozen: boolean) => {
      if (frozenRef.current && !frozen) justThawedRef.current = true;
      frozenRef.current = frozen;
    },
    syncMixerToTime: (seconds: number) => {
      const mixer = mixerRef.current;
      if (!mixer) return;
      const clipDuration = 70 / 30;
      // mixer.setTime() calls update(t) internally, which scales by timeScale.
      // Snapshot and force 1× so the seek lands at the exact target position;
      // the animate loop restores the real playbackSpeed on the next tick.
      const prev = mixer.timeScale;
      mixer.timeScale = 1;
      mixer.setTime(seconds % clipDuration);
      mixer.timeScale = prev;
    },
    setMasterTimeGetter: (getter) => { masterTimeGetterRef.current = getter; },
  }));

  // Sync props to ref and handle material/scale updates
  useEffect(() => {
    propsRef.current = { targetFps, isPaused, orthoBlend, materialType, playbackSpeed, modelScale, hasStarted };

    if (modelGroupRef.current) {
      modelGroupRef.current.scale.set(modelScale, modelScale, modelScale);
      
      modelGroupRef.current.traverse((child: any) => {
        if (child.isMesh) {
          const orig = originalMaterialsRef.current.get(child);
          if (materialType === 'default') {
            if (orig) child.material = orig;
          } else {
            const customMat = customMaterialsRef.current[materialType];
            if (customMat) child.material = customMat;
          }
        }
        if (child.isLineSegments && child.userData.isWireframe) {
          child.visible = (materialType === 'wireframe');
        }
      });
    }
  }, [targetFps, isPaused, orthoBlend, materialType, playbackSpeed, modelScale, hasStarted]);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    
    const container = containerRef.current;
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // Setup Custom Materials
    const normalMat = new THREE.MeshNormalMaterial();
    // We use a completely invisible material for the faces, and rely on
    // EdgesGeometry line segments (added below) to draw the clean wireframe
    const wireframeMat = new THREE.MeshBasicMaterial({ visible: false });

    customMaterialsRef.current = {
      normal: normalMat,
      wireframe: wireframeMat
    };

    // Load Model
    const loader = new GLTFLoader();
    const clock = new THREE.Clock();

    // Guard against stale callbacks: when the GLB is browser-cached the
    // loader.load() callback fires almost synchronously on remount, which
    // can race with the previous mount's callback and run TWO animate loops
    // simultaneously (= 2× playback speed). This flag aborts any callback
    // that fires after cleanup.
    let isCleanedUp = false;
    let rafId: number;

    loader.load(
      "/models/LoadingAnimation.glb",
      (gltf) => {
        // Abort if the component was unmounted while the GLB was loading.
        // Without this, a cached GLB fires the callback nearly synchronously
        // on remount, starting a second animate() loop alongside the new one.
        if (isCleanedUp) return;

        const model = gltf.scene;
        
        // Cache original materials and apply initial material
        model.traverse((child: any) => {
          if (child.isMesh) {
            if (child.material) {
              originalMaterialsRef.current.set(child, child.material);
            }
            
            // Create a clean wireframe using EdgesGeometry. This ignores coplanar
            // diagonal edges created by GLTF triangulation.
            const edges = new THREE.EdgesGeometry(child.geometry);
            const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff });
            const lineSegments = new THREE.LineSegments(edges, lineMat);
            lineSegments.userData.isWireframe = true;
            lineSegments.visible = propsRef.current.materialType === 'wireframe';
            child.add(lineSegments);
          }
        });

        // Apply initial material
        const initialMat = propsRef.current.materialType;
        if (initialMat !== 'default') {
          model.traverse((child: any) => {
            if (child.isMesh) {
              const customMat = customMaterialsRef.current[initialMat];
              if (customMat) child.material = customMat;
            }
          });
        }

        // Center the model in its own group
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        
        const wrapper = new THREE.Group();
        wrapper.add(model);
        wrapper.scale.set(propsRef.current.modelScale, propsRef.current.modelScale, propsRef.current.modelScale);
        modelGroupRef.current = wrapper;
        scene.add(wrapper);

        // Setup Animation
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;
          
          gltf.animations.forEach((clip) => {
            // Force the clip duration to 70 frames at 30fps (approx 2.333s)
            clip.duration = 70 / 30;
            const action = mixer.clipAction(clip);
            action.play();
          });
        }

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = false;
        controls.enablePan = false;
        controlsRef.current = controls;
        controls.saveState();

        // Animated Reset
        apiRef.current.resetRotation = () => {
          const startPos = camera.position.clone();
          const startTarget = controls.target.clone();
          
          // Original default states
          const endPos = new THREE.Vector3(0, 0, 5);
          const endTarget = new THREE.Vector3(0, 0, 0);
          
          const startTime = performance.now();
          const durationMs = 650;
          
          const animateReset = () => {
            const elapsed = performance.now() - startTime;
            const rawT = Math.min(elapsed / durationMs, 1);
            const t = 1 - Math.pow(1 - rawT, 3); // easeOutCubic
            
            camera.position.lerpVectors(startPos, endPos, t);
            controls.target.lerpVectors(startTarget, endTarget, t);
            controls.update(); // Update internal state
            
            if (rawT < 1) {
              requestAnimationFrame(animateReset);
            }
          };
          requestAnimationFrame(animateReset);
        };

        // Pre-allocate matrices for interpolation
        const perspMat = new THREE.Matrix4();
        const orthoMat = new THREE.Matrix4();

        // Drain any time the clock accumulated during async model load,
        // so the first animation delta starts near zero.
        clock.getDelta();

        let accumulatedTime = 0;

        // Model + mixer are fully set up and able to play. Let the caller know
        // so it can hold this frozen on frame one until a sibling animation
        // (e.g. the pre-rendered video) is also ready, then start both in sync.
        onReady?.();

        // Animation Loop
        const animate = () => {
          rafId = requestAnimationFrame(animate);
          let delta = clock.getDelta();
          const p = propsRef.current;

          (window as any).__glbMixerTime = mixerRef.current?.time;
          // Clamp deltas that accumulated while rAF was fully stopped (tab hidden).
          if (delta > 0.25) delta = 0;
          // On the very first tick after thaw, force delta = 0 regardless of size.
          // video.play() is async — the media pipeline may not have started yet by
          // the time this rAF fires. Holding the mixer for one tick keeps both
          // clocks aligned on resume (no accumulated drift across tab switches).
          if (justThawedRef.current) { delta = 0; justThawedRef.current = false; }

          // Animation Mixer updating.
          if (mixerRef.current && !p.isPaused && p.hasStarted && !frozenRef.current) {
            const masterGetter = masterTimeGetterRef.current;
            if (masterGetter) {
              // Master-clock mode: slave the mixer to the reference video's
              // currentTime on every frame. This is the only way to guarantee
              // zero drift — the two animations share one clock, so floating-
              // point delta accumulation and rAF jitter can never compound.
              // setTime() internally calls update() which respects timeScale;
              // force 1× for an accurate absolute seek.
              const masterTime = masterGetter();
              if (masterTime != null) {
                const clipDuration = 70 / 30;
                mixerRef.current.timeScale = 1;
                mixerRef.current.setTime(masterTime % clipDuration);
              }
            } else {
              // Self-driven mode: advance by rAF delta with optional fps throttle.
              mixerRef.current.timeScale = p.playbackSpeed;
              if (p.targetFps < 60) {
                accumulatedTime += delta;
                const frameTime = 1 / p.targetFps;
                if (accumulatedTime >= frameTime) {
                  const steps = Math.floor(accumulatedTime / frameTime);
                  mixerRef.current.update(steps * frameTime);
                  accumulatedTime -= steps * frameTime;
                }
              } else {
                mixerRef.current.update(delta);
                accumulatedTime = 0;
              }
            }
          }
          
          // Camera Projection Blending
          const aspect = container.clientWidth / container.clientHeight;
          if (aspect > 0 && container.clientWidth > 0 && container.clientHeight > 0) {
            const fov = 40;
            const near = 0.1;
            const far = 1000;
            const distance = 5; // Camera Z distance from target

            // 1. Build Perspective Matrix
            camera.fov = fov;
            camera.aspect = aspect;
            camera.near = near;
            camera.far = far;
            camera.updateProjectionMatrix();
            perspMat.copy(camera.projectionMatrix);

            // 2. Build Orthographic Matrix 
            // Calculate height at distance=5 to match perspective scale exactly
            const visibleHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(fov / 2));
            const orthoWidth = visibleHeight * aspect;
            orthoMat.makeOrthographic(-orthoWidth/2, orthoWidth/2, visibleHeight/2, -visibleHeight/2, near, far);

            // 3. Lerp matrices based on orthoBlend (0 = Persp, 1 = Ortho)
            for (let i = 0; i < 16; i++) {
              camera.projectionMatrix.elements[i] = perspMat.elements[i] * (1 - p.orthoBlend) + orthoMat.elements[i] * p.orthoBlend;
            }
            camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
          }

          if (controls) controls.update();
          renderer.render(scene, camera);
        };
        animate();
      },
      undefined,
      (err) => console.error("Error loading GLB:", err)
    );

    // Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      // Projection matrix is dynamically built in the animate loop
    };
    
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      // Mark as cleaned up first so any in-flight loader callback is dropped.
      isCleanedUp = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      if (controlsRef.current) controlsRef.current.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose materials
      Object.values(customMaterialsRef.current).forEach(mat => mat.dispose());
    };
  }, []); // Rebuilds only on mount

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[280px] select-none cursor-grab active:cursor-grabbing ${className}`}
    />
  );
});

LoadingAnimation3D.displayName = "LoadingAnimation3D";
export default LoadingAnimation3D;
