"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 my-8 px-4">
                <span className="text-xs md:text-sm font-subtitle font-medium text-center text-gray-400 tracking-[0.2em] uppercase">
                    Filter By:
                </span>

                <div className="flex flex-row flex-wrap items-center justify-center gap-2 md:gap-3">
                    {filterOptions.map(type => (
                        <motion.button
                            key={type}
                            onClick={() => setFilter(type)}
                            whileTap={{ scale: 0.95 }}
                            className={`relative px-6 py-2 text-xs md:text-sm font-subtitle font-medium text-center tracking-[0.2em] uppercase rounded-full transition-all duration-300 border cursor-pointer ${filter === type
                                ? "text-black"
                                : "border-white/10 hover:bg-white/10 hover:text-white"
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
            <motion.div layout transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-[2000px]">
                {filteredProjects.length > 0 ? (
                    <motion.ul
                        layout
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-4"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.map((project) => (
                                <motion.li
                                    key={project.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <ProjectCard project={project} />
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </motion.ul>
                ) : (
                    <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="w-full py-12 text-center text-gray-500"
                    >
                        No projects found for this category.
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
