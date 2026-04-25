"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useMousePosition } from "@/components/context/MouseContext";

const RAINBOW = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];

interface CharData {
    node: HTMLSpanElement;
    x: number;
    y: number;
    color: string;
    isRainbow: boolean;
}

// --- Memoized Bio Component ---
// Prevents re-rendering 500+ spans on every mouse move
const MemoizedBio = React.memo(({ 
    paragraphs, 
    charsMap 
}: { 
    paragraphs: string[], 
    charsMap: React.MutableRefObject<Map<string, CharData>> 
}) => {
    return (
        <div className="text-lg md:text-xl text-justify font-body font-medium text-gray-400 flex flex-col justify-center gap-8 cursor-text select-text">
            {paragraphs.map((p, pIdx) => (
                <p key={pIdx}>
                    {p.split(" ").map((word, wIdx) => (
                        <React.Fragment key={wIdx}>
                            <span className="whitespace-nowrap">
                                {word.split("").map((char, cIdx) => {
                                    const id = `${pIdx}-${wIdx}-${cIdx}`;
                                    return (
                                        <span
                                            key={cIdx}
                                            ref={(el) => {
                                                if (el) {
                                                    if (!charsMap.current.has(id)) {
                                                        charsMap.current.set(id, {
                                                            node: el,
                                                            x: 0,
                                                            y: 0,
                                                            color: RAINBOW[Math.floor(Math.random() * RAINBOW.length)],
                                                            isRainbow: false
                                                        });
                                                    } else {
                                                        const data = charsMap.current.get(id);
                                                        if (data) data.node = el;
                                                    }
                                                }
                                            }}
                                            className="transition-colors duration-300"
                                        >
                                            {char}
                                        </span>
                                    );
                                })}
                            </span>
                            {" "}
                        </React.Fragment>
                    ))}
                </p>
            ))}
        </div>
    );
});

MemoizedBio.displayName = "MemoizedBio";

export default function Blurb({
    imageSrc,
    paragraphs
}: {
    imageSrc: string;
    paragraphs: string[];
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const charsMap = useRef<Map<string, CharData>>(new Map());
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number; imgX: number; imgY: number; startTime: number }[]>([]);
    const [isHovered, setIsHovered] = useState(false);
    const [isImageHovered, setIsImageHovered] = useState(false);
    const [hasHover, setHasHover] = useState(false);
    const [scalingRippleCount, setScalingRippleCount] = useState(0);

    const { mouseX, mouseY } = useMousePosition();

    useEffect(() => {
        setHasHover(window.matchMedia("(hover: hover)").matches);
    }, []);

    useEffect(() => {
        const calculatePositions = () => {
            if (!containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();

            charsMap.current.forEach(charData => {
                if (!charData.node) return;
                const rect = charData.node.getBoundingClientRect();
                charData.x = rect.left + rect.width / 2 - containerRect.left;
                charData.y = rect.top + rect.height / 2 - containerRect.top;
            });
        };

        const timeoutId = setTimeout(calculatePositions, 100);
        window.addEventListener('resize', calculatePositions);
        
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', calculatePositions);
        };
    }, [paragraphs]);

    // Centralized animation loop (DOM-only)
    useEffect(() => {
        if (ripples.length === 0) return;

        let rafId: number;
        const SPEED = 2.5; 
        const REVERT_DELAY = 1000; 

        const loop = () => {
            const now = Date.now();
            charsMap.current.forEach(charData => {
                if (!charData.node) return;
                let inWake = false;
                for (const ripple of ripples) {
                    const elapsed = now - ripple.startTime;
                    const radius1 = elapsed * SPEED;
                    const radius2 = Math.max(0, (elapsed - REVERT_DELAY) * SPEED);
                    const dist = Math.hypot(ripple.x - charData.x, ripple.y - charData.y);
                    if (dist < radius1 && dist > radius2) {
                        inWake = true;
                        break;
                    }
                }
                if (inWake) {
                    if (!charData.isRainbow) {
                        charData.node.style.color = charData.color;
                        charData.isRainbow = true;
                    }
                } else {
                    if (charData.isRainbow) {
                        charData.node.style.color = '';
                        charData.isRainbow = false;
                    }
                }
            });
            rafId = requestAnimationFrame(loop);
        };

        rafId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafId);
    }, [ripples]);

    const triggerRipple = (e: React.PointerEvent) => {
        if (!containerRef.current || !imageContainerRef.current) return;
        
        // Don't trigger ripples if the user is right-clicking or similar
        if (e.button !== 0) return;

        const rect = containerRef.current.getBoundingClientRect();
        const imgRect = imageContainerRef.current.getBoundingClientRect();
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const imgX = e.clientX - imgRect.left;
        const imgY = e.clientY - imgRect.top;
        
        const baseId = Date.now();

        setRipples(prev => [...prev, { id: baseId, x, y, imgX, imgY, startTime: baseId }]);

        // Only scale the image if the click was actually on the image
        const isImageClick = imageContainerRef.current.contains(e.target as Node);
        if (isImageClick) {
            setScalingRippleCount(prev => prev + 1);
            setTimeout(() => {
                setScalingRippleCount(prev => Math.max(0, prev - 1));
            }, 1000);
        }

        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== baseId));
        }, 2000);
    };

    return (
        <div
            ref={containerRef}
            className="flex flex-col items-center w-full max-w-5xl relative cursor-none group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onPointerDown={triggerRipple}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full items-stretch relative">
                {/* Image Section */}
                <div className="relative w-full min-h-[400px] md:min-h-0 select-none">
                    <div
                        ref={imageContainerRef}
                        className="relative w-full h-full overflow-hidden rounded-xl"
                        onMouseEnter={() => setIsImageHovered(true)}
                        onMouseLeave={() => setIsImageHovered(false)}
                    >
                        <motion.div
                            animate={{
                                scale: (isImageHovered && hasHover) || scalingRippleCount > 0 ? 1.05 : 1
                            }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="relative w-full h-full"
                        >
                            <Image
                                src={imageSrc}
                                fill
                                alt="Headshot"
                                draggable={false}
                                className="rounded-xl object-cover"
                            />
                        </motion.div>

                        {/* Inversion Ripples (Local to Image, but triggered globally) */}
                        <AnimatePresence>
                            {ripples.map((ripple) => (
                                <React.Fragment key={ripple.id}>
                                    <motion.div
                                        initial={{ scale: 0, x: "-50%", y: "-50%" }}
                                        animate={{ scale: 8, x: "-50%", y: "-50%" }}
                                        transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                                        className="absolute bg-white rounded-full pointer-events-none z-10"
                                        style={{
                                            left: ripple.imgX,
                                            top: ripple.imgY,
                                            width: "100%",
                                            aspectRatio: "1/1",
                                            mixBlendMode: "difference",
                                        }}
                                    />
                                    <motion.div
                                        initial={{ scale: 0, x: "-50%", y: "-50%" }}
                                        animate={{ scale: 8, x: "-50%", y: "-50%" }}
                                        transition={{ duration: 1.5, delay: 1, ease: [0.4, 0, 0.2, 1] }}
                                        className="absolute bg-white rounded-full pointer-events-none z-10"
                                        style={{
                                            left: ripple.imgX,
                                            top: ripple.imgY,
                                            width: "100%",
                                            aspectRatio: "1/1",
                                            mixBlendMode: "difference",
                                        }}
                                    />
                                </React.Fragment>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Bio Text Section (Memoized) */}
                <MemoizedBio paragraphs={paragraphs} charsMap={charsMap} />
            </div>

            {/* Global Custom Cursor */}
            <motion.div
                initial={false}
                animate={{
                    opacity: isHovered ? 1 : 0,
                    scale: isHovered ? 1 : 0,
                    x: "-50%",
                    y: "-50%"
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="fixed pointer-events-none bg-white rounded-full z-50 w-6 h-6 hidden [@media(hover:hover)]:block"
                style={{
                    left: mouseX,
                    top: mouseY,
                    mixBlendMode: 'difference',
                }}
            />
        </div>
    );
}
