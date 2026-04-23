import Projects from "@/components/projects/Projects";
import ContactCard from "@/components/sections/ContactCard";

export default function ProjectsPage() {
    return (
        <div className="min-h-[90vh] w-full px-(--spacing-page-x) pt-(--spacing-page-top) pb-(--spacing-page-bottom) gap-(--spacing-section) flex flex-col items-center justify-start">

            <div className="flex flex-col items-center w-full gap-(--spacing-header-gap) mb-(--spacing-header-mb) md:mt-(--spacing-page-top)">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold">Projects</h1>
                <Projects />
            </div>

            <ContactCard />

        </div>
    );
}
