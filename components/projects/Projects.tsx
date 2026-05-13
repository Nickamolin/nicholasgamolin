import React from 'react';
import FilteredProjectList from './FilteredProjectList';
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Projects({ initialSlug }: { initialSlug?: string }) {
    const supabase = createSupabaseServerClient();

    const { data: projects, error } = await supabase
        .from("projects")
        .select("id, title, slug, subtitle, thumbnail_url, date_published, info_url, visible, type, embed_url, embed_type, embed_aspect_ratio, mobile_aspect_ratio, hover_text, render_title, summary, role, tools_used, action_button_text")
        .eq("visible", true)
        .order("date_published", { ascending: false });

    if (error) {
        return <pre>Failed to load projects: {error.message}</pre>
    }

    return (
        <FilteredProjectList initialProjects={projects || []} initialSlug={initialSlug} />
    );
}