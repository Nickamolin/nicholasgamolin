"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLoading } from "@/components/LoadingProvider";

export default function LoadingScreen() {
    const pathname = usePathname();
    const { isTransitioning } = useLoading();

    const [isLogoLoaded, setIsLogoLoaded] = useState(false);
    const [isWindowLoaded, setIsWindowLoaded] = useState(false);
    const [isAppLoaded, setIsAppLoaded] = useState(false);
    const [isOpaque, setIsOpaque] = useState(true);
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        // Check if the window is already loaded
        if (document.readyState === "complete") {
            setIsWindowLoaded(true);
        } else {
            const handleWindowLoad = () => setIsWindowLoaded(true);
            window.addEventListener("load", handleWindowLoad);
            return () => window.removeEventListener("load", handleWindowLoad);
        }
    }, []);

    useEffect(() => {
        if (pathname !== "/") {
            setIsLogoLoaded(true);
            return;
        }

        // Listen for the custom event from Logo3D.tsx
        const handleLogoLoaded = () => setIsLogoLoaded(true);
        window.addEventListener("logo-loaded", handleLogoLoaded);
        return () => window.removeEventListener("logo-loaded", handleLogoLoaded);
    }, [pathname]);

    // Check for initial load completion
    useEffect(() => {
        if (isLogoLoaded && isWindowLoaded) {
            setIsAppLoaded(true);
        }
    }, [isLogoLoaded, isWindowLoaded]);

    // Handle visibility and opacity transitions
    useEffect(() => {
        if (isTransitioning) {
            // When a navigation transition starts:
            setIsHidden(false); // Make it present in the DOM
            // Use a tiny timeout to allow the DOM node to exist before triggering opacity
            const timeout = setTimeout(() => setIsOpaque(true), 10);
            return () => clearTimeout(timeout);
        } else if (isAppLoaded) {
            // When everything is loaded and NOT transitioning:
            const fadeTimeout = setTimeout(() => {
                setIsOpaque(false); // Start the fading animation

                const hideTimeout = setTimeout(() => {
                    setIsHidden(true); // Completely remove from DOM after fade finishes
                }, 500); // Duration match with CSS transition

                return () => clearTimeout(hideTimeout);
            }, 400); // Buffer before starting fade out

            return () => clearTimeout(fadeTimeout);
        }
    }, [isTransitioning, isAppLoaded, pathname]);

    useEffect(() => {
        if (!isHidden || isTransitioning) {
            window.scrollTo(0, 0);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [isHidden, isTransitioning]);

    if (isHidden) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-500 ${isOpaque ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
        >
            <div className="relative flex flex-col items-center justify-center">
                {/* Pulsing SVG Logo */}
                <div className="animate-pulse">
                    <Image
                        src="/LogoSVG.svg"
                        alt="Loading..."
                        width={100}
                        height={100}
                        className="invert opacity-80"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
