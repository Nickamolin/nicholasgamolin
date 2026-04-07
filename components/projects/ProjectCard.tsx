"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useLoading } from "../LoadingProvider";
import type { Project } from "./types";
import Modal from "../Modal";

type ProjectCardProps = {
    project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const { registerLoadingItem, resolveLoadingItem } = useLoading();

    const hasHoverText = Boolean(project.hover_text);
    const isInteractive = Boolean(project.embed_url || project.info_url);

    // Register this card as a "loading item" so the loading screen waits for us
    useEffect(() => {
        const id = project.id.toString();
        registerLoadingItem(id);

        return () => {
            // Cleanup: if the card unmounts, resolve the item so we don't block the screen
            resolveLoadingItem(id);
        };
    }, [project.id]);

    return (
        <>
            <a
                href={project.embed_url ? undefined : (project.info_url || undefined)}
                target={project.embed_url ? undefined : (project.info_url ? "_blank" : undefined)}
                rel={project.embed_url ? undefined : (project.info_url ? "noopener noreferrer" : undefined)}
                className={`relative w-full aspect-square overflow-hidden group border-2 border-white/20 rounded-2xl block ${hasHoverText && isHovered ? "cursor-none" : "cursor-default"}`}
                onMouseEnter={(e) => {
                    if (hasHoverText) {
                        setMousePos({ x: e.clientX, y: e.clientY });
                        setIsHovered(true);
                    }
                }}
                onMouseLeave={() => hasHoverText && setIsHovered(false)}
                onMouseMove={(e) => {
                    if (hasHoverText) {
                        setMousePos({ x: e.clientX, y: e.clientY });
                    }
                }}
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
                        className="object-cover saturate-0 group-hover:saturate-100 [@media(hover:none)]:saturate-100 group-hover:scale-105 transition-all duration-500"
                        onLoad={() => resolveLoadingItem(project.id.toString())}
                        onError={() => resolveLoadingItem(project.id.toString())} // Resolve even on error so we don't hang
                    />

                    {/* Title Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 transition-all duration-500">
                        {project.render_title && (
                            <h3 className="text-white font-title font-bold text-xl sm:text-2xl text-shadow-md translate-y-2 group-hover:translate-y-0 [@media(hover:none)]:translate-y-0 transition-transform duration-500">
                                {project.title}
                            </h3>
                        )}
                        <div className="flex justify-between items-center w-full mt-1 translate-y-2 group-hover:translate-y-0 [@media(hover:none)]:translate-y-0 transition-transform duration-500 delay-75">
                            {project.subtitle && (
                                <p className="text-gray-200 font-subtitle text-xs sm:text-sm pr-4 uppercase tracking-wider">
                                    {project.subtitle}
                                </p>
                            )}
                            {project.date_published && (
                                <span className="text-gray-300 font-subtitle text-xs sm:text-sm font-medium whitespace-nowrap">
                                    {new Date(project.date_published).getFullYear()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </a>

            {/* Hover Tooltip */}
            {hasHoverText && (
                <div
                    className={`fixed z-[100] pointer-events-none transition-opacity duration-300 [@media(hover:none)]:hidden ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    style={{
                        left: mousePos.x,
                        top: mousePos.y,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    <span className="bg-black/50 text-white px-3 py-1.5 rounded-lg text-sm sm:text-base font-body font-medium shadow-xl whitespace-nowrap">
                        {project.hover_text}
                    </span>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                infoUrl={project.info_url}
                embedUrl={project.embed_url}
                embedType={project.embed_type}
                embedAspectRatio={project.embed_aspect_ratio}
            />
        </>
    )
}