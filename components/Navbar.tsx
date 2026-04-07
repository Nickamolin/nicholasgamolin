"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLoading } from "@/components/LoadingProvider";

export default function Navbar() {
  const { navigateWithTransition } = useLoading();

  const handleNav = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    navigateWithTransition(href);
  };

  return (
    <nav className="sticky top-0 z-[100] flex flex-row items-center justify-center p-6 text-white bg-black/80 backdrop-blur-md border-b border-white/10">

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

        <div className="hover:underline underline-offset-4 opacity-50">
          Resume
        </div>

        <div className="hover:underline underline-offset-4 opacity-50">
          Contact
        </div>
      </div>

    </nav>
  );
}
