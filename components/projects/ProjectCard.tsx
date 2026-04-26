"use client";
import React, { useEffect, useState, useLayoutEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import type { Project } from "./types";
import Modal from "./Modal";
import { useMousePosition } from "@/components/context/MouseContext";

type ProjectCardProps = {
    project: Project;
};

const OptimizedTooltip = ({ text, isHovered, containerRef }: { text: string; isHovered: boolean; containerRef: React.RefObject<HTMLElement> }) => {
    const { mouseX, mouseY } = useMousePosition();
    const [rect, setRect] = useState<{ left: number; top: number } | null>(null);

    // Measure the card position only when hovered to calculate local coordinates
    useLayoutEffect(() => {
        if (isHovered && containerRef.current) {
            const r = containerRef.current.getBoundingClientRect();
            setRect({ left: r.left, top: r.top });
        }
    }, [isHovered, containerRef]);

    // Update rect on scroll/resize
    useEffect(() => {
        if (!isHovered) return;
        const update = () => {
            if (containerRef.current) {
                const r = containerRef.current.getBoundingClientRect();
                setRect({ left: r.left, top: r.top });
            }
        };
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, [isHovered, containerRef]);

    // Use transforms for high-performance coordinate mapping
    // These react to both mouse movement and rect updates
    const x = useTransform(mouseX, (v) => v - (rect?.left || 0));
    const y = useTransform(mouseY, (v) => v - (rect?.top || 0));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl z-[100]">
            <AnimatePresence>
                {isHovered && rect && (
                    <motion.div
                        initial={{ scaleX: 0, opacity: 0, x: "-50%", y: "-50%" }}
                        animate={{
                            scaleX: 1,
                            opacity: 1,
                            x: "-50%",
                            y: "-50%",
                        }}
                        exit={{
                            scaleX: 0,
                            opacity: 0,
                            x: "-50%",
                            y: "-50%",
                        }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute pointer-events-none [@media(hover:none)]:hidden origin-center"
                        style={{
                            left: x,
                            top: y,
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
                )}
            </AnimatePresence>
        </div>
    );
};

export default function ProjectCard({ project }: ProjectCardProps) {
    const { mouseX, mouseY } = useMousePosition();
    const cardRef = React.useRef<HTMLAnchorElement>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const hasHoverText = Boolean(project.hover_text);
    const isInteractive = Boolean(project.embed_url || project.info_url);

    return (
        <>
            <a
                ref={cardRef}
                href={project.embed_url ? undefined : (project.info_url || undefined)}
                target={project.embed_url ? undefined : (project.info_url ? "_blank" : undefined)}
                rel={project.embed_url ? undefined : (project.info_url ? "noopener noreferrer" : undefined)}
                className={`relative w-full aspect-square overflow-hidden group border-2 border-white/20 rounded-2xl block ${hasHoverText && isHovered ? "cursor-none" : "cursor-default"}`}
                onMouseEnter={(e) => {
                    if (hasHoverText) {
                        // Bootstrap the global mouse position immediately on entry
                        // to prevent the "top-left jump" before the first move event
                        mouseX.set(e.clientX);
                        mouseY.set(e.clientY);
                        setIsHovered(true);
                    }
                }}
                onMouseLeave={() => hasHoverText && setIsHovered(false)}
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
                        style={project.embed_type === 'pico8' ? { imageRendering: "pixelated" } : undefined}
                        className="object-cover saturate-0 group-hover:saturate-100 [@media(hover:none)]:saturate-100 group-hover:scale-105 transition-all duration-500"
                    />

                    {/* Title Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-all duration-500">
                        <h3 className="text-white font-title font-bold text-xl sm:text-2xl text-shadow-md translate-y-2 group-hover:translate-y-0 [@media(hover:none)]:translate-y-0 transition-transform duration-500">
                            {project.title}
                        </h3>
                        <div className="flex justify-between items-center w-full mt-1 translate-y-2 group-hover:translate-y-0 [@media(hover:none)]:translate-y-0 transition-transform duration-500 delay-75">
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
                        isHovered={isHovered}
                        containerRef={cardRef}
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
    )
}
