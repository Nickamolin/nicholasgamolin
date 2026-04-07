"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLoading } from "@/components/LoadingProvider";
import LoadingAnimation from "./LoadingAnimation";

export default function LoadingScreen() {
    const pathname = usePathname();
    const { isTransitioning } = useLoading();

    const [isLogoLoaded, setIsLogoLoaded] = useState(false);
    const [isAppLoaded, setIsAppLoaded] = useState(false);
    const [isOpaque, setIsOpaque] = useState(true);
    const [isHidden, setIsHidden] = useState(false);

    // Track whether we've already scrolled for this transition to avoid double-scrolling
    const hasScrolledRef = useRef(false);

    useEffect(() => {
        if (pathname !== "/") {
            // Non-home pages: nothing special to wait for, mark ready immediately
            setIsLogoLoaded(true);
            return;
        }

        // Home page: wait for the 3D logo GLB to load before fading out
        const handleLogoLoaded = () => setIsLogoLoaded(true);
        window.addEventListener("logo-loaded", handleLogoLoaded);
        return () => window.removeEventListener("logo-loaded", handleLogoLoaded);
    }, [pathname]);

    // Mark app as loaded as soon as our primary asset signal fires
    useEffect(() => {
        if (isLogoLoaded) {
            setIsAppLoaded(true);
        }
    }, [isLogoLoaded]);

    // Handle visibility and opacity transitions
    useEffect(() => {
        if (isTransitioning) {
            // When a navigation transition starts:
            hasScrolledRef.current = false;
            setIsHidden(false); // Make it present in the DOM
            document.body.style.overflow = "hidden"; // Lock scroll immediately

            // Use a tiny timeout to allow the DOM node to exist before triggering opacity
            const fadeInTimeout = setTimeout(() => {
                setIsOpaque(true);

                // Once the fade-in CSS transition completes, scroll to top behind the opaque overlay
                const scrollTimeout = setTimeout(() => {
                    if (!hasScrolledRef.current) {
                        window.scrollTo(0, 0);
                        hasScrolledRef.current = true;
                    }
                }, 500); // matches the CSS transition duration (duration-500)

                return () => clearTimeout(scrollTimeout);
            }, 10);

            return () => clearTimeout(fadeInTimeout);
        } else if (isAppLoaded) {
            // When everything is loaded and NOT transitioning — start fade-out
            const fadeTimeout = setTimeout(() => {
                setIsOpaque(false); // Start the fading animation

                const hideTimeout = setTimeout(() => {
                    setIsHidden(true); // Completely remove from DOM after fade finishes
                    document.body.style.overflow = ""; // Restore scrolling
                }, 500); // Duration matches CSS transition

                return () => clearTimeout(hideTimeout);
            }, 400); // Buffer before starting fade out

            return () => clearTimeout(fadeTimeout);
        }
    }, [isTransitioning, isAppLoaded]);

    if (isHidden) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-500 ${isOpaque ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
        >
            <div className="relative flex flex-col items-center justify-center">
                <LoadingAnimation
                    isVisible={isOpaque}
                    className="w-48 h-48 md:w-64 md:h-64"
                />
            </div>
        </div>
    );
}
