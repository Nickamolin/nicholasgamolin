"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Modal from "../projects/Modal";
import type { Project } from "../projects/types";

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
    onViewClick?: () => void;
}

const ExperienceContent = ({ work, project, variant, dateRange, onViewClick }: ExperienceContentProps) => {
    const isBase = variant === "base";

    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center w-full gap-4 md:gap-8 py-8 px-8 md:px-12">
            {/* Date range */}
            <div className="lg:w-[200px] lg:shrink-0">
                <span className={`text-sm font-subtitle font-medium tracking-wider uppercase whitespace-nowrap transition-colors duration-300 ${isBase ? 'text-gray-500' : 'text-neutral-500'}`}>
                    {dateRange}
                </span>
            </div>

            {/* Title & Company */}
            <div className="flex flex-col gap-1 md:w-[280px] md:shrink-0">
                <h3 className={`text-lg md:text-xl font-title font-bold transition-colors duration-300 ${isBase ? 'text-white' : 'text-neutral-900'}`}>
                    {work.title}
                </h3>
                {work.company_url ? (
                    <a
                        href={work.company_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => !isBase && e.preventDefault()} // Only base layer links are clickable to avoid double triggering
                        className={`text-sm font-subtitle font-medium transition-colors duration-300 underline underline-offset-2 ${isBase ? 'text-gray-400 hover:text-white decoration-white/20 hover:decoration-white/60' : 'text-neutral-600 decoration-neutral-900/20'}`}
                    >
                        {work.company}
                    </a>
                ) : (
                    <span className={`text-sm font-subtitle font-medium transition-colors duration-300 ${isBase ? 'text-gray-400' : 'text-neutral-600'}`}>
                        {work.company}
                    </span>
                )}
            </div>

            {/* Responsibilities */}
            <div className="flex-1">
                <p className={`text-sm md:text-base font-body leading-relaxed transition-colors duration-300 ${isBase ? 'text-gray-400' : 'text-neutral-700'}`}>
                    {work.responsibilities}
                </p>
            </div>

            {/* View Project button */}
            <div className="w-full lg:w-[140px] lg:shrink-0 flex justify-center lg:justify-end">
                {project && (
                    <button
                        onClick={onViewClick}
                        className={`text-xs font-subtitle font-bold tracking-[0.15em] uppercase border rounded-lg px-4 py-2 transition-all duration-300 whitespace-nowrap cursor-pointer ${isBase ? 'text-white border-white/20 hover:bg-white/10' : 'text-neutral-900 border-neutral-900/20'}`}
                    >
                        View
                    </button>
                )}
            </div>
        </div>
    );
};

export default function WorkExperienceCard({ work, project }: WorkExperienceCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFullyGrown, setIsFullyGrown] = useState(false);

    const dateRange = `${formatDate(work.start_date)} — ${work.end_date ? formatDate(work.end_date) : "Present"}`;

    return (
        <>
            <div
                onMouseEnter={() => {
                    setIsHovered(true);
                    setIsFullyGrown(false);
                }}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative w-full border-b border-white/10 last:border-b-0 transition-all duration-300 overflow-hidden"
            >
                {/* Base Layer (White on Black) */}
                <ExperienceContent
                    work={work}
                    project={project}
                    variant="base"
                    dateRange={dateRange}
                    onViewClick={() => setIsModalOpen(true)}
                />

                {/* Hover Reveal Layer (Black on White) */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ clipPath: "inset(0 100% 0 0)" }}
                            animate={{ clipPath: "inset(0 0% 0 0)" }}
                            exit={{
                                clipPath: isFullyGrown ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
                                transition: {
                                    duration: 0.8,
                                    ease: [0.22, 1, 0.36, 1]
                                }
                            }}
                            onAnimationComplete={() => setIsFullyGrown(true)}
                            transition={{
                                duration: 0.8,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                            className="absolute inset-0 z-20 bg-neutral-100 overflow-hidden pointer-events-none"
                        >
                            <ExperienceContent
                                work={work}
                                project={project}
                                variant="revealed"
                                dateRange={dateRange}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
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
