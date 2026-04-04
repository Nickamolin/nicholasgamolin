"use client";

import React from "react";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    infoUrl: string;
    embedUrl: string;
    embedType: string;
    embedAspectRatio: string;
};

export default function Modal({ isOpen, onClose, infoUrl, embedUrl, embedType, embedAspectRatio }: ModalProps) {
    if (!isOpen) return null;

    const cleanUrl = embedUrl.replace(/&amp;/g, '&');
    const isTouchScreen = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Background overlay */}
            <div
                className="fixed inset-0 bg-black/90 transform scale-[3]"
                onClick={onClose}
            />

            {/* Close button */}
            <button
                className="absolute top-4 right-4 w-5 h-5 flex items-center justify-center text-white hover:text-gray-300 text-4xl font-bold z-50 cursor-pointer"
                onClick={onClose}
            >
                &times;
            </button>

            {/* About button */}
            {infoUrl && (
                <button
                    className="absolute top-4 left-4 sm:top-6 sm:left-6 px-4 py-2 bg-white text-black font-medium hover:bg-gray-300 hover:text-black transition-colors z-50 cursor-pointer rounded-md"
                    onClick={() => window.open(infoUrl, '_blank', 'noopener,noreferrer')}
                >
                    About ↗&#xFE0E;
                </button>
            )}

            {/* Iframe */}
            {embedType === "youtube" && (
                <div className="relative z-10 w-[min(100vw,calc(100vh*(var(--ratio))))] md:w-[min(85vw,calc(85vh*(var(--ratio))))] max-h-[100vh] md:max-h-[85vh] overflow-hidden shadow-2xl rounded-lg" style={{ aspectRatio: embedAspectRatio || '16 / 9', '--ratio': embedAspectRatio || '16 / 9' } as React.CSSProperties}>
                    <iframe
                        className="w-full h-full"
                        src={cleanUrl}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen>
                    </iframe>
                </div>
            )}

            {embedType === "itchio" && (
                <div className="relative z-10 w-[min(100vw,calc(100vh*(var(--ratio))))] md:w-[min(85vw,calc(85vh*(var(--ratio))))] max-h-[100vh] md:max-h-[85vh] overflow-hidden shadow-2xl rounded-lg" style={{ aspectRatio: embedAspectRatio || '16 / 9', '--ratio': embedAspectRatio || '16 / 9' } as React.CSSProperties}>
                    <iframe
                        className="w-full h-full"
                        src={embedUrl}
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
                    <iframe
                        className="w-full h-full"
                        src={embedUrl}
                        allowFullScreen>
                    </iframe>
                </div>
            )}

            {embedType === "website" && (
                <div className="relative z-10 w-[min(100vw,calc(100vh*(var(--ratio))))] md:w-[min(85vw,calc(85vh*(var(--ratio))))] max-h-[100vh] md:max-h-[85vh] overflow-hidden shadow-2xl rounded-lg" style={{ aspectRatio: embedAspectRatio || '1 / 1', '--ratio': embedAspectRatio || '1 / 1' } as React.CSSProperties}>
                    <iframe
                        className="w-full h-full"
                        src={embedUrl}
                        allowFullScreen>
                    </iframe>
                </div>
            )}
        </div>
    );
}
