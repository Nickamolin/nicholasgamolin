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
    const filterOptions = ["All", ...Array.from(new Set(initialProjects.map(p => p.type))).filter(Boolean)];

    const filteredProjects = filter === "All"
        ? initialProjects
        : initialProjects.filter(p => p.type === filter);

    return (
        <div className="w-full flex flex-col items-center">
            {/* Filter Menu */}
            <div className="w-full max-w-[1000px] flex items-center gap-4 mb-6 pt-2">
                <span className="text-gray-400 font-medium whitespace-nowrap">Sort By:</span>
                <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                    {filterOptions.map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${filter === type
                                ? "bg-white text-black shadow-md scale-105"
                                : "bg-gray-800/80 text-gray-400 hover:bg-gray-700 hover:text-white"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Project Grid */}
            {filteredProjects.length > 0 ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full gap-4 max-w-[1000px]">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </ul>
            ) : (
                <div className="w-full max-w-[1000px] py-12 text-center text-gray-500">
                    No projects found for this category.
                </div>
            )}
        </div>
    );
}
