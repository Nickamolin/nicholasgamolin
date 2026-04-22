import Projects from "@/components/projects/Projects";
import ContactCard from "@/components/sections/ContactCard";

export default function ProjectsPage() {
    return (
        <div className="min-h-[90vh] w-full p-8 gap-8 flex flex-col items-center justify-start">

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold mt-8">Projects</h1>

            <Projects />

            <ContactCard />

        </div>
    );
}
