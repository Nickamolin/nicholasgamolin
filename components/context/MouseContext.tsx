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

        // Capture mouse position on any interaction to bootstrap the context
        // Use capture phase to ensure we get coordinates even if propagation is stopped
        window.addEventListener("mousemove", handleMouseMove, { capture: true });
        window.addEventListener("mouseover", handleMouseMove, { capture: true });
        window.addEventListener("mousedown", handleMouseMove, { capture: true });
        
        let rafId: number;
        let isScrolling = false;
        let scrollTimeout: NodeJS.Timeout;

        let lastTarget: Element | null = null;

        // Force browser and React to re-evaluate what element is under the mouse during scroll.
        // Natively, hovering states don't update if the pointer is physically still.
        const syncHoverState = () => {
            if (!isScrolling) return;
            const x = mouseX.get();
            const y = mouseY.get();
            
            // Only fire if we actually have a mouse position (don't fire at 0,0 implicitly)
            if (x !== 0 || y !== 0) {
                const target = document.elementFromPoint(x, y);
                if (target && target !== lastTarget) {
                    if (lastTarget) {
                        lastTarget.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, clientX: x, clientY: y, relatedTarget: target }));
                    }
                    target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: x, clientY: y, relatedTarget: lastTarget }));
                    target.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y }));
                    lastTarget = target;
                } else if (target) {
                    target.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y }));
                }
            }
            rafId = requestAnimationFrame(syncHoverState);
        };

        const handleScroll = () => {
            if (!isScrolling) {
                isScrolling = true;
                rafId = requestAnimationFrame(syncHoverState);
            }
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
                cancelAnimationFrame(rafId);
                // Fire one final sync to ensure perfect precision when scroll fully stops
                const x = mouseX.get();
                const y = mouseY.get();
                if (x !== 0 || y !== 0) {
                    const target = document.elementFromPoint(x, y);
                    if (target && target !== lastTarget) {
                        if (lastTarget) {
                            lastTarget.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, clientX: x, clientY: y, relatedTarget: target }));
                        }
                        target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, clientX: x, clientY: y, relatedTarget: lastTarget }));
                        target.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y }));
                        lastTarget = target;
                    } else if (target) {
                        target.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: y }));
                    }
                }
            }, 100); // 100ms debounce
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("mousemove", handleMouseMove, { capture: true });
            window.removeEventListener("mouseover", handleMouseMove, { capture: true });
            window.removeEventListener("mousedown", handleMouseMove, { capture: true });
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(scrollTimeout);
            cancelAnimationFrame(rafId);
        };
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
