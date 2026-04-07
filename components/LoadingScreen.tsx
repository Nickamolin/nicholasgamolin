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

    // Store ALL timeout IDs in refs so they can be cancelled at any point,
    // even if they're nested inside other setTimeout callbacks.
    const fadeInTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fadeOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasScrolledRef = useRef(false);

    const clearAllTimers = () => {
        if (fadeInTimerRef.current) clearTimeout(fadeInTimerRef.current);
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        fadeInTimerRef.current = null;
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
            document.body.style.overflow = "hidden";

            // Tiny delay to allow the DOM node to exist before triggering opacity
            fadeInTimerRef.current = setTimeout(() => {
                setIsOpaque(true);

                // Scroll to top only after the overlay is fully opaque (duration-500)
                scrollTimerRef.current = setTimeout(() => {
                    if (!hasScrolledRef.current) {
                        window.scrollTo(0, 0);
                        hasScrolledRef.current = true;
                    }
                }, 500);
            }, 10);

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
