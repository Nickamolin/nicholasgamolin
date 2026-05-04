export const dynamic = 'force-dynamic';

import Projects from "@/components/projects/Projects";
import ContactCard from "@/components/sections/ContactCard";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const supabase = createSupabaseServerClient();

    const { data: project } = await supabase
        .from("projects")
        .select("title, subtitle, summary, thumbnail_url")
        .eq("slug", slug)
        .single();

    if (!project) {
        return {
            title: "Nicholas Gamolin | Projects",
            description: "Work spanning art, animation, and software.",
        };
    }

    return {
        title: `${project.title}`,
        description: project.subtitle || project.summary || "Work spanning art, animation, and software.",
        openGraph: {
            title: `${project.title}`,
            description: project.subtitle || project.summary || "Work spanning art, animation, and software.",
            images: project.thumbnail_url ? [{ url: project.thumbnail_url }] : [],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${project.title}`,
            description: project.subtitle || project.summary || "Work spanning art, animation, and software.",
            images: project.thumbnail_url ? [project.thumbnail_url] : [],
        },
    };
}

export default async function ProjectSlugPage({ params }) {
    const { slug } = await params;

    return (
        <div className="min-h-[90vh] w-full px-(--spacing-page-x) pt-(--spacing-page-top) pb-(--spacing-page-bottom) gap-(--spacing-section) flex flex-col items-center justify-start">

            <div className="flex flex-col items-center w-full gap-(--spacing-header-gap) mb-(--spacing-header-mb) md:mt-(--spacing-page-top)">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold">Projects</h1>
                <span className="text-xs md:text-sm font-subtitle font-medium tracking-[0.2em] uppercase text-gray-400">A look at some of my work</span>
                <Projects initialSlug={slug} />
            </div>

            <ContactCard />

        </div>
    );
}
