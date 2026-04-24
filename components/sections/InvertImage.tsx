"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

export default function InvertImage({ src, alt }: { src: string, alt: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Ripple state for both clicks and taps
    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

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

        // Spawn inversion ripple
        setRipples((prev) => [...prev, { id: baseId, x, y }]);

        // Spawn reversion ripple
        setTimeout(() => {
            setRipples((prev) => [...prev, { id: baseId + 1, x, y }]);

            // Clean up
            setTimeout(() => {
                setRipples((prev) => prev.filter(r => r.id !== baseId && r.id !== baseId + 1));
            }, 1000);
        }, 1000);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full cursor-none overflow-hidden rounded-xl group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
            onPointerDown={handlePointerDown}
        >
            <Image
                src={src}
                fill
                alt={alt}
                className="rounded-xl object-cover transition-transform duration-700 group-hover:scale-105"
            />

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
                className="absolute pointer-events-none bg-white rounded-full z-30 w-5 h-5"
                style={{
                    left: mousePos.x,
                    top: mousePos.y,
                    mixBlendMode: 'difference',
                }}
            />
        </div>
    );
}