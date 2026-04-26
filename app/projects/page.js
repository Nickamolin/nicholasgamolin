export const dynamic = 'force-dynamic';

import Projects from "@/components/projects/Projects";
import ContactCard from "@/components/sections/ContactCard";

export default function ProjectsPage() {
    return (
        <div className="min-h-[90vh] w-full px-(--spacing-page-x) pt-(--spacing-page-top) pb-(--spacing-page-bottom) gap-(--spacing-section) flex flex-col items-center justify-start">

            <div className="flex flex-col items-center w-full gap-(--spacing-header-gap) mb-(--spacing-header-mb) md:mt-(--spacing-page-top)">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold">Projects</h1>
                <span className="text-xs md:text-sm font-subtitle font-medium tracking-[0.2em] uppercase text-gray-400">A look at some of my work</span>
                <Projects />
            </div>

            <ContactCard />

        </div>
    );
}
