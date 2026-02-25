import Logo3D from "@/components/Logo3D";
import ProjectList from "@/components/ProjectList";
import Image from "next/image";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {

  return (
    <div className="flex flex-col items-center justify-center h-screen p-8 gap-4 sm:gap-8 font-[family-name:var(--font-geist-sans)]">
      <Logo3D></Logo3D>

      <div className="w-full flex flex-row justify-center items-center gap-2">
        <span className="text-3xl sm:text-4xl font-bold text-center w-auto">Nicholas Gamolin</span>
      </div>

      <div className="flex gap-4 items-center flex-col sm:flex-row">
        <a
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto gap-2"
          href="https://www.linkedin.com/in/nicholas-gamolin/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
          <img
            src="/linkedinBlack.svg"
            width="23"
            height="23"
            alt="LinkedIn"
            className="invert dark:invert-0 w-[23px] h-[23px] sm:w-[28px] sm:h-[28px]"
          />
        </a>
        <a
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center text-background bg-gray-700 hover:bg-gray-600 dark:bg-gray-400 dark:hover:bg-gray-500 hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto gap-2"
          href="https://github.com/Nickamolin"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
          <img
            src="/github.svg"
            width="23"
            height="23"
            alt="GitHub"
            className="invert dark:invert-0 w-[23px] h-[23px] sm:w-[28px] sm:h-[28px]"
          />
        </a>
        <a
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800 hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto gap-2"
          href="https://www.youtube.com/@Drakonic/videos"
          target="_blank"
          rel="noopener noreferrer"
        >
          YouTube
          <img
            src="/youtube.svg"
            width="23"
            height="23"
            alt="YouTube"
            className="dark:invert w-[23px] h-[23px] sm:w-[28px] sm:h-[28px]"
          />
        </a>
        <a
          className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto gap-2"
          href="https://negativedomain.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Digital Art
          <img
            src="/art.svg"
            width="23"
            height="23"
            alt="YouTube"
            className="dark:invert w-[23px] h-[23px] sm:w-[28px] sm:h-[28px]"
          />
        </a>
      </div>

      <ProjectList />

    </div>
  );
}
