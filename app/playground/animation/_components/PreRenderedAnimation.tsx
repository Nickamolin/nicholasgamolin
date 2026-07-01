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

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

type PreRenderedAnimationProps = {
    isVisible?: boolean;
    className?: string;         // Classes for the video element itself (sizing)
    wrapperClassName?: string;  // Classes for the container (positioning/background)
    playbackSpeed?: number;
    isPaused?: boolean;
};

export default function PreRenderedAnimation({
    isVisible = true,
    className = "w-48 h-48",
    wrapperClassName = "",
    playbackSpeed = 1.0,
    isPaused = false,
}: PreRenderedAnimationProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    // Trigger mount on client
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Handle video playback once mounted
    useEffect(() => {
        if (hasMounted && videoRef.current) {
            const video = videoRef.current;
            if (isPaused) {
                video.pause();
            } else {
                // Explicitly try to play to handle browser restrictions
                video.play()
                    .then(() => {
                        // rely on onPlaying event for smoother transition
                    })
                    .catch(() => {
                        setIsVideoPlaying(false);
                    });
            }
        }
    }, [hasMounted, isPaused]);

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
}
