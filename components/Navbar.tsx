import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-start p-6 text-white w-full">
      {/* Left side: Logo and Name */}
      <Link href="/" className="flex items-center gap-4">
        <Image
          src="/LogoSVG.svg"
          alt="Logo"
          width={16}
          height={16}
          className="invert"
        />
        <span className="font-bold text-lg">Nicholas Gamolin</span>
      </Link>

      {/* Right side: Navigation Links */}
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link href="/projects" className="hover:underline underline-offset-4">
          Projects
        </Link>
        <Link href="/about" className="hover:underline underline-offset-4">
          About
        </Link>
        {/* <Link href="/resume" className="hover:underline underline-offset-4">
          Resume
        </Link>
        <Link href="/contact" className="hover:underline underline-offset-4">
          Contact
        </Link> */}
      </div>
    </nav>
  );
}
