import React from "react";
import Image from "next/image";
import type { Project } from "./types";


type ProjectCardProps = {
    project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
    return (
        <div className="relative w-full aspect-square overflow-hidden group rounded-3xl">
            <a href={project.info_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
                <Image
                    src={project.thumbnail_url}
                    alt={project.title}
                    fill
                    className="object-cover saturate-0 group-hover:saturate-100 group-hover:scale-105 transition-all duration-500"
                />

                {/* Title Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end">
                    <h3 className="text-white font-bold text-xl sm:text-2xl text-shadow-md translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        {project.title}
                    </h3>
                    {project.subtitle && (
                        <p className="text-gray-200 text-sm sm:text-base translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-75">
                            {project.subtitle}
                        </p>
                    )}
                </div>
            </a>
        </div>
    )
}