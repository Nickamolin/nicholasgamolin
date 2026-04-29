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
    const [isAutoplayFailed, setIsAutoplayFailed] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            // Explicitly try to play to detect browser/power mode blocks
            video.play().catch((error) => {
                console.warn("Autoplay blocked, falling back to static poster:", error);
                setIsAutoplayFailed(true);
            });
        }
    }, []);

    return (
        <div className={`flex items-center justify-center transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${wrapperClassName}`}>
            {isAutoplayFailed ? (
                <Image
                    src="/animations/loading-poster.png"
                    alt="Loading..."
                    width={256}
                    height={256}
                    priority
                    className={`object-contain ${className}`}
                />
            ) : (
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="/animations/loading-poster.png"
                    className={`object-contain ${className}`}
                >
                    <source src="/animations/loading.webm" type="video/webm" />
                    <source src="/animations/loading.mov" type="video/mp4" />
                    Loading...
                </video>
            )}
        </div>
    );
}
