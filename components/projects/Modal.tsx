"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import LoadingAnimation from "../loading/LoadingAnimation";
import Button from "../UI/Button";

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
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, embedUrl]);

    const cleanUrl = embedUrl?.replace(/&amp;/g, '&') || "";
    const isTouchScreen = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-8">
                    {/* Background overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative z-10 w-full max-w-6xl bg-black/40 border-y md:border border-white/10 backdrop-blur-3xl rounded-none md:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col"
                    >
                        {/* Header Bar */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
                            <div className="flex gap-4">
                                {infoUrl && (
                                    <Button
                                        onClick={() => window.open(infoUrl, '_blank', 'noopener,noreferrer')}
                                        variant="secondary"
                                        className="!py-2 !px-4 !text-[10px] md:!text-xs border-white/10"
                                    >
                                        Project Info ↗
                                    </Button>
                                )}
                            </div>
                            <Button
                                onClick={onClose}
                                variant="primary"
                                className="!py-2 !px-6 !text-[10px] md:!text-xs"
                            >
                                Close
                            </Button>
                        </div>

                        {/* Iframe Content Area */}
                        <div
                            className={`relative w-full overflow-hidden bg-black/20 ${embedType === "pico8" && isTouchScreen ? "h-[70vh]" : ""
                                }`}
                            style={{
                                aspectRatio: (embedType === "pico8" && isTouchScreen) ? "auto" : (embedAspectRatio || '16 / 9')
                            }}
                        >
                            <LoadingAnimation
                                isVisible={isLoading}
                                wrapperClassName="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm"
                                className="w-24 h-24 md:w-32 md:h-32"
                            />
                            <iframe
                                className="w-full h-full border-none"
                                src={cleanUrl}
                                title="Project Preview"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                onLoad={() => setIsLoading(false)}
                                allowFullScreen
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

