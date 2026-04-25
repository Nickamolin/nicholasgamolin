"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

export default function InvertImage({ src, alt }: { src: string, alt: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [activeRipplesCount, setActiveRipplesCount] = useState(0);
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
    const [hasHover, setHasHover] = useState(false);

    React.useEffect(() => {
        setHasHover(window.matchMedia("(hover: hover)").matches);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const baseId = Date.now();

        // Increment active sequence count
        setActiveRipplesCount((prev) => prev + 1);

        // Spawn inversion ripple
        setRipples((prev) => [...prev, { id: baseId, x, y }]);

        // Spawn reversion ripple
        setTimeout(() => {
            setRipples((prev) => [...prev, { id: baseId + 1, x, y }]);
            
            // Decrement count - when it hits 0, it means the last sequence has started its reversion
            setActiveRipplesCount((prev) => Math.max(0, prev - 1));
            
            // Clean up
            setTimeout(() => {
                setRipples((prev) => prev.filter(r => r.id !== baseId && r.id !== baseId + 1));
            }, 1000);
        }, 1000);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full cursor-none overflow-hidden rounded-xl group select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
            onPointerDown={handlePointerDown}
        >
            {/* Image Wrapper for Scaling */}
            <motion.div
                animate={{
                    // Only scale down once ALL active ripple sequences have started their reversion
                    scale: (activeRipplesCount > 0 || (isHovered && hasHover)) ? 1.05 : 1
                }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative w-full h-full"
            >
                <Image
                    src={src}
                    fill
                    alt={alt}
                    draggable={false}
                    className="rounded-xl object-cover"
                />
            </motion.div>

            {/* Tap/Click Inversion Ripples */}
            <AnimatePresence mode="popLayout">
                {ripples.map((ripple) => (
                    <motion.div
                        key={ripple.id}
                        initial={{ scale: 0, x: "-50%", y: "-50%" }}
                        animate={{ scale: 4, x: "-50%", y: "-50%" }}
                        transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute bg-white rounded-full pointer-events-none z-15"
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                            width: "100%",
                            aspectRatio: "1/1",
                            mixBlendMode: "difference",
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Small Hover Inversion Circle (Custom Cursor) */}
            <motion.div
                initial={false}
                animate={{
                    opacity: isHovered ? 1 : 0,
                    scale: isHovered ? 1 : 0,
                    x: "-50%",
                    y: "-50%"
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute pointer-events-none bg-white rounded-full z-30 w-5 h-5 hidden [@media(hover:hover)]:block"
                style={{
                    left: mousePos.x,
                    top: mousePos.y,
                    mixBlendMode: 'difference',
                }}
            />
        </div>
    );
}