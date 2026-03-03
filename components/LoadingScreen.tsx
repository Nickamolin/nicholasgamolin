"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function LoadingScreen() {
    const [isLogoLoaded, setIsLogoLoaded] = useState(false);
    const [isWindowLoaded, setIsWindowLoaded] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
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
        // Listen for the custom event from Logo3D.tsx
        const handleLogoLoaded = () => setIsLogoLoaded(true);
        window.addEventListener("logo-loaded", handleLogoLoaded);
        return () => window.removeEventListener("logo-loaded", handleLogoLoaded);
    }, []);

    useEffect(() => {
        // When both conditions are met, trigger fade out
        if (isLogoLoaded && isWindowLoaded) {
            // Add a tiny delay to ensure a smooth transition and no flickering
            const fadeTimeout = setTimeout(() => {
                setIsFadingOut(true);

                // Wait for the fade out transition to complete before hiding
                // The duration here should match the CSS transition duration
                setTimeout(() => {
                    setIsHidden(true);
                }, 500); // 500ms fade transition
            }, 500);

            return () => clearTimeout(fadeTimeout);
        }
    }, [isLogoLoaded, isWindowLoaded]);

    useEffect(() => {
        if (!isHidden) {
            // Force scroll to top and lock body scrolling
            window.scrollTo(0, 0);
            document.body.style.overflow = "hidden";
        } else {
            // Unlock scrolling once hidden
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isHidden]);

    if (isHidden) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-500 ${isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
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
