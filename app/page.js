import Logo3D from "@/components/Logo3D";
import Highlights from "@/components/projects/Highlights";
import Image from "next/image";

export default async function Home() {

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-8 gap-4 sm:gap-8 font-[family-name:var(--font-geist-sans)]">

      {/* Hero Section */}
      <div className="relative flex justify-center items-center w-full">
        <Logo3D></Logo3D>

        <div className="absolute inset-0 flex flex-col justify-center items-center gap-2">
          <span className="text-4xl sm:text-5xl md:text-7xl font-bold text-center w-auto pointer-events-auto text-shadow-lg">Nicholas Gamolin</span>

          <div className="flex gap-8 items-center flex-row opacity-75">
            <a
              href="https://www.linkedin.com/in/nicholas-gamolin/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/linkedinBlack.svg"
                width={50}
                height={50}
                alt="LinkedIn"
                className="dark:invert hover:opacity-75 transition-all duration-500 w-[24px] h-[24px] md:w-[36px] md:h-[36px]"
              />
            </a>
            <a
              href="https://github.com/Nickamolin"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/github.svg"
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
                src="/YouTubeIconBW.svg"
                width={50}
                height={50}
                alt="YouTube"
                className="dark:invert hover:opacity-75 transition-all duration-500 w-[24px] h-[24px] md:w-[36px] md:h-[36px]"
              />
            </a>
          </div>
        </div>
      </div>



      <Highlights />

    </div>
  );
}
