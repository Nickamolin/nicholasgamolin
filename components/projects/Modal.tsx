"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import LoadingAnimation from "../loading/LoadingAnimation";
import Button from "../UI/Button";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onExitComplete?: () => void;
    title: string;
    year: string | number;
    infoUrl: string;
    embedUrl: string;
    embedType: string;
    embedAspectRatio: string;
    mobileAspectRatio: string;
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

export default function Modal({ isOpen, onClose, onExitComplete, title, year, infoUrl, embedUrl, embedType, embedAspectRatio, mobileAspectRatio, summary, role, tools_used, action_button_text }: ModalProps) {
    const [isLoading, setIsLoading] = useState(true);
    const prevUrlRef = useRef<string>("");
    const prevIsOpenRef = useRef<boolean>(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isGameActive, setIsGameActive] = useState(false);
    const [hasReceivedTouch, setHasReceivedTouch] = useState(false);
    const [isUnityFullscreen, setIsUnityFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Desktop layout dimensions — computed via JS to size the modal tightly around the embed
    const [modalStyle, setModalStyle] = useState<{ width: number; height?: number } | null>(null);
    const [embedDims, setEmbedDims] = useState<{ width: number; height: number } | null>(null);
    const [detailsWidth, setDetailsWidth] = useState<number | null>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'PICO8_START') {
                setIsGameActive(true);
            } else if (event.data.type === 'PICO8_STOP') {
                setIsGameActive(false);
            } else if (event.data.type === 'PICO8_TOUCH') {
                setHasReceivedTouch(true);
            } else if (event.data.type === 'UNITY_GAME_FULLSCREEN') {
                setIsUnityFullscreen(true);
            } else if (event.data.type === 'UNITY_GAME_EXIT_FULLSCREEN') {
                setIsUnityFullscreen(false);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleClose = () => {
        setIsGameActive(false);
        setHasReceivedTouch(false);
        setIsUnityFullscreen(false);
        onClose();
    };

    const cleanUrl = React.useMemo(() => embedUrl?.replace(/&amp;/g, '&') || "", [embedUrl]);

    // Synchronously reset loading state during render if the URL changes OR the modal is being opened
    if (prevUrlRef.current !== cleanUrl || (isOpen && !prevIsOpenRef.current)) {
        setIsLoading(true);
        prevUrlRef.current = cleanUrl;
    }
    prevIsOpenRef.current = isOpen;

    // Parse aspect ratio string (e.g. "16/9") into a number, or null for responsive content
    const numericRatio = React.useMemo(() => {
        if (!embedAspectRatio) return null;
        const parts = embedAspectRatio.split('/');
        if (parts.length !== 2) return null;
        const n1 = Number(parts[0]);
        const n2 = Number(parts[1]);
        if (isNaN(n1) || isNaN(n2) || n2 === 0) return null;
        return n1 / n2;
    }, [embedAspectRatio]);

    // Responsive content has no fixed aspect ratio (websites, games with null/empty ratio)
    const isResponsive = numericRatio === null;

    // On md+ screens, use side-by-side layout when content is portrait-ish (width < 1.3 * height)
    const useSideLayout = React.useMemo(() => !isMobile && !isResponsive && numericRatio < 1.3, [numericRatio, isMobile, isResponsive]);

    const handleLoad = () => {
        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    // Body scroll lock when modal is open
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);

            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflowY = 'scroll';

            // Safety fallback: ensure loading screen clears even if iframe onLoad fails
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 10000);

            return () => {
                clearTimeout(timer);
                const savedScrollY = document.body.style.top;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflowY = '';
                if (savedScrollY) {
                    window.scrollTo(0, parseInt(savedScrollY || '0') * -1);
                }
            };
        }
    }, [isOpen, cleanUrl]);

    // Track mobile breakpoint
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Compute desktop modal + embed dimensions
    // This sizes the modal tightly around the content so there's no wasted horizontal space
    useEffect(() => {
        if (!isOpen || isMobile) {
            setModalStyle(null);
            setEmbedDims(null);
            return;
        }

        const compute = () => {
            const maxW = window.innerWidth * 0.9;
            const maxH = window.innerHeight * 0.9;
            const headerH = 60;
            const detailsH = 200; // estimated height for stacked details section
            const minEmbedH = 350; // enforce a minimum height so content never collapses to an unviewable size

            if (isResponsive) {
                // Responsive content: modal fills 90vw × 90vh
                setModalStyle({ width: Math.round(maxW), height: Math.round(maxH) });
                setEmbedDims(null);
                return;
            }

            const ratio = numericRatio!; 

            if (useSideLayout) {
                const detailsW = Math.min(maxW * 0.4, 400);
                const availW = maxW - detailsW;
                const availH = maxH - headerH;

                let ew = availW;
                let eh = ew / ratio;
                if (eh > availH) {
                    eh = availH;
                    ew = eh * ratio;
                }
                
                // Enforce minimum dimensions so it remains visible on very short screens
                if (eh < minEmbedH) {
                    eh = minEmbedH;
                    ew = eh * ratio;
                }

                const mw = Math.round(ew + detailsW);
                const mh = Math.round(headerH + eh);
                const actualDetailsW = mw - Math.round(ew);
                
                setEmbedDims({ width: Math.round(ew), height: Math.round(eh) });
                setModalStyle({ width: mw, height: mh });
                setDetailsWidth(actualDetailsW);
            } else {
                const availH = maxH - headerH - detailsH;

                let ew = maxW;
                let eh = ew / ratio;
                if (eh > availH) {
                    eh = availH;
                    ew = eh * ratio;
                }
                
                // Enforce minimum dimensions
                if (eh < minEmbedH) {
                    eh = minEmbedH;
                    ew = eh * ratio;
                }

                // In stacked layout, we do NOT force the modal's total height.
                // We let it grow naturally to fit the embed + variable-length details text.
                setEmbedDims({ width: Math.round(ew), height: Math.round(eh) });
                setModalStyle({ width: Math.round(ew) });
            }
        };

        compute();
        window.addEventListener('resize', compute);
        return () => window.removeEventListener('resize', compute);
    }, [isOpen, isMobile, numericRatio, useSideLayout, isResponsive]);

    // The fullscreen game override (PICO-8 touch or Unity game fullscreen)
    const isFullscreenGame = (isGameActive && hasReceivedTouch) || isUnityFullscreen;

    // --- Render embedded content (shared between layouts) ---
    const renderEmbed = () => (
        <>
            <LoadingAnimation
                isVisible={isLoading}
                wrapperClassName="absolute inset-0 z-20 bg-black"
                className="w-24 h-24 md:w-36 md:h-36"
            />

            {embedType?.toLowerCase() === "riv" ? (
                <div className={`absolute inset-0 transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                    <RiveWrapper url={cleanUrl} onLoaded={handleLoad} />
                </div>
            ) : embedType?.toLowerCase() === "video" ? (
                <div className={`absolute inset-0 transition-opacity duration-700 overflow-hidden ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        src={cleanUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        onPlaying={handleLoad}
                    />
                </div>
            ) : embedType?.toLowerCase() === "website" ? (
                <div className={`absolute inset-0 transition-opacity duration-700 flex flex-col ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
                    <iframe
                        className="w-full h-full border-none bg-black select-none touch-none"
                        src={cleanUrl}
                        title="Project Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
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
                    className={`absolute inset-0 w-full h-full border-none transition-opacity duration-700 bg-black select-none touch-none ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    src={cleanUrl}
                    title="Project Preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    onLoad={handleLoad}
                    allowFullScreen
                />
            )}
        </>
    );

    // --- Render project details (shared between layouts) ---
    const renderDetails = (sidePanel: boolean) => (
        <div className={sidePanel ? 'flex flex-col gap-4' : 'flex flex-col gap-4 px-6 md:px-8 pt-5 pb-6'}>
            {/* Title and Year */}
            <div>
                <div className="flex items-baseline justify-between gap-4">
                    <h2 className={`font-title font-bold text-white tracking-tight ${sidePanel ? 'text-xl lg:text-2xl' : 'text-2xl md:text-4xl'}`}>
                        {title}
                    </h2>
                    <span className={`font-subtitle font-medium text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap ${sidePanel ? 'text-lg lg:text-xl' : 'text-xl md:text-4xl'}`}>
                        {year}
                    </span>
                </div>
                <div className="h-px w-full bg-white/10 mt-2" />
            </div>

            {/* Summary */}
            <div className={sidePanel ? 'flex flex-col gap-1' : 'grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-4'}>
                <h4 className="text-[10px] md:text-xs font-subtitle font-bold text-gray-500 uppercase tracking-[0.2em]">
                    Summary
                </h4>
                <p className="text-sm md:text-base font-body text-gray-300 leading-relaxed">
                    {summary}
                </p>
            </div>

            {/* Role */}
            <div className={sidePanel ? 'flex flex-col gap-1' : 'grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-4'}>
                <h4 className="text-[10px] md:text-xs font-subtitle font-bold text-gray-500 uppercase tracking-[0.2em]">
                    Role
                </h4>
                <p className="text-sm md:text-base font-body text-gray-300 leading-relaxed">
                    {role}
                </p>
            </div>

            {/* Tools Used */}
            <div className={sidePanel ? 'flex flex-col gap-1' : 'grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1 md:gap-4'}>
                <h4 className="text-[10px] md:text-xs font-subtitle font-bold text-gray-500 uppercase tracking-[0.2em]">
                    Tools Used
                </h4>
                <p className="text-sm md:text-base font-body text-gray-300">
                    {tools_used}
                </p>
            </div>
        </div>
    );

    return (
        <AnimatePresence onExitComplete={onExitComplete}>
            {isOpen && (
                <div className={`fixed inset-0 z-[100] ${isFullscreenGame ? 'overflow-hidden' : 'overflow-y-auto'} [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}>
                    {/* Background overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{
                            opacity: 0,
                            pointerEvents: "none",
                            transition: { pointerEvents: { duration: 0 } }
                        }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md transform-gpu touch-none"
                        onClick={handleClose}
                    />

                    {/* Centering Wrapper — becomes a full-height stretch container when game is fullscreen */}
                    <div className={`flex ${isFullscreenGame ? 'h-full p-0' : `min-h-full items-center justify-center ${isMobile ? 'p-0' : 'p-4 md:p-8'}`}`}>
                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{
                                opacity: 0,
                                y: 20,
                                pointerEvents: "none",
                                transition: { pointerEvents: { duration: 0 } }
                            }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className={`relative z-10 bg-black/40 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col min-w-[320px]
                                border-y md:border border-white/10
                                ${isMobile
                                    ? 'w-full rounded-[1.5rem]'
                                    : 'overflow-hidden rounded-[2.5rem]'
                                }
                                ${isFullscreenGame ? 'flex-1 w-full !rounded-none !border-none' : ''}`}
                        style={isFullscreenGame ? undefined : (!isMobile && modalStyle ? {
                            width: modalStyle.width,
                            height: modalStyle.height,
                        } : undefined)}
                    >
                        {/* Header Bar */}
                        <div className={`flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 z-20 shrink-0 ${isFullscreenGame ? 'hidden' : 'flex'}`}>
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
                                onClick={handleClose}
                                variant="primary"
                                className="!py-2 !px-6 !text-[10px] md:!text-xs"
                            >
                                Close
                            </Button>
                        </div>

                        {/* Body — layout switches between stacked and side-by-side on md+ */}
                        <div className={`flex-1 min-h-0 flex ${isMobile || isFullscreenGame ? 'flex-col' : useSideLayout ? 'flex-row' : 'flex-col'}`}>
                            {/* Embed Area */}
                            {isMobile ? (
                                /* Mobile: same JSX branch for normal + fullscreen to avoid iframe remount */
                                <div
                                    className={`relative w-full bg-black/20 select-none touch-none ${
                                        isFullscreenGame ? 'flex-1' : isResponsive ? 'aspect-square min-h-[350px]' : ''
                                    }`}
                                    style={!isResponsive && !isFullscreenGame ? { aspectRatio: mobileAspectRatio || numericRatio! } : undefined}
                                >
                                    {renderEmbed()}
                                </div>
                            ) : isResponsive ? (
                                /* Desktop responsive: embed fills all available flex space */
                                <div className="flex-1 min-h-0 relative bg-black/20 select-none touch-none">
                                    <div className="absolute inset-0">
                                        {renderEmbed()}
                                    </div>
                                </div>
                            ) : (
                                /* Desktop fixed-ratio embed */
                                <div
                                    className={`relative bg-black/20 select-none touch-none flex items-center justify-center ${isFullscreenGame ? 'flex-1 w-full' : 'shrink-0'}`}
                                    style={isFullscreenGame ? undefined : (embedDims ? { width: embedDims.width, height: embedDims.height } : undefined)}
                                >
                                    {numericRatio ? (
                                        <div className="absolute inset-0">
                                            {renderEmbed()}
                                        </div>
                                    ) : (
                                        <LoadingAnimation
                                            isVisible={true}
                                            wrapperClassName="absolute inset-0 z-20 bg-black"
                                            className="w-32 h-32 md:w-48 md:h-48"
                                        />
                                    )}
                                </div>
                            )}

                            {/* Project Details */}
                            <div
                                className={`${isFullscreenGame ? 'hidden' : ''} ${isMobile
                                    ? 'shrink-0'
                                    : 'min-h-0 overflow-y-auto'
                                } ${useSideLayout
                                    ? 'border-l border-white/10 p-6'
                                    : ''
                                }`}
                                style={!isFullscreenGame && useSideLayout && detailsWidth ? { width: detailsWidth } : undefined}
                            >
                                {renderDetails(useSideLayout)}
                            </div>
                        </div>
                    </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
