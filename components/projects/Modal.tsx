"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import LoadingAnimation from "../loading/LoadingAnimation";
import Button from "../UI/Button";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    infoUrl: string;
    embedUrl: string;
    embedType: string;
    embedAspectRatio: string;
};

function RiveWrapper({ url, onLoaded }: { url: string; onLoaded: () => void }) {
    const { RiveComponent } = useRive({
        src: url,
        autoplay: true,
        layout: new Layout({
            fit: Fit.Contain,
            alignment: Alignment.Center,
        }),
        onLoad: onLoaded,
    });
    return <RiveComponent className="w-full h-full" />;
}

export default function Modal({ isOpen, onClose, infoUrl, embedUrl, embedType, embedAspectRatio }: ModalProps) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            document.body.style.overflow = 'hidden';

            // Safety fallback: ensure loading screen clears even if iframe onLoad fails
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 10000);
            return () => {
                clearTimeout(timer);
                document.body.style.overflow = 'unset';
            };
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen, embedUrl]);

    const cleanUrl = React.useMemo(() => embedUrl?.replace(/&amp;/g, '&') || "", [embedUrl]);
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
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/90 z-20">
                            <div className="flex gap-4">
                                {infoUrl && (
                                    <Button
                                        onClick={() => window.open(infoUrl, '_blank', 'noopener,noreferrer')}
                                        variant="secondary"
                                        className="!py-2 !px-4 !text-[10px] md:!text-xs border-white/10 !backdrop-blur-none"
                                        animateEntrance={false}
                                    >
                                        Project Info ↗
                                    </Button>
                                )}
                            </div>
                            <Button
                                onClick={onClose}
                                variant="primary"
                                className="!py-2 !px-6 !text-[10px] md:!text-xs"
                                animateEntrance={false}
                            >
                                Close
                            </Button>
                        </div>

                        {/* Content Area */}
                        <div
                            className={`relative w-full overflow-hidden bg-black/20 ${embedType?.toLowerCase() === "pico8" && isTouchScreen ? "h-[70vh]" : ""
                                }`}
                            style={{
                                aspectRatio: (embedType?.toLowerCase() === "pico8" && isTouchScreen) ? "auto" : (embedAspectRatio || '16 / 9')
                            }}
                        >
                            <LoadingAnimation
                                isVisible={isLoading}
                                wrapperClassName="absolute inset-0 z-20 bg-black"
                                className="w-24 h-24 md:w-32 md:h-32"
                            />

                            {embedType?.toLowerCase() === "riv" ? (
                                <div className={`w-full h-full p-4 md:p-8 transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                    <RiveWrapper url={cleanUrl} onLoaded={() => setIsLoading(false)} />
                                </div>
                            ) : (
                                <iframe
                                    className={`w-full h-full border-none transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                                    src={cleanUrl}
                                    title="Project Preview"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    onLoad={() => setIsLoading(false)}
                                    allowFullScreen
                                />
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

