"use client";

import React, { useState } from "react";
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

export default function WorkExperienceCard({ work, project }: WorkExperienceCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const dateRange = `${formatDate(work.start_date)} — ${work.end_date ? formatDate(work.end_date) : "Present"}`;

    return (
        <>
            <div className="group flex flex-col md:flex-row items-start md:items-center w-full gap-4 md:gap-8 py-8 border-b border-white/10 last:border-b-0 transition-all duration-300">

                {/* Date range */}
                <div className="md:w-[200px] md:shrink-0">
                    <span className="text-sm font-subtitle font-medium text-gray-500 tracking-wider uppercase whitespace-nowrap">
                        {dateRange}
                    </span>
                </div>

                {/* Title & Company */}
                <div className="flex flex-col gap-1 md:w-[280px] md:shrink-0">
                    <h3 className="text-lg md:text-xl font-title font-bold text-white">
                        {work.title}
                    </h3>
                    {work.company_url ? (
                        <a
                            href={work.company_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-subtitle font-medium text-gray-400 hover:text-white transition-colors duration-300 underline underline-offset-2 decoration-white/20 hover:decoration-white/60"
                        >
                            {work.company}
                        </a>
                    ) : (
                        <span className="text-sm font-subtitle font-medium text-gray-400">
                            {work.company}
                        </span>
                    )}
                </div>

                {/* Responsibilities */}
                <div className="flex-1">
                    <p className="text-sm md:text-base font-body text-gray-400 leading-relaxed">
                        {work.responsibilities}
                    </p>
                </div>

                {/* View Project button */}
                <div className="w-full md:w-[140px] md:shrink-0 flex justify-center md:justify-end">
                    {project && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs font-subtitle font-bold tracking-[0.15em] uppercase text-white border border-white/20 rounded-lg px-4 py-2 hover:bg-white/10 transition-all duration-300 whitespace-nowrap cursor-pointer"
                        >
                            View
                        </button>
                    )}
                </div>
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
                />
            )}
        </>
    );
}
