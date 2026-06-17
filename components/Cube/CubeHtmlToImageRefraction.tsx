"use client";

import React, { useRef, useEffect, useState, forwardRef } from "react";
import * as THREE from "three";
import { toCanvas } from "html-to-image";
import Cube, { CubeProps, CubeHandle } from "./Cube";

interface CubeHtmlToImageRefractionProps extends Omit<CubeProps, "image" | "texture"> {
  children: React.ReactNode;
}

const CubeHtmlToImageRefraction = forwardRef<CubeHandle, CubeHtmlToImageRefractionProps>(
  ({ children, className = "", ...cubeProps }, ref) => {
    const hiddenDomRef = useRef<HTMLDivElement>(null);
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const [visibleChildren, setVisibleChildren] = useState(children);

    useEffect(() => {
      if (!hiddenDomRef.current) return;
      let isMounted = true;

      const captureDOM = async () => {
        if (!hiddenDomRef.current) return;
        try {
          const canvas = await toCanvas(hiddenDomRef.current, {
            cacheBust: true,
            pixelRatio: Math.min(window.devicePixelRatio, 2),
            skipAutoScale: true,
            style: {
              opacity: "1",
            },
          });
          if (!isMounted) return;

          const newTexture = new THREE.CanvasTexture(canvas);
          newTexture.minFilter = THREE.LinearFilter;
          newTexture.generateMipmaps = false;
          setTexture(newTexture);
          
          // Only update the visible HTML once the texture is ready
          setVisibleChildren(children);
        } catch (err) {
          console.error("Failed to capture DOM for refraction", err);
        }
      };

      // Capture immediately to stay as fast as possible
      captureDOM();

      return () => {
        isMounted = false;
      };
    }, [children]);

    return (
      <div className={`relative w-full h-full ${className}`}>
        {/* Hidden Off-Screen DOM for capturing new state */}
        <div
          ref={hiddenDomRef}
          className="absolute inset-0 flex items-center justify-center bg-transparent pointer-events-none"
          style={{ opacity: 0 }}
        >
          {children}
        </div>

        {/* Visible Real DOM (synced with the texture state) */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-transparent"
        >
          {visibleChildren}
        </div>

        {/* Refractive WebGL Overlay */}
        <div className="absolute inset-0" style={{ zIndex: 10 }}>
          {texture && (
            <Cube
              ref={ref}
              {...cubeProps}
              texture={texture}
              className="w-full h-full"
            />
          )}
        </div>
      </div>
    );
  }
);

CubeHtmlToImageRefraction.displayName = "CubeHtmlToImageRefraction";
export default CubeHtmlToImageRefraction;
