"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useLoading } from "./LoadingProvider";
import LoadingAnimation from "./LoadingAnimation";

export default function LoadingScreen() {
    const pathname = usePathname();
    const { isTransitioning, isInitialLoad } = useLoading();

    const [isLogoLoaded, setIsLogoLoaded] = useState(false);
    const [isAppLoaded, setIsAppLoaded] = useState(false);
    const [isOpaque, setIsOpaque] = useState(true);
    const [isHidden, setIsHidden] = useState(false);

    // Store ALL timer/frame IDs in refs so they can be cancelled at any point.
    const fadeInFrame1Ref = useRef<number | null>(null);
    const fadeInFrame2Ref = useRef<number | null>(null);
    const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fadeOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasScrolledRef = useRef(false);

    const clearAllTimers = () => {
        if (fadeInFrame1Ref.current) cancelAnimationFrame(fadeInFrame1Ref.current);
        if (fadeInFrame2Ref.current) cancelAnimationFrame(fadeInFrame2Ref.current);
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        fadeInFrame1Ref.current = null;
        fadeInFrame2Ref.current = null;
        scrollTimerRef.current = null;
        fadeOutTimerRef.current = null;
        hideTimerRef.current = null;
    };

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
        // Always cancel any in-flight timers before setting up new ones.
        // This prevents a stale hideTimeout from killing the overlay mid-transition.
        clearAllTimers();

        if (isTransitioning) {
            hasScrolledRef.current = false;
            setIsHidden(false);
            setIsOpaque(false); // ensure we start from opacity-0
            document.body.style.overflow = "hidden";

            // We use a small setTimeout instead of double rAF to guarantee 
            // the browser paints the opacity-0 state before transitioning.
            // This fixes the 'pop-in' race condition that occurs when the main thread is idle.
            fadeInFrame1Ref.current = setTimeout(() => {
                setIsOpaque(true);

                // Scroll to top only after the overlay is fully opaque (duration-500)
                scrollTimerRef.current = setTimeout(() => {
                    if (!hasScrolledRef.current) {
                        window.scrollTo(0, 0);
                        hasScrolledRef.current = true;
                    }
                }, 500);
            }, 20) as any;

        } else if (isAppLoaded) {
            // Not transitioning and page is ready — start fade-out sequence
            fadeOutTimerRef.current = setTimeout(() => {
                setIsOpaque(false);

                hideTimerRef.current = setTimeout(() => {
                    setIsHidden(true);
                    document.body.style.overflow = "";
                }, 500); // matches CSS duration-500
            }, 400); // brief buffer before fading
        }

        return clearAllTimers;
    }, [isTransitioning, isAppLoaded]);

    if (isHidden) return null;

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center bg-black transition-opacity duration-500 ${isInitialLoad ? "z-[9999]" : "z-[90]"
                } ${isOpaque ? "opacity-100" : "opacity-0 pointer-events-none"
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
