"use client";
import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

export default function TechIcon({ src, alt }: { src: string, alt: string }) {
    const [isActive, setIsActive] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const [canDrag, setCanDrag] = React.useState(false);

    React.useEffect(() => {
        const checkTouch = () => {
            return (
                'ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                window.matchMedia('(pointer: coarse)').matches
            );
        };
        // Enable dragging only on non-touch (cursor) devices
        setCanDrag(!checkTouch());
    }, []);

    const handleTap = () => {
        if (isActive) return;
        setIsActive(true);
        setTimeout(() => setIsActive(false), 1000);
    };

    return (
        <motion.div
            className="relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleTap}
            // Physics-based Drag Configuration
            drag={canDrag}
            dragSnapToOrigin
            dragElastic={0.15}
            dragTransition={{ bounceStiffness: 500, bounceDamping: 20 }}
            whileHover={{ cursor: canDrag ? 'grab' : 'default' }}
            whileDrag={{ scale: 1.15, cursor: 'grabbing', zIndex: 50 }}
            animate={{ scale: (isActive || isHovered) ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
        >

            {/* Monochrome Base Image */}
            <Image
                src={src}
                alt={alt}
                fill
                draggable={false}
                className="object-contain filter grayscale invert opacity-50 select-none"
            />

            {/* Masked Sheen Overlay */}
            <div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                style={{
                    WebkitMaskImage: `url('${src}')`,
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskImage: `url('${src}')`,
                    maskSize: 'contain',
                    maskPosition: 'center',
                    maskRepeat: 'no-repeat'
                }}
            >
                {/* The diagonal sheen sweeping right to left */}
                <motion.div
                    className="absolute top-0 bottom-0 w-[150%] bg-gradient-to-r from-transparent via-white/80 to-transparent"
                    initial={{ x: "150%", skewX: -25 }}
                    animate={{ x: (isActive || isHovered) ? "-150%" : "150%", skewX: -25 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                />
            </div>

            {/* Tooltip Name */}
            <motion.span
                className="absolute -bottom-6 text-xs font-subtitle font-medium text-white tracking-widest whitespace-nowrap pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: (isActive || isHovered) ? 1 : 0 }}
                transition={{ duration: 0.3 }}
            >
                {alt}
            </motion.span>
        </motion.div>
    );
}