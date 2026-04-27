export const dynamic = 'force-dynamic';

import Highlights from "@/components/projects/Highlights";
import Button from "@/components/UI/Button";
import ContactCard from "@/components/sections/ContactCard";
import Toolbox from "@/components/sections/Toolbox";
import Hero from "@/components/sections/Hero";

export default async function Home() {

  return (
    <div className="flex flex-col items-center justify-start min-h-screen px-(--spacing-page-x) pt-(--spacing-page-top) pb-(--spacing-page-bottom) gap-(--spacing-section)">

      {/* Hero Section */}
      <Hero />

      {/* Project Highlights Section */}

      <div className="flex flex-col items-center w-full">
        <div className="flex flex-col items-center gap-(--spacing-header-gap) mb-(--spacing-header-mb)">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold">Featured Projects</h1>
          <span className="text-xs md:text-sm font-subtitle font-medium text-center text-gray-400 tracking-[0.2em] uppercase">A curated selection of some of my work</span>
        </div>
        <Highlights />
        <Button href="/projects" variant="secondary" className="mt-(--spacing-header-mb)" useTransition>
          View All Projects
        </Button>
      </div>

      {/* Tech Section */}

      <div className="flex flex-col items-center justify-center w-full">
        <Toolbox />

        <Button href="/about" variant="secondary" className="mt-20 md:mt-32" useTransition>
          About Me
        </Button>
      </div>

      {/* Contact Section */}

      <ContactCard />

    </div>
  );
}
