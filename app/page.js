import Logo3D from "@/components/Logo3D";
import ProjectList from "@/components/projects/ProjectList";
import Image from "next/image";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-4 sm:gap-8 font-[family-name:var(--font-geist-sans)]">
      <div className="relative flex justify-center items-center w-full">
        <Logo3D></Logo3D>

        <div className="absolute inset-0 flex flex-col justify-center items-center gap-2">
          <span className="text-4xl sm:text-5xl font-bold text-center w-auto pointer-events-auto text-shadow-lg">Nicholas Gamolin</span>

          <div className="flex gap-8 items-center flex-row opacity-75">
            <a
              href="https://www.linkedin.com/in/nicholas-gamolin/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/linkedinBlack.svg"
                width="50"
                height="50"
                alt="LinkedIn"
                className="dark:invert hover:opacity-75 transition-all duration-500 w-[24px] h-[24px] sm:w-[24px] sm:h-[24px]"
              />
            </a>
            <a
              href="https://github.com/Nickamolin"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/github.svg"
                width="50"
                height="50"
                alt="GitHub"
                className="dark:invert hover:opacity-75 transition-all duration-500 w-[24px] h-[24px] sm:w-[24px] sm:h-[24px]"
              />
            </a>
            <a
              href="https://www.youtube.com/@Drakonic/videos"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/YouTubeIconBW.svg"
                width="50"
                height="50"
                alt="YouTube"
                className="dark:invert hover:opacity-75 transition-all duration-500 w-[24px] h-[24px] sm:w-[24px] sm:h-[24px]"
              />
            </a>
          </div>
        </div>
      </div>



      <ProjectList />

    </div>
  );
}
