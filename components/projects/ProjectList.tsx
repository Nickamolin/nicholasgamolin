import React from 'react';
import Image from 'next/image';
import ProjectCard from './ProjectCard';
import FilteredProjectList from './FilteredProjectList';
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Project } from "./types";

export default async function ProjectList() {
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