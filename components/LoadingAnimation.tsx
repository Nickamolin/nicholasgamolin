"use client";

import React from "react";

type LoadingAnimationProps = {
    isVisible?: boolean;
    className?: string;         // Classes for the video element itself (sizing)
    wrapperClassName?: string;  // Classes for the container (positioning/background)
};

export default function LoadingAnimation({
    isVisible = true,
    className = "w-48 h-48 md:w-[256px] md:h-[256px]",
    wrapperClassName = ""
}: LoadingAnimationProps) {
    return (
        <div className={`flex items-center justify-center transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${wrapperClassName}`}>
            <video
                autoPlay
                loop
                muted
                playsInline
                className={`object-contain ${className}`}
            >
                <source src="/animations/loading.webm" type="video/webm" />
                <source src="/animations/loading.mov" type="video/mp4" />
                Loading...
            </video>
        </div>
    );
}
