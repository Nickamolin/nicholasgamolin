"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "motion/react";
import Modal from "../projects/Modal";
import type { Project } from "../projects/types";
import Button from "../UI/Button";

type WorkEntry = {
    id: number;
    title: string;
    company: string;
    start_date: string;
    end_date: string | null;
    responsibilities: string;
    company_url: string | null;
    project_id: number | null;
};

type WorkExperienceCardProps = {
    work: WorkEntry;
    project: Project | null;
};

/**
 * Formats a date string (YYYY-MM-DD) into "Mon YYYY" format.
 */
function formatDate(dateStr: string): string {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

interface ExperienceContentProps {
    work: WorkEntry;
    project: Project | null;
    variant: "base" | "revealed";
    dateRange: string;
    isButtonHovered: boolean;
    onButtonHoverChange: (isHovered: boolean) => void;
    onViewClick?: () => void;
}

const ExperienceContent = ({
    work,
    project,
    variant,
    dateRange,
    isButtonHovered,
    onButtonHoverChange,
    onViewClick
}: ExperienceContentProps) => {
    const isBase = variant === "base";

    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center w-full gap-4 md:gap-8 py-8 px-8 md:px-12">
            {/* Date range */}
            <div className="lg:w-[200px] lg:shrink-0">
                <span className={`text-sm font-subtitle font-medium tracking-wider uppercase whitespace-nowrap transition-colors duration-300 ${isBase ? 'text-gray-500' : 'text-zinc-500'}`}>
                    {dateRange}
                </span>
            </div>

            {/* Title & Company */}
            <div className="flex flex-col gap-1 md:w-[280px] md:shrink-0">
                <h3 className={`text-lg md:text-xl font-title font-bold transition-colors duration-300 ${isBase ? 'text-white' : 'text-zinc-900'}`}>
                    {work.title}
                </h3>
                {work.company_url ? (
                    <a
                        href={work.company_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm font-subtitle font-medium transition-colors duration-300 underline underline-offset-2 ${isBase ? 'text-gray-400 hover:text-white decoration-white/20 hover:decoration-white/60' : 'text-zinc-600 decoration-black/20'}`}
                    >
                        {work.company}
                    </a>
                ) : (
                    <span className={`text-sm font-subtitle font-medium transition-colors duration-300 ${isBase ? 'text-gray-400' : 'text-zinc-600'}`}>
                        {work.company}
                    </span>
                )}
            </div>

            {/* Responsibilities */}
            <div className="flex-1">
                <p className={`text-sm md:text-base text-justify font-body leading-relaxed transition-colors duration-300 ${isBase ? 'text-gray-400' : 'text-zinc-700'}`}>
                    {work.responsibilities}
                </p>
            </div>

            {/* View Project button */}
            <div className="w-full lg:w-[140px] lg:shrink-0 flex justify-center lg:justify-end">
                {project && (
                    <div
                        onMouseEnter={() => onButtonHoverChange(true)}
                        onMouseLeave={() => onButtonHoverChange(false)}
                        className="relative"
                    >
                        <Button
                            variant={isBase ? "secondary" : "primary"}
                            onClick={onViewClick}
                            isExternalHover={isButtonHovered}
                            className={!isBase ? "!bg-transparent !border !border-black/20 !text-zinc-900" : ""}
                        >
                            View
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function WorkExperienceCard({ work, project }: WorkExperienceCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isButtonHovered, setIsButtonHovered] = useState(false);

    // Tracking the 'anchor' side of the clip-path:
    // 'left' uses inset(0 X% 0 0) - wipes from/to the left
    // 'right' uses inset(0 0 0 X%) - wipes from/to the right
    const anchor = React.useRef<'left' | 'right'>('left');
    // Tracking completion to handle the transition between anchor sides
    const isFull = React.useRef(false);
    const controls = useAnimation();

    const dateRange = `${formatDate(work.start_date)} — ${work.end_date ? formatDate(work.end_date) : "Present"}`;

    useEffect(() => {
        if (isHovered) {
            // ENTERING
            if (!isFull.current && anchor.current === 'left') {
                // Fresh start from idle
                controls.set({ clipPath: "inset(0 100% 0 0)" });
            }
            // If anchor is 'right', we just animate back to 0% left-inset
            controls.start({
                clipPath: anchor.current === 'left' ? "inset(0 0% 0 0)" : "inset(0 0 0 0%)",
                transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
            }).then(() => {
                isFull.current = true;
            });
        } else {
            // EXITING
            if (isFull.current) {
                // Was fully open -> wipe out to the RIGHT
                anchor.current = 'right';
                isFull.current = false;
                controls.start({
                    clipPath: "inset(0 0 0 100%)",
                    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                }).then(() => {
                    anchor.current = 'left'; // Reset to left for next fresh hover
                });
            } else {
                // Was only partially open (or already shrinking)
                // If anchored left, retrace back to left. If anchored right, continue to right.
                controls.start({
                    clipPath: anchor.current === 'left' ? "inset(0 100% 0 0)" : "inset(0 0 0 100%)",
                    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
                }).then(() => {
                    if (anchor.current === 'right') anchor.current = 'left';
                });
            }
        }
    }, [isHovered, controls]);

    return (
        <>
            <div
                onMouseEnter={() => {
                    setIsHovered(true);
                }}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative w-screen left-1/2 -translate-x-1/2 border-b border-white/10 last:border-b-0 transition-all duration-300 overflow-hidden"
            >
                {/* Base Layer (Dimmed) */}
                <ExperienceContent
                    work={work}
                    project={project}
                    variant="base"
                    dateRange={dateRange}
                    isButtonHovered={isButtonHovered}
                    onButtonHoverChange={setIsButtonHovered}
                    onViewClick={() => setIsModalOpen(true)}
                />

                {/* Hover Reveal Layer (Soft Slate Effect) */}
                <motion.div
                    initial={{ clipPath: "inset(0 100% 0 0)" }}
                    animate={controls}
                    className="absolute inset-0 z-20 bg-zinc-200 overflow-hidden pointer-events-none"
                >
                    <div className="pointer-events-auto h-full w-full">
                        <ExperienceContent
                            work={work}
                            project={project}
                            variant="revealed"
                            dateRange={dateRange}
                            isButtonHovered={isButtonHovered}
                            onButtonHoverChange={setIsButtonHovered}
                            onViewClick={() => setIsModalOpen(true)}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Project Modal */}
            {project && (
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
            )}
        </>
    );
}
