"use client";
import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import type { Project } from "./types";
import Modal from "./Modal";
import { useMousePosition } from "@/components/context/MouseContext";

type ProjectCardProps = {
    project: Project;
};

const OptimizedTooltip = ({ text, cardRef, isModalOpen, hasInteracted, isTouchDevice }: { text: string; cardRef: React.RefObject<HTMLAnchorElement | null>; isModalOpen: boolean; hasInteracted: boolean; isTouchDevice: boolean }) => {
    const { mouseX, mouseY } = useMousePosition();
    const tooltipRef = React.useRef<HTMLDivElement>(null);

    // Sync tooltip offset perfectly, even during CSS scale transitions and scroll
    useLayoutEffect(() => {
        if (!hasInteracted) return;
        
        let rafId: number;
        const updateOffset = () => {
            if (tooltipRef.current && cardRef.current) {
                const r = cardRef.current.getBoundingClientRect();
                tooltipRef.current.style.marginLeft = `${-r.left}px`;
                tooltipRef.current.style.marginTop = `${-r.top}px`;
            }
            rafId = requestAnimationFrame(updateOffset);
        };

        updateOffset();
        
        return () => cancelAnimationFrame(rafId);
    }, [cardRef, hasInteracted]);

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none rounded-2xl z-[100] ${isModalOpen ? 'hidden' : 'block'}`}>
            <motion.div
                ref={tooltipRef}
                className={`absolute pointer-events-none origin-center flex items-center justify-center -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300
                    ${hasInteracted && !isTouchDevice ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    left: mouseX,
                    top: mouseY,
                }}
            >
                <div className="relative shadow-2xl whitespace-nowrap overflow-visible">
                    {/* Premium Glass Background Layer */}
                    <div className="absolute inset-0 bg-zinc-950/40 border border-white/10" />

                    {/* Content Layer */}
                    <div className="relative z-10 px-6 py-2 text-xs sm:text-sm font-subtitle font-medium tracking-[0.2em] uppercase text-white antialiased">
                        {/* Viewfinder Brackets */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white" />

                        {text}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default function ProjectCard({ project }: ProjectCardProps) {
    const { mouseX, mouseY } = useMousePosition();
    const cardRef = React.useRef<HTMLAnchorElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    useEffect(() => {
        const checkTouch = () => {
            return (
                'ontouchstart' in window ||
                navigator.maxTouchPoints > 0 ||
                window.matchMedia('(pointer: coarse)').matches
            );
        };
        setIsTouchDevice(checkTouch());
    }, []);

    const hasHoverText = Boolean(project.hover_text);
    const isInteractive = Boolean(project.embed_url || project.info_url);

    return (
        <>
            <a
                ref={cardRef}
                href={project.embed_url ? undefined : (project.info_url || undefined)}
                target={project.embed_url ? undefined : (project.info_url ? "_blank" : undefined)}
                rel={project.embed_url ? undefined : (project.info_url ? "noopener noreferrer" : undefined)}
                className={`relative w-full aspect-square overflow-hidden group border-2 border-white/20 rounded-2xl block ${hasHoverText && !isModalOpen && hasInteracted ? "cursor-none" : ""}`}
                onMouseEnter={(e) => {
                    mouseX.set(e.clientX);
                    mouseY.set(e.clientY);
                    setHasInteracted(true);
                }}
                onMouseMove={(e) => {
                    mouseX.set(e.clientX);
                    mouseY.set(e.clientY);
                    setHasInteracted(true);
                }}
                onMouseLeave={() => {
                    setHasInteracted(false);
                }}
                onClick={(e) => {
                    if (project.embed_url) {
                        e.preventDefault();
                        setIsModalOpen(true);
                    } else if (!isInteractive) {
                        e.preventDefault();
                    }
                }}
            >
                <div className="block w-full h-full relative">
                    <Image
                        src={project.thumbnail_url}
                        alt={project.title}
                        fill
                        draggable={false}
                        style={project.embed_type === 'pico8' ? { imageRendering: "pixelated" } : undefined}
                        className={`object-cover transition-all duration-500 ${isTouchDevice ? 'saturate-100 scale-100' : (hasInteracted && !isModalOpen ? 'saturate-100 scale-105' : 'saturate-0 scale-100')}`}
                    />

                    {/* Title Overlay */}
                    <div className={`absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end transition-all duration-500 ${isTouchDevice || (hasInteracted && !isModalOpen) ? 'opacity-100' : 'opacity-0'}`}>
                        <h3 className={`text-white font-title font-bold text-xl sm:text-2xl text-shadow-md transition-transform duration-500 ${isTouchDevice || (hasInteracted && !isModalOpen) ? 'translate-y-0' : 'translate-y-2'}`}>
                            {project.title}
                        </h3>
                        <div className={`flex justify-between items-center w-full mt-1 transition-transform duration-500 delay-75 ${isTouchDevice || (hasInteracted && !isModalOpen) ? 'translate-y-0' : 'translate-y-2'}`}>
                            {project.subtitle && (
                                <p className="text-gray-200 font-subtitle text-xs sm:text-sm pr-4 uppercase tracking-wider">
                                    {project.subtitle}
                                </p>
                            )}
                            {project.date_published && (
                                <span className="text-gray-300 font-subtitle text-xs sm:text-sm font-medium whitespace-nowrap">
                                    {new Date(project.date_published).getFullYear()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {/* Hover Tooltip (Optimized Component) */}
                {hasHoverText && (
                    <OptimizedTooltip
                        text={project.hover_text!}
                        cardRef={cardRef}
                        isModalOpen={isModalOpen}
                        hasInteracted={hasInteracted}
                        isTouchDevice={isTouchDevice}
                    />
                )}
            </a>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={project.title}
                year={new Date(project.date_published).getFullYear()}
                infoUrl={project.info_url}
                embedUrl={project.embed_url}
                embedType={project.embed_type}
                embedAspectRatio={project.embed_aspect_ratio}
                summary={project.summary}
                role={project.role}
                tools_used={project.tools_used}
                action_button_text={project.action_button_text}
            />
        </>
    );
}
