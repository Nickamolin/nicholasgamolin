import Image from "next/image";
import ContactCard from "@/components/sections/ContactCard";
import WorkExperience from "@/components/sections/WorkExperience";
import Button from "@/components/UI/Button";
import Toolbox from "@/components/sections/Toolbox";
import InvertImage from "@/components/sections/InvertImage";

export default function AboutPage() {
    return (
        <div className="min-h-screen w-full px-(--spacing-page-x) pt-(--spacing-page-top) pb-(--spacing-page-bottom) flex flex-col items-center justify-start gap-(--spacing-section)">

            {/* Background Section */}
            <div className="flex flex-col items-center w-full max-w-5xl">
                <div className="flex flex-col items-center gap-(--spacing-header-gap) mb-(--spacing-header-mb) md:mt-(--spacing-page-top)">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold">Background</h1>
                    <span className="text-xs md:text-sm font-subtitle font-medium tracking-[0.2em] uppercase text-gray-400">A little bit about me</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    <div className="relative w-full min-h-[300px] md:min-h-0">
                        <InvertImage src="/photos/TimesSquare.jpeg" alt="Headshot" />
                    </div>
                    <div className="text-lg md:text-xl text-justify font-body font-medium text-gray-400 flex flex-col justify-between gap-8">
                        <p>I&apos;m a self-taught digital artist and full-stack engineer with a B.S. in Computer Science from the University of Virginia. My work sits at the intersection of design and engineering, spanning graphic design, animation, video editing, and interactive experiences.</p>
                        <p>I&apos;m heavily inspired by film, music, and games, and I approach my work with the same mindset - focusing on aesthetic, detail, and how something feels as much as how it functions.</p>
                        <p>I&apos;m currently looking for opportunities to build interactive products and experiences that blend strong visual design with thoughtful engineering.</p>
                    </div>
                </div>
            </div>

            {/* Professional Experience Section */}
            <div className="flex flex-col items-center w-full">
                <div className="flex flex-col items-center text-center gap-(--spacing-header-gap) mb-(--spacing-header-mb)">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold">Professional Experience</h1>
                    <span className="text-xs md:text-sm font-subtitle font-medium tracking-[0.2em] uppercase text-gray-400">A little bit about my work</span>
                </div>
                <WorkExperience />
                <Button
                    href="https://ahkkpmqdyghygygqonbi.supabase.co/storage/v1/object/public/documents/resume.pdf?download="
                    variant="secondary"
                    className="mt-(--spacing-header-mb)"
                    target="_blank"
                    download
                >
                    Download Resume
                </Button>
            </div>

            {/* Tech Section */}
            <div className="flex flex-col items-center justify-center w-full">
                <Toolbox />
            </div>

            {/* Contact Section */}
            <ContactCard />

        </div>
    );
}
