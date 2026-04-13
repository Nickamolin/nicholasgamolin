import Logo3D from "@/components/3D/Logo3D";
import Head3D from "@/components/3D/Head3D";
import Highlights from "@/components/projects/Highlights";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/UI/Button";
import ContactCard from "@/components/UI/ContactCard";

export default async function Home() {

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-8 gap-8">

      {/* Hero Section */}

      <div className="flex flex-col md:flex-row items-center justify-center min-h-[80vh] max-h-[90vh] w-full gap-8 md:gap-0">
        <div className="w-full max-w-[400px] md:max-w-[500px] aspect-square flex items-center justify-center">
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

      <div className="flex flex-col items-center gap-4 w-full">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold">Featured Projects</h1>
        <span className="text-xs md:text-sm font-subtitle font-medium text-gray-400 tracking-[0.2em] uppercase mb-8">A curated selection of some of my work</span>
        <Highlights />
        <Button href="/projects" variant="secondary" className="mt-8" useTransition>
          View All Projects
        </Button>
      </div>

      {/* Contact Section */}

      <div className="flex flex-col items-center justify-center w-full gap-4 p-8">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold">Contact Me</h1>
        <span className="text-xs md:text-sm font-subtitle font-medium text-gray-400 tracking-[0.2em] uppercase mb-4">Have an idea or just want to say hi?</span>
        <ContactCard />
      </div>

    </div>
  );
}
