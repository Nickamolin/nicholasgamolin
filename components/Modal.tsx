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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Background overlay */}
            <div
                className="absolute inset-0 bg-black/90 cursor-pointer"
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
                    className="relative z-10 max-w-[85vw] max-h-[85vh] rounded-lg shadow-2xl"
                    style={{ aspectRatio: embedAspectRatio || '16 / 9' }}
                    src={cleanUrl}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen>
                </iframe>
            )}

            {embedType === "itchio" && (
                <div className="relative z-10 w-full max-w-[85vw] max-h-[85vh] overflow-hidden shadow-2xl rounded-lg">
                    <iframe
                        className="w-full -mb-[21px]"
                        style={{ aspectRatio: embedAspectRatio || '16 / 9' }}
                        src={embedUrl}
                        allowFullScreen>
                        <a href={infoUrl}>Play Game on itch.io</a>
                    </iframe>
                </div>
            )}

            {embedType === "pico8" && (
                <div className="relative z-10 w-[740px] max-w-[85vw] max-h-[85vh] overflow-hidden shadow-2xl rounded-lg">
                    <iframe
                        className="w-full -mb-[21px]"
                        style={{ aspectRatio: embedAspectRatio || '128 / 105' }}
                        src={embedUrl}
                        allowFullScreen>
                    </iframe>
                </div>
            )}


        </div>
    );
}
