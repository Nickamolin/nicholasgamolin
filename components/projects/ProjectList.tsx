import React from 'react';
import Image from 'next/image';
import ProjectCard from './ProjectCard';
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Project } from "./types";

export default async function ProjectList() {
    const supabase = createSupabaseServerClient();

    const { data: projects, error } = await supabase
        .from("projects")
        .select("id, title, subtitle, thumbnail_url, date_published, info_url, visible")
        .eq("visible", true)
        .order("date_published", { ascending: false });

    if (error) {
        return <pre>Failed to load projects: {error.message}</pre>
    }

    return (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full gap-4">
            {projects?.map((project: any) => (
                <ProjectCard key={project.id} project={project} />
            ))}
        </ul>
    );
}