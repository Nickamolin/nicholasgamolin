"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useMotionValue, MotionValue } from "motion/react";

interface MouseContextType {
    mouseX: MotionValue<number>;
    mouseY: MotionValue<number>;
}

const MouseContext = createContext<MouseContextType | null>(null);

export const MouseProvider = ({ children }: { children: React.ReactNode }) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            mouseX.set(event.clientX);
            mouseY.set(event.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <MouseContext.Provider value={{ mouseX, mouseY }}>
            {children}
        </MouseContext.Provider>
    );
};

export const useMousePosition = () => {
    const context = useContext(MouseContext);
    if (!context) {
        throw new Error("useMousePosition must be used within a MouseProvider");
    }
    return context;
};
