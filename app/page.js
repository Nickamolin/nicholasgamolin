import Logo3D from "@/components/3D/Logo3D";
import Head3D from "@/components/3D/Head3D";
import Highlights from "@/components/projects/Highlights";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/UI/Button";
import ContactCard from "@/components/sections/ContactCard";
import TechIcon from "@/components/sections/TechIcon";
import { tech, tools } from "@/lib/constants";

export default async function Home() {

  return (
    <div className="flex flex-col items-center justify-start min-h-screen px-(--spacing-page-x) pt-(--spacing-page-top) pb-(--spacing-page-bottom) gap-(--spacing-section)">

      {/* Hero Section */}

      <div className="flex flex-col md:flex-row items-center justify-center min-h-[80vh] max-h-[90vh] w-full gap-8 md:gap-0">
        <div className="w-full max-w-[300px] md:max-w-[500px] aspect-square flex items-center justify-center">
          <Head3D />
        </div>

        <div className="flex flex-col justify-center items-center gap-4 z-10">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-title font-bold text-center">
            Nicholas Gamolin
          </h1>

          <span className="text-xs md:text-sm text-center font-subtitle font-medium tracking-[0.2em] uppercase text-gray-400">Design Engineer / Creative Technologist</span>

          <div className="flex gap-8 items-center flex-row opacity-75">
            <a
              href="https://github.com/Nickamolin"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/icons/github.svg"
                width={50}
                height={50}
                alt="GitHub"
                className="dark:invert hover:opacity-75 transition-all duration-500 w-[24px] h-[24px] md:w-[36px] md:h-[36px]"
              />
            </a>
            <a
              href="https://www.youtube.com/@Drakonic/videos"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/icons/YouTubeIconBW.svg"
                width={50}
                height={50}
                alt="YouTube"
                className="dark:invert hover:opacity-75 transition-all duration-500 w-[24px] h-[24px] md:w-[36px] md:h-[36px]"
              />
            </a>
            <a
              href="https://www.linkedin.com/in/nicholas-gamolin/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/icons/linkedinBlack.svg"
                width={50}
                height={50}
                alt="LinkedIn"
                className="dark:invert hover:opacity-75 transition-all duration-500 w-[24px] h-[24px] md:w-[36px] md:h-[36px]"
              />
            </a>
          </div>
        </div>
      </div>


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
        <div className="flex flex-col items-center gap-(--spacing-header-gap) mb-(--spacing-header-mb)">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold">My Toolbox</h1>
          <span className="text-xs md:text-sm font-subtitle font-medium text-center text-gray-400 tracking-[0.2em] uppercase">Some of the technology I use to build</span>
        </div>

        <div className="flex flex-row flex-wrap items-center justify-center w-full gap-12 md:gap-24 mb-20 md:my-20">
          {tech.map((t) => (
            <TechIcon
              key={t.alt}
              src={t.src}
              alt={t.alt}
            />
          ))}
        </div>

        <div className="flex flex-row flex-wrap items-center justify-center w-full gap-12 md:gap-24 my-20">
          {tools.map((t) => (
            <TechIcon
              key={t.alt}
              src={t.src}
              alt={t.alt}
            />
          ))}
        </div>

        <Button href="/about" variant="secondary" className="mt-(--spacing-header-mb)" useTransition>
          About Me
        </Button>
      </div>

      {/* Contact Section */}

      <ContactCard />

    </div>
  );
}
