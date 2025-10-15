import ThreeScene from "@/components/ThreeScene";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-8 gap-8 font-[family-name:var(--font-geist-sans)]">
      <ThreeScene></ThreeScene>
      
      {/* <Image
          className="dark:invert"
          src="/LogoSVG.svg"
          alt="N logo"
          width={150}
          height={150}
          priority
        /> */}

        <div className="flex items-center gap-1">
          <span className="text-4xl font-bold">Nicholas Gamolin</span>
          <a
            href="https://www.linkedin.com/in/nicholas-gamolin/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center"
            aria-label="LinkedIn Profile"
          >
          </a>
          <a href="https://www.linkedin.com/in/nicholas-gamolin/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile">
            <img src="https://www.svgrepo.com/show/157006/linkedin.svg" width="34" height="34" alt="LinkedIn" />
          </a>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://github.com/Nickamolin"
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            /> */}
            see my code
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-900 dark:hover:bg-gray-800 hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="https://www.youtube.com/@Drakonic/videos"
            target="_blank"
            rel="noopener noreferrer"
          >
            see my videos
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="https://negativedomain.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            see my art
          </a>
        </div>
    </div>
  );
}
