"use client";

import React, { useState, useEffect, useRef } from "react";

const SYMBOLS = "!#$%&?@[]{}<>~+*=";
const GLITCH_RADIUS = 25; // Much smaller radius as requested

interface GlitchCharacterProps {
    char: string;
    mousePos: { x: number; y: number };
    isMoving: boolean;
}

const GlitchCharacter = ({ char, mousePos, isMoving }: GlitchCharacterProps) => {
    const spanRef = useRef<HTMLSpanElement>(null);
    const [displayChar, setDisplayChar] = useState(char);
    const [isGlitched, setIsGlitched] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!spanRef.current || char === " ") return;

        const update = () => {
            if (!spanRef.current) return;
            const rect = spanRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const distance = Math.hypot(mousePos.x - centerX, mousePos.y - centerY);

            // Only glitch if within radius AND the mouse is currently moving
            if (distance < GLITCH_RADIUS && isMoving) {
                if (!intervalRef.current) {
                    setIsGlitched(true);
                    // Trigger the first change immediately to remove the delay
                    setDisplayChar(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
                    
                    intervalRef.current = setInterval(() => {
                        setDisplayChar(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
                    }, 120); // Slower glitch rate (was 80ms)
                }
            } else {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    setIsGlitched(false);
                    setDisplayChar(char);
                }
            }
        };

        update();
    }, [mousePos, char, isMoving]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    if (char === " ") return <span> </span>;

    return (
        <span 
            ref={spanRef} 
            className={`transition-colors duration-200 ${isGlitched ? 'text-white' : 'text-gray-400'}`}
        >
            {displayChar}
        </span>
    );
};

export default function GlitchText({ text }: { text: string }) {
    const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
    const [isMoving, setIsMoving] = useState(false);
    const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
            setIsMoving(true);

            if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
            moveTimeoutRef.current = setTimeout(() => {
                setIsMoving(false);
            }, 100); // Consider "stopped" after 100ms of no movement
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
        };
    }, []);

    // Split text into words to preserve natural spacing and justification
    const words = text.split(" ");

    return (
        <span className="font-body font-medium">
            {words.map((word, i) => (
                <React.Fragment key={i}>
                    <span className="whitespace-nowrap">
                        {word.split("").map((char, j) => (
                            <GlitchCharacter key={j} char={char} mousePos={mousePos} isMoving={isMoving} />
                        ))}
                    </span>
                    {/* Space must be outside the nowrap span to allow wrapping */}
                    {i < words.length - 1 && " "}
                </React.Fragment>
            ))}
        </span>
    );
}
