import React from 'react';
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProjectCard from './ProjectCard';

export default async function Highlights() {
    const supabase = createSupabaseServerClient();

    const { data: projects, error } = await supabase
        .from("projects")
        .select("id, title, subtitle, thumbnail_url, date_published, info_url, visible, type, embed_url, embed_type, embed_aspect_ratio, hover_text, render_title")
        .in("id", [1, 2, 3, 6]) // 1: Endangered Cake Museum, 2: Brick Digger, 3: UBlock, 6: Get to Know Flourish
        .order("date_published", { ascending: false });

    if (error) {
        return <pre>Failed to load projects: {error.message}</pre>
    }

    return (
        <div className="w-full max-w-[2000px] flex flex-col items-center">
            <ul className="grid grid-cols-1 sm:grid-cols-2 w-full max-w-[2000px] gap-4">
                {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </ul>
        </div>
    );
}