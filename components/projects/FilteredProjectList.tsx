"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import ProjectCard from "./ProjectCard";
import type { Project } from "./types";

type FilteredProjectListProps = {
    initialProjects: Project[];
};

export default function FilteredProjectList({ initialProjects }: FilteredProjectListProps) {
    const [filter, setFilter] = useState("All");

    // Dynamically get available types from data, so if you add a new type in Supabase, this updates automatically.
    const filterOptions = ["All", ...Array.from(new Set(initialProjects.map(p => p.type))).filter(Boolean).sort().reverse()];

    const filteredProjects = filter === "All"
        ? initialProjects
        : initialProjects.filter(p => p.type === filter);

    return (
        <div className="w-full max-w-[2000px] flex flex-col items-center">
            {/* Filter Menu */}
            <div className="w-full flex flex-col items-center gap-4 my-4">
                {/* Header with Dividers */}
                <div className="flex items-center justify-center gap-4 w-full max-w-xl">
                    <span className="text-xs md:text-sm font-subtitle font-bold text-gray-500 uppercase tracking-[0.4em] whitespace-nowrap">
                        Filter By:
                    </span>
                </div>

                {/* Grid for Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-3xl px-4">
                    {filterOptions.map(type => (
                        <motion.button
                            key={type}
                            onClick={() => setFilter(type)}
                            whileTap={{ scale: 0.95 }}
                            className={`relative px-4 py-2.5 text-[10px] md:text-xs font-subtitle tracking-[0.2em] uppercase rounded-full transition-colors duration-300 ${filter === type
                                ? "text-black"
                                : "text-white/40 hover:text-white"
                                }`}
                        >
                            {filter === type && (
                                <motion.div
                                    layoutId="activeFilter"
                                    className="absolute inset-0 bg-white rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{type}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Project Grid */}
            {filteredProjects.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-[2000px] gap-4">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </ul>
            ) : (
                <div className="w-full max-w-[2000px] py-12 text-center text-gray-500">
                    No projects found for this category.
                </div>
            )}
        </div>
    );
}
