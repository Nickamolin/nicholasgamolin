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
    summary: string;
    role: string;
    tools_used: string;
    action_button_text: string;
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

export default function Modal({ isOpen, onClose, infoUrl, embedUrl, embedType, embedAspectRatio, summary, role, tools_used, action_button_text }: ModalProps) {
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
                <div className="fixed inset-0 z-[100] flex justify-center overflow-y-auto md:p-8 p-0">
                    {/* Background overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md transform-gpu"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative z-10 w-full bg-black/40 border-y md:border border-white/10 backdrop-blur-3xl rounded-none md:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col h-fit my-auto"
                        style={{
                            maxWidth: isTouchScreen ? '100%' : `min(1152px, calc(55vh * ${embedAspectRatio?.split('/').map(v => v.trim()).length === 2
                                ? (Number(embedAspectRatio.split('/')[0]) / Number(embedAspectRatio.split('/')[1]))
                                : (16 / 9)
                                }))`
                        }}
                    >
                        {/* Header Bar */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 z-20">
                            <div className="flex gap-4">
                                {infoUrl && action_button_text && (
                                    <Button
                                        onClick={() => window.open(infoUrl, '_blank', 'noopener,noreferrer')}
                                        variant="secondary"
                                        className="!py-2 !px-4 !text-[10px] md:!text-xs border-white/10 !backdrop-blur-none"
                                        animateEntrance={false}
                                    >
                                        {action_button_text} ↗
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

                        {/* Body Container */}
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Content Area Wrapper */}
                            <div className="flex items-center justify-center w-full min-h-0">
                                <div
                                    className={`relative w-full overflow-hidden ${embedType?.toLowerCase() === "pico8" && isTouchScreen ? "h-[60vh]" : ""
                                        }`}
                                    style={{
                                        aspectRatio: (embedType?.toLowerCase() === "pico8" && isTouchScreen) ? "auto" : (embedAspectRatio || '16 / 9'),
                                        maxHeight: isTouchScreen ? '70vh' : '55vh'
                                    }}
                                >
                                    <LoadingAnimation
                                        isVisible={isLoading}
                                        wrapperClassName="absolute inset-0 z-20 bg-black"
                                        className="w-24 h-24 md:w-32 md:h-32"
                                    />

                                    {embedType?.toLowerCase() === "riv" ? (
                                        <div className={`w-full h-full transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
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
                            </div>

                            {/* Project Details Section */}
                            <div className="py-5 px-6 md:py-6 md:px-8 bg-white/2 backdrop-blur-sm">
                                <div className="max-w-4xl mx-auto flex flex-col gap-3 md:gap-4">
                                    {/* Summary */}
                                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-4">
                                        <h4 className="text-[10px] md:text-xs font-subtitle font-bold text-gray-500 uppercase tracking-[0.2em]">
                                            Summary
                                        </h4>
                                        <p className="text-sm md:text-base font-body text-gray-300 leading-relaxed">
                                            {summary}
                                        </p>
                                    </div>

                                    {/* Role */}
                                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-4">
                                        <h4 className="text-[10px] md:text-xs font-subtitle font-bold text-gray-500 uppercase tracking-[0.2em]">
                                            Role
                                        </h4>
                                        <p className="text-sm md:text-base font-body text-gray-300 leading-relaxed">
                                            {role}
                                        </p>
                                    </div>

                                    {/* Tools Used */}
                                    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-4">
                                        <h4 className="text-[10px] md:text-xs font-subtitle font-bold text-gray-500 uppercase tracking-[0.2em]">
                                            Tools Used
                                        </h4>
                                        <p className="text-sm md:text-base font-body text-gray-300">
                                            {tools_used}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

