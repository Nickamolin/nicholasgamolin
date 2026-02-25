import React from 'react';
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProjectList() {
    const supabase = createSupabaseServerClient();

    const { data: projects, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("id", { ascending: true });

    if (error) {
        return <pre>Failed to load projects: {error.message}</pre>
    }

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-4xl">
            <h1 className="p-6 text-3xl font-bold">Projects:</h1>
            <ul>
                {projects?.map((project: any) => (
                    <li key={project.id}>
                        {project.id}: <code>{project.name}</code>
                    </li>
                ))}
            </ul>
        </div>
    );
}