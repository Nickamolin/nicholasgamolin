"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useLoading } from "@/components/loading/LoadingProvider";

export default function Navbar() {
  const { navigateWithTransition } = useLoading();
  const pathname = usePathname();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [isFullyGrown, setIsFullyGrown] = useState(false);

  // Reset pending path when pathname actually changes
  React.useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  const handleNav = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setPendingPath(href);
    navigateWithTransition(href);
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Projects", href: "/projects" },
    { name: "About", href: "/about" },
  ];

  return (
    <div className="fixed bottom-8 left-0 z-[100] w-full flex justify-center pointer-events-none md:sticky md:top-6 md:bottom-auto">
      <nav className="flex flex-row items-center justify-center p-4 px-8 text-white bg-black/80 backdrop-blur-md border border-white/10 rounded-full pointer-events-auto">
        <div className="flex flex-row gap-8 text-xs md:text-sm font-subtitle font-medium tracking-[0.2em] uppercase">
          {navLinks.map((link) => {
            // Dim the old page immediately when a new navigation starts
            const isActive = pendingPath
              ? pendingPath === link.href
              : pathname === link.href;

            const isHovered = hoveredPath === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNav(e, link.href)}
                onMouseEnter={() => {
                  setHoveredPath(link.href);
                  setIsFullyGrown(false);
                }}
                onMouseLeave={() => setHoveredPath(null)}
                className="relative py-1 group"
              >
                <span className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>
                  {link.name}
                </span>

                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ width: "0%", left: "0%", right: "auto", opacity: 0 }}
                      animate={{ width: "100%", left: "0%", right: "auto", opacity: 1 }}
                      exit={{ 
                        width: "0%", 
                        left: isFullyGrown ? "auto" : "0%", 
                        right: isFullyGrown ? "0%" : "auto",
                        opacity: 0,
                        transition: {
                          width: { duration: 0.3, ease: "easeInOut" },
                          opacity: { duration: 0, delay: 0.3 }
                        }
                      }}
                      onAnimationComplete={() => setIsFullyGrown(true)}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                        opacity: { duration: 0 }
                      }}
                      className="absolute -bottom-0 h-[1.5px] bg-white rounded-full"
                    />
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
