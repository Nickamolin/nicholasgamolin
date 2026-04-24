"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";

export default function InvertImage({ src, alt }: { src: string, alt: string }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full cursor-none overflow-hidden rounded-xl group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
        >
            <Image
                src={src}
                fill
                alt={alt}
                className="rounded-xl object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* 1. Inversion Layer */}
            <motion.div
                initial={false}
                animate={{
                    opacity: isHovered ? 1 : 0,
                    width: isHovered ? 140 : 0,
                    height: isHovered ? 100 : 0
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute pointer-events-none hidden md:block bg-white z-10"
                style={{
                    left: mousePos.x,
                    top: mousePos.y,
                    transform: 'translate(-50%, -50%)',
                    mixBlendMode: 'difference',
                }}
            />

            {/* 2. Brackets Layer (4 Corners) */}
            <motion.div
                initial={false}
                animate={{
                    opacity: isHovered ? 1 : 0,
                    width: isHovered ? 140 : 0,
                    height: isHovered ? 100 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute pointer-events-none hidden md:block z-20"
                style={{
                    left: mousePos.x,
                    top: mousePos.y,
                    transform: 'translate(-50%, -50%)',
                }}
            >
                {/* Top-Left */}
                <div className="absolute left-0 top-0 w-6 h-6 border-l-2 border-t-2 border-white" />

                {/* Top-Right */}
                <div className="absolute right-0 top-0 w-6 h-6 border-r-2 border-t-2 border-white" />

                {/* Bottom-Left */}
                <div className="absolute left-0 bottom-0 w-6 h-6 border-l-2 border-b-2 border-white" />

                {/* Bottom-Right */}
                <div className="absolute right-0 bottom-0 w-6 h-6 border-r-2 border-b-2 border-white" />
            </motion.div>
        </div>
    );
}