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
    <nav className="sticky top-0 z-[100] flex justify-between items-center p-6 text-white w-full bg-black/80 backdrop-blur-md">
      {/* Left side: Logo and Name */}
      <Link href="/" onClick={(e) => handleNav(e, "/")} className="flex items-center gap-4">
        <Image
          src="/icons/LogoSVG.svg"
          alt="Logo"
          width={16}
          height={16}
          className="invert"
        />
        <span className="font-bold text-xl">Nicholas Gamolin</span>
      </Link>

      {/* Right side: Navigation Links */}
      <div className="flex items-center gap-12 text-xl font-bold">
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
