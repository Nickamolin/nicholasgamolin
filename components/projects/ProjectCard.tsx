"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useMotionValue, useSpring } from "motion/react";
import type { Project } from "./types";
import Modal from "./Modal";

type ProjectCardProps = {
    project: Project;
};

const OptimizedTooltip = ({ text, isHovered, initialX, initialY }: { text: string; isHovered: boolean, initialX: number, initialY: number }) => {
    const mouseX = useMotionValue(initialX);
    const mouseY = useMotionValue(initialY);

    useEffect(() => {
        if (!isHovered) return;

        // Reset to entry position immediately
        mouseX.set(initialX);
        mouseY.set(initialY);

        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [isHovered, mouseX, mouseY, initialX, initialY]);

    return (
        <AnimatePresence>
            {isHovered && (
                <motion.div
                    initial={{ scaleX: 0, opacity: 0, x: "-50%", y: "-50%" }}
                    animate={{ scaleX: 1, opacity: 1, x: "-50%", y: "-50%" }}
                    exit={{ scaleX: 0, opacity: 0, x: "-50%", y: "-50%" }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="fixed z-[100] pointer-events-none [@media(hover:none)]:hidden origin-center"
                    style={{
                        left: mouseX,
                        top: mouseY,
                    }}
                >
                    <div className="relative bg-black/10 backdrop-blur-xs text-white px-6 py-2 text-xs sm:text-sm font-subtitle font-medium tracking-[0.2em] uppercase shadow-2xl border border-white/10 whitespace-nowrap">
                        {/* Viewfinder Brackets */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white" />

                        {text}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default function ProjectCard({ project }: ProjectCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [entryPos, setEntryPos] = useState({ x: 0, y: 0 });

    const hasHoverText = Boolean(project.hover_text);
    const isInteractive = Boolean(project.embed_url || project.info_url);

    return (
        <>
            <a
                href={project.embed_url ? undefined : (project.info_url || undefined)}
                target={project.embed_url ? undefined : (project.info_url ? "_blank" : undefined)}
                rel={project.embed_url ? undefined : (project.info_url ? "noopener noreferrer" : undefined)}
                className={`relative w-full aspect-square overflow-hidden group border-2 border-white/20 rounded-2xl block ${hasHoverText && isHovered ? "cursor-none" : "cursor-default"}`}
                onMouseEnter={(e) => {
                    if (hasHoverText) {
                        setEntryPos({ x: e.clientX, y: e.clientY });
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
            </a>

            {/* Hover Tooltip (Optimized Component) */}
            {hasHoverText && (
                <OptimizedTooltip
                    text={project.hover_text!}
                    isHovered={isHovered}
                    initialX={entryPos.x}
                    initialY={entryPos.y}
                />
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
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
