"use client";

import React from "react";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    infoUrl: string;
    embedUrl: string;
    embedType: string;
    embedAspectRatio: string;
    hoverText: string;
    renderTitle: boolean;
};

export default function Modal({ isOpen, onClose, infoUrl, embedUrl, embedType, embedAspectRatio, hoverText, renderTitle }: ModalProps) {
    if (!isOpen) return null;

    const cleanUrl = embedUrl.replace(/&amp;/g, '&');

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
                    className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 px-4 py-2 border border-white bg-transparent text-white font-medium hover:bg-white hover:text-black transition-colors z-50 cursor-pointer rounded-md"
                    onClick={() => window.open(infoUrl, '_blank', 'noopener,noreferrer')}
                >
                    About ↗
                </button>
            )}

            {/* Iframe */}
            {embedType === "youtube" && (
                <iframe
                    className="relative z-10 md:max-w-[85vw] md:max-h-[85vh] rounded-lg shadow-2xl"
                    style={{ aspectRatio: embedAspectRatio || '16 / 9' }}
                    src={cleanUrl}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen>
                </iframe>
            )}

            {embedType === "itchio" && (
                <div className="relative z-10 w-full md:max-w-[85vw] md:max-h-[85vh] overflow-hidden shadow-2xl rounded-lg">
                    <iframe
                        className="w-full"
                        style={{ aspectRatio: embedAspectRatio || '16 / 9' }}
                        src={embedUrl}
                        allowFullScreen>
                        <a href={infoUrl}>Play Game on itch.io</a>
                    </iframe>
                </div>
            )}

            {embedType === "pico8" && (
                <div className="relative z-10 w-full md:max-w-[65vw] md:max-h-[65vh] overflow-hidden shadow-2xl rounded-lg">
                    <iframe
                        className="w-full -mb-[21px] max-md:min-h-[90vh]"
                        style={{ aspectRatio: embedAspectRatio || '128 / 105' }}
                        src={embedUrl}
                        allowFullScreen>
                    </iframe>
                </div>
            )}

            {embedType === "website" && (
                <iframe
                    className="relative z-10 md:max-w-[85vw] md:max-h-[85vh] rounded-lg shadow-2xl"
                    style={{ aspectRatio: embedAspectRatio || '1 / 1' }}
                    src={embedUrl}
                    allowFullScreen>
                </iframe>
            )}
        </div>
    );
}
