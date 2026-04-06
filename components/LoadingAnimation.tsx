"use client";

import React from "react";

type LoadingAnimationProps = {
    isVisible?: boolean;
    className?: string;         // Classes for the video element itself (sizing)
    wrapperClassName?: string;  // Classes for the container (positioning/background)
};

export default function LoadingAnimation({ 
    isVisible = true, 
    className = "w-48 h-48 md:w-64 md:h-64", 
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
                <source src="https://ahkkpmqdyghygygqonbi.supabase.co/storage/v1/object/public/animations/draft2.mkv" type="video/x-matroska" />
                Loading...
            </video>
        </div>
    );
}
