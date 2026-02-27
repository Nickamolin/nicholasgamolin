import React from "react";
import Image from "next/image";
import type { Project } from "./types";


type ProjectCardProps = {
    project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
    return (
        <div className="relative w-full aspect-square overflow-hidden">
            <a href={project.info_url} target="_blank" rel="noopener noreferrer">
                <Image
                    src={project.thumbnail_url}
                    alt={project.name}
                    fill
                    className="object-cover saturate-0 hover:saturate-100 hover:scale-105 transition-all duration-500 "
                />
            </a>
        </div>
    )
}