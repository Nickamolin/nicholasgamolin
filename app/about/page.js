import Image from "next/image";
import ContactCard from "@/components/sections/ContactCard";
import WorkExperience from "@/components/sections/WorkExperience";

export default function AboutPage() {
    return (
        <div className="min-h-screen w-full p-8 flex flex-col items-center justify-start gap-8">

            <div className="flex flex-col items-center justify-center gap-4">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold mt-8">Background</h1>
                <span className="text-xs md:text-sm font-subtitle font-medium tracking-[0.2em] uppercase text-gray-400">A little bit about me</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 max-w-5xl w-full">
                <div className="relative w-full min-h-[300px] md:min-h-0">
                    <Image
                        src="/photos/TimesSquare.jpeg"
                        fill
                        alt="Headshot"
                        className="rounded-xl object-cover"
                    />
                </div>
                <div className="text-lg md:text-xl font-body font-medium text-gray-400 flex flex-col justify-between gap-8">
                    <p>I’m a self-taught digital artist and full-stack engineer with a B.S. in Computer Science from the University of Virginia. My work sits at the intersection of design and engineering, spanning graphic design, animation, video editing, and interactive experiences.</p>
                    <p>I’m heavily inspired by film, music, and games, and I approach my work with the same mindset - focusing on aesthetic, detail, and how something feels as much as how it functions.</p>
                    <p>I’m currently looking for opportunities to build interactive products and experiences that blend strong visual design with thoughtful engineering.</p>
                </div>
            </div>

            <div className="flex flex-col items-center gap-4 w-full">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold mt-8">Professional Experience</h1>
                <span className="text-xs md:text-sm font-subtitle font-medium tracking-[0.2em] uppercase text-gray-400 mb-8">A little bit about my work</span>
                <WorkExperience />
            </div>

            <ContactCard />

        </div>
    );
}
