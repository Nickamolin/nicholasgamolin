"use client";

// ─────────────────────────────────────────────────────────────────────────────
// PLAYGROUND-ONLY component.
//
// This is a self-contained copy of the site's pre-rendered loading animation,
// used purely as a reference/experiment surface in the Animation playground.
// It intentionally does NOT import from components/loading so that tweaking
// experiments here can never disturb the real LoadingAnimation the site ships.
// Add playground-only knobs (speed, pause, etc.) freely — this file is a toy.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from "react";
import Image from "next/image";

export interface PreRenderedAnimationHandle {
    // Freeze/thaw playback in place (no seek). Used to keep this in lockstep
    // with a sibling animation when the page loses focus/visibility.
    setFrozen: (frozen: boolean) => void;
    // Returns the video's current playback position so the parent can re-align
    // a sibling animation after returning from a hidden tab.
    getCurrentTime: () => number;
}

type PreRenderedAnimationProps = {
    isVisible?: boolean;
    className?: string;         // Classes for the video element itself (sizing)
    wrapperClassName?: string;  // Classes for the container (positioning/background)
    playbackSpeed?: number;
    isPaused?: boolean;
    hasStarted?: boolean;       // Gate to hold on the first frame until a synced start signal arrives
    onReady?: () => void;       // Fired once the video has buffered its first frame
};

const PreRenderedAnimation = forwardRef<PreRenderedAnimationHandle, PreRenderedAnimationProps>(function PreRenderedAnimation({
    isVisible = true,
    className = "w-48 h-48",
    wrapperClassName = "",
    playbackSpeed = 1.0,
    isPaused = false,
    hasStarted = true,
    onReady,
}, ref) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hasFiredReadyRef = useRef(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    // frozenRef is a focus/visibility freeze applied imperatively by the parent,
    // kept separate from the user's isPaused toggle. Latest isPaused/hasStarted
    // are mirrored into refs so applyPlayback (called imperatively, outside
    // React's render) always reads current values without a stale closure.
    const frozenRef = useRef(false);
    const isPausedRef = useRef(isPaused);
    const hasStartedRef = useRef(hasStarted);
    isPausedRef.current = isPaused;
    hasStartedRef.current = hasStarted;

    // Single source of truth for whether the video should be running. Play only
    // once started, not user-paused, and not frozen; otherwise hold in place
    // (pause keeps currentTime, so freezing never seeks or restarts).
    const applyPlayback = () => {
        const video = videoRef.current;
        if (!video) return;
        if (hasStartedRef.current && !isPausedRef.current && !frozenRef.current) {
            video.play().catch(() => setIsVideoPlaying(false));
        } else {
            video.pause();
        }
    };

    useImperativeHandle(ref, () => ({
        setFrozen: (frozen: boolean) => {
            frozenRef.current = frozen;
            applyPlayback();
        },
        getCurrentTime: () => videoRef.current?.currentTime ?? 0,
    }));

    // Trigger mount on client
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Re-evaluate playback whenever mount / user-pause / start-gate changes.
    // Held paused on the first frame until hasStarted flips true, so it can be
    // kick-started in sync with the GLB (which needs an async fetch + parse
    // before it can play) rather than racing ahead of it.
    useEffect(() => {
        if (hasMounted) applyPlayback();
    }, [hasMounted, isPaused, hasStarted]);

    // Handle playback speed dynamically
    useEffect(() => {
        if (hasMounted && videoRef.current) {
            videoRef.current.playbackRate = playbackSpeed;
        }
    }, [hasMounted, playbackSpeed]);

    return (
        <div className={`flex items-center justify-center transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${wrapperClassName}`}>
            <div className={`relative ${className}`}>
                {/* Fallback/Poster Image: Always on top until video starts */}
                {/* Renders on server for instant visual feedback */}
                <div
                    className={`absolute inset-0 z-10 ${isVideoPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                >
                    <Image
                        src="/animations/loading-poster.png"
                        alt="Loading..."
                        fill
                        priority
                        className="object-contain"
                    />
                </div>

                {/* The Animation Video - Only rendered on client to avoid hydration mismatch */}
                {hasMounted && (
                    <video
                        ref={videoRef}
                        loop
                        muted
                        playsInline
                        onPlaying={() => setIsVideoPlaying(true)}
                        onLoadedData={() => {
                            if (!hasFiredReadyRef.current) {
                                hasFiredReadyRef.current = true;
                                onReady?.();
                            }
                        }}
                        className="w-full h-full object-contain"
                    >
                        <source src="/animations/loading.webm" type="video/webm" />
                        <source src="/animations/loading.mov" type="video/mp4" />
                        Loading...
                    </video>
                )}
            </div>
        </div>
    );
});

export default PreRenderedAnimation;
