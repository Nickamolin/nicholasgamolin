"use client";

import React, { useState } from "react";
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
            <div className="w-full max-w-[2000px] flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-6">
                <span className="text-xs md:text-sm text-white font-subtitle font-bold tracking-[0.1em] uppercase whitespace-nowrap">Sort By:</span>
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                    {filterOptions.map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`text-xs md:text-sm font-subtitle tracking-[0.1em] uppercase transition-all whitespace-nowrap ${filter === type
                                ? "font-bold text-blue-500 shadow-md"
                                : "font-medium text-gray-400 hover:text-gray-300"
                                }`}
                        >
                            {type}
                        </button>
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
