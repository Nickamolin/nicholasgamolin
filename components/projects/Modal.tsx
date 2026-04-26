"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import LoadingAnimation from "../loading/LoadingAnimation";
import Button from "../UI/Button";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    year: string | number;
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

export default function Modal({ isOpen, onClose, title, year, infoUrl, embedUrl, embedType, embedAspectRatio, summary, role, tools_used, action_button_text }: ModalProps) {
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
    }, [isOpen]);

    const handleLoad = () => {
        // Add a tiny delay to prevent flicker on instant loads
        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    const cleanUrl = React.useMemo(() => embedUrl?.replace(/&amp;/g, '&') || "", [embedUrl]);
    const isTouchScreen = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    // Safely calculate aspect ratio to prevent NaN or collapse
    const numericRatio = React.useMemo(() => {
        if (!embedAspectRatio) return 16 / 9;
        const parts = embedAspectRatio.split('/');
        if (parts.length !== 2) return 16 / 9;
        const n1 = Number(parts[0]);
        const n2 = Number(parts[1]);
        if (isNaN(n1) || isNaN(n2) || n2 === 0) return 16 / 9;
        return n1 / n2;
    }, [embedAspectRatio]);

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
                        className="relative z-10 w-full bg-black/40 border-y md:border border-white/10 backdrop-blur-3xl rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col h-fit my-auto"
                        style={{
                            maxWidth: isTouchScreen ? '100%' : `min(1152px, calc(55vh * ${numericRatio}))`
                        }}
                    >
                        {/* Header Bar */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 z-20 shrink-0">
                            <div className="flex gap-4">
                                {infoUrl && action_button_text && (
                                    <Button
                                        onClick={() => window.open(infoUrl, '_blank', 'noopener,noreferrer')}
                                        variant="secondary"
                                        className="!py-2 !px-4 !text-[10px] md:!text-xs border-white/10 !backdrop-blur-none"
                                    >
                                        {action_button_text} {"\u2197\uFE0E"}
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

                        {/* Body Container */}
                        <div className="flex-1 flex flex-col min-h-0 relative">
                            {/* Content Area Wrapper */}
                            <div className="flex items-center justify-center w-full min-h-0 bg-black/20">
                                <div
                                    className={`relative w-full overflow-hidden flex items-center justify-center ${embedType?.toLowerCase() === "pico8" && isTouchScreen ? "h-[60vh]" : ""
                                        }`}
                                    style={{
                                        aspectRatio: (embedType?.toLowerCase() === "pico8" && isTouchScreen) ? "auto" : numericRatio,
                                        maxHeight: isTouchScreen ? '70vh' : '55vh',
                                        minHeight: '200px' // Prevent collapse during rapid switches
                                    }}
                                >
                                    <LoadingAnimation
                                        isVisible={isLoading}
                                        wrapperClassName="absolute inset-0 z-20 bg-black"
                                        className="w-24 h-24 md:w-32 md:h-32"
                                    />

                                    {embedType?.toLowerCase() === "riv" ? (
                                        <div className={`w-full h-full transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                            <RiveWrapper url={cleanUrl} onLoaded={handleLoad} />
                                        </div>
                                    ) : embedType?.toLowerCase() === "video" ? (
                                        <div className={`relative w-full h-full transition-opacity duration-700 overflow-hidden ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                            {/* Ambient Background */}
                                            <video
                                                className="absolute inset-0 w-full h-full object-cover blur-md opacity-50 scale-110 pointer-events-none"
                                                src={cleanUrl}
                                                autoPlay
                                                muted
                                                loop
                                            />
                                            {/* Foreground Video */}
                                            <video
                                                className="relative z-10 w-full h-full object-contain"
                                                src={cleanUrl}
                                                autoPlay
                                                muted
                                                loop
                                                onCanPlay={handleLoad}
                                            />
                                        </div>
                                    ) : embedType?.toLowerCase() === "website" ? (
                                        <div className={`relative w-full h-full transition-opacity duration-700 flex flex-col ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                                            <iframe
                                                className="w-full h-full border-none bg-black flex-1"
                                                src={cleanUrl}
                                                title="Project Preview"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                onLoad={handleLoad}
                                                allowFullScreen
                                            />
                                            {!isLoading && (
                                                <a
                                                    href={cleanUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute bottom-3 right-3 md:bottom-4 md:right-4 text-[10px] md:text-xs font-subtitle font-medium text-white/60 hover:text-white transition-all bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5 hover:scale-105 active:scale-95 z-30"
                                                >
                                                    Visit Site {"\u2197\uFE0E"}
                                                </a>
                                            )}
                                        </div>
                                    ) : (
                                        <iframe
                                            className={`w-full h-full border-none transition-opacity duration-700 bg-black ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                                            src={cleanUrl}
                                            title="Project Preview"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            onLoad={handleLoad}
                                            allowFullScreen
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Project Details Section */}
                            <div className="py-5 px-6 md:py-6 md:px-8 bg-white/2 backdrop-blur-sm">
                                <div className="mx-auto flex flex-col gap-3 md:gap-4">
                                    {/* Header: Title and Year */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-baseline justify-between gap-4">
                                            <h2 className="text-2xl md:text-4xl font-title font-bold text-white tracking-tight">
                                                {title}
                                            </h2>
                                            <span className="text-xl md:text-4xl font-subtitle font-medium text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">
                                                {year}
                                            </span>
                                        </div>
                                        <div className="h-px w-full bg-white/10" />
                                    </div>

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

