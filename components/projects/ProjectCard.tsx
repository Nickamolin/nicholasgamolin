"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { Project } from "./types";
import Modal from "../Modal";

type ProjectCardProps = {
    project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isInteractive = Boolean(project.embed_url || project.info_url);

    return (
        <>
            <a
                href={project.embed_url ? undefined : (project.info_url || undefined)}
                target={project.embed_url ? undefined : (project.info_url ? "_blank" : undefined)}
                rel={project.embed_url ? undefined : (project.info_url ? "noopener noreferrer" : undefined)}
                className={`relative w-full aspect-square overflow-hidden group rounded-3xl shadow-2xl block ${isInteractive ? "cursor-pointer" : "cursor-default"}`}
                onClick={(e) => {
                    if (project.embed_url) {
                        e.preventDefault();
                        setIsModalOpen(true);
                    } else if (!isInteractive) {
                        e.preventDefault();
                    }
                }}
            >
                <div className="block w-full h-full relative">
                    <Image
                        src={project.thumbnail_url}
                        alt={project.title}
                        fill
                        style={project.embed_type === 'pico8' ? { imageRendering: "pixelated" } : undefined}
                        className="object-cover saturate-100 md:saturate-0 md:group-hover:saturate-100 md:group-hover:scale-105 transition-all duration-500"
                    />

                    {/* Title Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end">
                        <h3 className="text-white font-bold text-xl sm:text-2xl text-shadow-md opacity-100 translate-y-0 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-500">
                            {project.title}
                        </h3>
                        <div className="flex justify-between items-center w-full mt-1 opacity-100 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-500 delay-75">
                            {project.subtitle && (
                                <p className="text-gray-200 text-sm sm:text-base pr-4">
                                    {project.subtitle}
                                </p>
                            )}
                            {project.date_published && (
                                <span className="text-gray-300 text-sm sm:text-base font-medium whitespace-nowrap">
                                    {new Date(project.date_published).getFullYear()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </a>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                infoUrl={project.info_url}
                embedUrl={project.embed_url}
                embedType={project.embed_type}
            />
        </>
    )
}