import React from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import WorkExperienceCard from "./WorkExperienceCard";

export default async function WorkExperience() {

    const supabase = createSupabaseServerClient();

    const { data: work, error } = await supabase
        .from("work")
        .select("id, title, company, start_date, end_date, responsibilities, project_id, company_url")
        .order("end_date", { ascending: false });

    if (error) {
        return <pre>Failed to load work experience: {error.message}</pre>
    }

    // Fetch associated projects for work entries that have a project_id
    const projectIds = (work || [])
        .map(w => w.project_id)
        .filter((id): id is number => id !== null);

    let projectsMap: Record<number, any> = {};

    if (projectIds.length > 0) {
        const { data: projects } = await supabase
            .from("projects")
            .select("id, title, subtitle, thumbnail_url, date_published, info_url, visible, type, embed_url, embed_type, embed_aspect_ratio, hover_text, render_title, summary, role, tools_used, action_button_text")
            .in("id", projectIds);

        if (projects) {
            projectsMap = Object.fromEntries(projects.map(p => [p.id, p]));
        }
    }

    return (
        <div className="flex flex-col w-full">
            {work?.map((entry) => (
                <WorkExperienceCard
                    key={entry.id}
                    work={entry}
                    project={entry.project_id ? projectsMap[entry.project_id] ?? null : null}
                />
            ))}
        </div>
    );
}