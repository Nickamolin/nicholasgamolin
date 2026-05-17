import React from 'react';
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProjectCard from './ProjectCard';

export default async function Highlights() {
    const supabase = createSupabaseServerClient();

    const highlightIds = [4, 1, 3, 6]; // 4: Negative Domain, 1: Endangered Cake Museum, 3: UBlock, 6: Get to Know Flourish

    const { data: projects, error } = await supabase
        .from("projects")
        .select("id, title, slug, subtitle, thumbnail_url, date_published, info_url, visible, type, embed_url, embed_type, embed_aspect_ratio, mobile_aspect_ratio, hover_text, render_title, summary, role, tools_used, action_button_text")
        .in("id", highlightIds)

    if (error) {
        return <pre>Failed to load projects: {error.message}</pre>
    }

    // Sort projects in the exact order of the highlightIds array
    const sortedProjects = projects
        ? [...projects].sort((a, b) => highlightIds.indexOf(a.id) - highlightIds.indexOf(b.id))
        : [];

    return (
        <div className="w-full max-w-7xl flex flex-col items-center">
            <ul className="grid grid-cols-1 sm:grid-cols-2 w-full gap-4">
                {sortedProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </ul>
        </div>
    );
}