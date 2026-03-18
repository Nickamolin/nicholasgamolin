"use client";

import React from "react";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    infoUrl: string;
    embedUrl: string;
    embedType: string;
};

export default function Modal({ isOpen, onClose, infoUrl, embedUrl, embedType }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Background overlay */}
            <div
                className="absolute inset-0 bg-black/80 cursor-pointer"
                onClick={onClose}
            />

            {/* Close button */}
            <button
                className="absolute top-4 left-4 text-white hover:text-gray-300 text-4xl font-bold z-50"
                onClick={onClose}
            >
                &times;
            </button>

            {/* Iframe */}
            {embedType === "youtube" && (
                <iframe
                    className="relative z-10 w-[90vw] max-w-5xl aspect-video bg-black rounded-lg shadow-2xl"
                    src={embedUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen>
                </iframe>
            )}

            {embedType === "itchio" && (
                <iframe
                    className="relative z-10 w-[90vw] max-w-5xl aspect-video bg-black rounded-lg shadow-2xl"
                    frameBorder="0"
                    src={embedUrl}
                    allowFullScreen
                    width="1920"
                    height="1100">
                    <a href={infoUrl}>Play Game on itch.io</a>
                </iframe>
            )}

            {embedType === "pico8" && (
                <iframe
                    className="relative z-10 w-[90vw] max-w-4xl h-[80vh] bg-white rounded-lg border-none overflow-hidden shadow-2xl"
                    src={embedUrl}
                    allowFullScreen>
                </iframe>
            )}


        </div>
    );
}
