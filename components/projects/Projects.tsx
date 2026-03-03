import React from 'react';
import FilteredProjectList from './FilteredProjectList';
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Projects() {
    const supabase = createSupabaseServerClient();

    const { data: projects, error } = await supabase
        .from("projects")
        .select("id, title, subtitle, thumbnail_url, date_published, info_url, visible, type")
        .eq("visible", true)
        .order("date_published", { ascending: false });

    if (error) {
        return <pre>Failed to load projects: {error.message}</pre>
    }

    return (
        <FilteredProjectList initialProjects={projects || []} />
    );
}