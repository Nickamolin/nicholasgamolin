import React from "react";
import Image from "next/image";
import type { Project } from "./types";


type ProjectCardProps = {
    project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
    return (
        <Image src={project.thumbnail_url} alt={project.name} width={300} height={300} />
    )
}