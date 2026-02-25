import React from 'react';
import Image from 'next/image';
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProjectList() {
    const supabase = createSupabaseServerClient();

    const { data: projects, error } = await supabase
        .from("projects")
        .select("id, name, thumbnail_url")
        .order("id", { ascending: true });

    if (error) {
        return <pre>Failed to load projects: {error.message}</pre>
    }

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <h1 className="p-6 text-3xl font-bold">Projects:</h1>
            <ul className="flex flex-row items-end justify-center gap-4">
                {projects?.map((project: any) => (
                    <li key={project.id} className="flex flex-col items-center justify-end px-4">
                        <Image src={project.thumbnail_url} alt={project.name} width={200} height={200} />
                        {/* <p className="text-xl font-bold">{project.id}. <code>{project.name}</code></p> */}
                        <p className="text-xl font-bold">{project.name}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}