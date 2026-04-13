"use client";

import React from "react";
import Link from "next/link";
import { useLoading } from "@/components/LoadingProvider";

export default function Navbar() {
  const { navigateWithTransition } = useLoading();

  const handleNav = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    navigateWithTransition(href);
  };

  return (
    <div className="sticky top-6 z-[100] w-full flex justify-center pointer-events-none">
      <nav className="flex flex-row items-center justify-center p-4 px-8 text-white bg-black/80 backdrop-blur-md border border-white/10 rounded-full pointer-events-auto">

        <div className="flex flex-row gap-8 text-xs md:text-sm font-subtitle font-medium tracking-[0.2em] uppercase">
          <Link href="/" onClick={(e) => handleNav(e, "/")} className="hover:underline underline-offset-4">
            Home
          </Link>

          <Link href="/projects" onClick={(e) => handleNav(e, "/projects")} className="hover:underline underline-offset-4">
            Projects
          </Link>

          <Link href="/about" onClick={(e) => handleNav(e, "/about")} className="hover:underline underline-offset-4">
            About
          </Link>
        </div>

      </nav>
    </div>
  );
}
