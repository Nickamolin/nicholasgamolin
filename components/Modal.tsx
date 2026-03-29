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

    // Determine container max width based on embed type
    const maxWidthClass = embedType === "pico8" ? "md:max-w-[65vw]" : "md:max-w-[85vw]";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            {/* Background overlay */}
            <div
                className="fixed inset-0 bg-black/90 transform scale-[3]"
                onClick={onClose}
            />

            {/* Modal Content Wrapper */}
            <div className={`relative z-10 w-full flex flex-col items-end ${maxWidthClass}`}>
                {/* Close button */}
                <button
                    className="absolute bottom-full right-0 mb-2 text-4xl md:text-5xl font-medium text-white hover:text-gray-400 transition-all cursor-pointer leading-none"
                    onClick={onClose}
                >
                    &times;
                </button>

                {/* Iframe content */}
                {embedType === "youtube" && (
                    <iframe
                        className="w-full md:max-h-[85vh] rounded-lg shadow-2xl"
                        style={{ aspectRatio: embedAspectRatio || '16 / 9' }}
                        src={cleanUrl}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen>
                    </iframe>
                )}

                {embedType === "itchio" && (
                    <div className="w-full md:max-h-[85vh] overflow-hidden shadow-2xl rounded-lg bg-black">
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
                    <div className="w-full md:max-h-[65vh] overflow-hidden shadow-2xl rounded-lg bg-black">
                        <iframe
                            className="w-full -mb-[21px] max-md:min-h-[90vh]"
                            style={{ aspectRatio: embedAspectRatio || '128 / 105' }}
                            src={embedUrl}
                            allowFullScreen>
                        </iframe>
                    </div>
                )}
            </div>
        </div>
    );
}
