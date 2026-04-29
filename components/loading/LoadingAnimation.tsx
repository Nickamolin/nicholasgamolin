"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

type LoadingAnimationProps = {
    isVisible?: boolean;
    className?: string;         // Classes for the video element itself (sizing)
    wrapperClassName?: string;  // Classes for the container (positioning/background)
};

export default function LoadingAnimation({
    isVisible = true,
    className = "w-[256px] h-[256px]",
    wrapperClassName = ""
}: LoadingAnimationProps) {
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
            // Explicitly try to play to handle browser restrictions
            video.play()
                .then(() => {
                    setIsVideoPlaying(true);
                })
                .catch(() => {
                    setIsVideoPlaying(false);
                });
        }
    }, [hasMounted]);

    return (
        <div className={`flex items-center justify-center transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${wrapperClassName}`}>
            <div className={`relative ${className}`}>
                {/* Fallback/Poster Image: Always on top until video starts */}
                {/* Renders on server for instant visual feedback */}
                <div 
                    className={`absolute inset-0 z-10 transition-opacity duration-300 ${isVideoPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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
                        onPlay={() => setIsVideoPlaying(true)}
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
