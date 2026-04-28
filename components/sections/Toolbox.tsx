"use client";

import React from "react";
import TechIcon from "./TechIcon";

export default function Toolbox() {

  const tech = [
    {
      src: "/icons/TechSection/Nextjs.svg",
      alt: "Next.js"
    },
    {
      src: "/icons/TechSection/React.svg",
      alt: "React"
    },
    {
      src: "/icons/TechSection/TailwindCSS.svg",
      alt: "Tailwind CSS"
    },
    {
      src: "/icons/TechSection/Motion.svg",
      alt: "Motion"
    },
    // {
    //   src: "/icons/TechSection/Typescript.svg",
    //   alt: "Typescript"
    // },
    {
      src: "/icons/TechSection/Supabase.svg",
      alt: "Supabase"
    },
    {
      src: "/icons/TechSection/GitHub.svg",
      alt: "GitHub"
    }
  ]

  const tools = [
    {
      src: "/icons/TechSection/Antigravity.svg",
      alt: "Antigravity"
    },
    {
      src: "/icons/TechSection/Blender.svg",
      alt: "Blender"
    },
    {
      src: "/icons/TechSection/Unity.svg",
      alt: "Unity"
    },
    {
      src: "/icons/TechSection/Davinci-Resolve.svg",
      alt: "Davinci Resolve"
    },
    {
      src: "/icons/TechSection/Procreate.svg",
      alt: "Procreate"
    },
    {
      src: "/icons/TechSection/Figma.svg",
      alt: "Figma"
    }
  ]

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex flex-col items-center gap-(--spacing-header-gap) mb-(--spacing-header-mb)">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold text-center">My Toolbox</h1>
      </div>

      <div className="w-full flex flex-col items-center gap-16 md:gap-24">
        {/* Build Stack */}
        <div className="flex flex-col items-center w-full">
          <span className="text-xs md:text-sm font-subtitle font-medium text-center text-gray-400 tracking-[0.2em] uppercase">
            Some of the technology I use to build
          </span>
          <div className="grid grid-cols-3 md:flex md:flex-row md:flex-wrap items-center justify-center gap-x-4 gap-y-12 md:gap-16 mt-12 max-w-[300px] sm:max-w-[500px] lg:max-w-none">
            {tech.map((t) => (
              <div key={t.alt}>
                <TechIcon
                  src={t.src}
                  alt={t.alt}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Design Stack */}
        <div className="flex flex-col items-center w-full">
          <span className="text-xs md:text-sm font-subtitle font-medium text-center text-gray-400 tracking-[0.2em] uppercase">
            Some of the software I use to create
          </span>
          <div className="grid grid-cols-3 md:flex md:flex-row md:flex-wrap items-center justify-center gap-x-4 gap-y-12 md:gap-16 mt-12 max-w-[300px] sm:max-w-[500px] lg:max-w-none">
            {tools.map((t) => (
              <div key={t.alt}>
                <TechIcon
                  src={t.src}
                  alt={t.alt}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
