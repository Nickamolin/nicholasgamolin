import React from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function WorkExperience() {

    const supabase = createSupabaseServerClient();

    const { data: projects, error } = await supabase
        .from("work")
        .select("id, title, company, start_date, end_date, responsibilities, project_id, company_url")
        .order("end_date", { ascending: false });

    if (error) {
        return <pre>Failed to load projects: {error.message}</pre>
    }

    return (
        <div className="flex flex-col items-center w-full mt-8">

            {projects?.map((project) => (
                <div key={project.id} className="flex flex-col gap-4">
                    <h1>{project.title}</h1>
                    <p>{project.company}</p>
                    <p>{project.start_date}</p>
                    <p>{project.end_date}</p>
                    <p>{project.responsibilities}</p>
                    <p>{project.project_id}</p>
                    <p>{project.company_url}</p>
                </div>
            ))}

        </div>
    );
}