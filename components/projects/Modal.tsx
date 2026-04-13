"use client";

import React, { useState, useEffect } from "react";
import LoadingAnimation from "../loading/LoadingAnimation";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    infoUrl: string;
    embedUrl: string;
    embedType: string;
    embedAspectRatio: string;
};

export default function Modal({ isOpen, onClose, infoUrl, embedUrl, embedType, embedAspectRatio }: ModalProps) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
        }
    }, [isOpen, embedUrl]);

    if (!isOpen) return null;

    const cleanUrl = embedUrl.replace(/&amp;/g, '&');
    const isTouchScreen = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const LoadingPlaceholder = () => (
        <LoadingAnimation
            isVisible={isLoading}
            wrapperClassName="absolute inset-0 z-20 bg-black"
            className="w-32 h-32 md:w-48 md:h-48"
        />
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Background overlay */}
            <div
                className="fixed inset-0 bg-black/90 transform scale-[3]"
                onClick={onClose}
            />

            {/* Close button */}
            <button
                className={`absolute ${isTouchScreen ? 'bottom-4 sm:bottom-6' : 'top-20 sm:top-24'} right-4 sm:right-6 px-4 py-2 bg-white text-black font-bold opacity-100 hover:bg-gray-300 hover:text-black transition-colors z-50 cursor-pointer rounded-md`}
                onClick={onClose}
            >
                Close &times;
            </button>

            {/* About button */}
            {infoUrl && (
                <button
                    className={`absolute ${isTouchScreen ? 'bottom-4 sm:bottom-6' : 'top-20 sm:top-24'} left-4 sm:left-6 px-4 py-2 bg-white text-black font-bold opacity-100 hover:bg-gray-300 hover:text-black transition-colors z-50 cursor-pointer rounded-md`}
                    onClick={() => window.open(infoUrl, '_blank', 'noopener,noreferrer')}
                >
                    About ↗&#xFE0E;
                </button>
            )}

            {/* Iframe */}
            {embedType === "youtube" && (
                <div className="relative z-10 w-[min(100vw,calc(100vh*(var(--ratio))))] md:w-[min(85vw,calc(85vh*(var(--ratio))))] max-h-[100vh] md:max-h-[85vh] overflow-hidden shadow-2xl rounded-lg" style={{ aspectRatio: embedAspectRatio || '16 / 9', '--ratio': embedAspectRatio || '16 / 9' } as React.CSSProperties}>
                    <LoadingPlaceholder />
                    <iframe
                        className="w-full h-full"
                        src={cleanUrl}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        onLoad={() => setIsLoading(false)}
                        allowFullScreen>
                    </iframe>
                </div>
            )}

            {embedType === "itchio" && (
                <div className="relative z-10 w-[min(100vw,calc(100vh*(var(--ratio))))] md:w-[min(85vw,calc(85vh*(var(--ratio))))] max-h-[100vh] md:max-h-[85vh] overflow-hidden shadow-2xl rounded-lg" style={{ aspectRatio: embedAspectRatio || '16 / 9', '--ratio': embedAspectRatio || '16 / 9' } as React.CSSProperties}>
                    <LoadingPlaceholder />
                    <iframe
                        className="w-full h-full"
                        src={embedUrl}
                        onLoad={() => setIsLoading(false)}
                        allowFullScreen>
                        <a href={infoUrl}>Play Game on itch.io</a>
                    </iframe>
                </div>
            )}

            {embedType === "pico8" && (
                <div
                    className={`relative z-10 overflow-hidden shadow-2xl rounded-lg ${isTouchScreen
                        ? "w-full h-[80vh]"
                        : "w-[min(100vw,calc(100vh*(var(--ratio))))] md:w-[min(65vw,calc(65vh*(var(--ratio))))] max-h-[100vh] md:max-h-[65vh]"
                        }`}
                    style={{
                        '--ratio': embedAspectRatio || '128 / 105',
                        aspectRatio: isTouchScreen ? 'auto' : 'var(--ratio)'
                    } as React.CSSProperties}
                >
                    <LoadingPlaceholder />
                    <iframe
                        className="w-full h-full"
                        src={embedUrl}
                        onLoad={() => setIsLoading(false)}
                        allowFullScreen>
                    </iframe>
                </div>
            )}

            {embedType === "website" && (
                <div className="relative z-10 w-[min(100vw,calc(100vh*(var(--ratio))))] md:w-[min(85vw,calc(85vh*(var(--ratio))))] max-h-[100vh] md:max-h-[85vh] overflow-hidden shadow-2xl rounded-lg" style={{ aspectRatio: embedAspectRatio || '1 / 1', '--ratio': embedAspectRatio || '1 / 1' } as React.CSSProperties}>
                    <LoadingPlaceholder />
                    <iframe
                        className="w-full h-full"
                        src={embedUrl}
                        onLoad={() => setIsLoading(false)}
                        allowFullScreen>
                    </iframe>
                </div>
            )}
        </div>
    );
}

