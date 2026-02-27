import React from 'react';
import Image from 'next/image';
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProjectList() {
    const supabase = createSupabaseServerClient();

    const { data: projects, error } = await supabase
        .from("projects")
        .select("id, name, thumbnail_url, date_published, info_url, visible")
        .eq("visible", true)
        .order("date_published", { ascending: false });

    if (error) {
        return <pre>Failed to load projects: {error.message}</pre>
    }

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <h1 className="p-6 text-3xl font-bold">Projects:</h1>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center justify-center">
                {projects?.map((project: any) => (
                    <li key={project.id}>
                        <a className="flex flex-col items-center justify-center" href={project.info_url} target="_blank" rel="noopener noreferrer">
                            <Image src={project.thumbnail_url} alt={project.name} width={200} height={200} />
                            {/* <p className="text-xl font-bold">{project.name}</p>
                            <code>({project.date_published})</code> */}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}