"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { EXPERIMENT_THEMES } from "./registry";

const panelStyle: React.CSSProperties = {
  background: "rgba(20,20,20,0.6)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.08)",
  position: "fixed",
  top: "50vh",
  left: "calc(var(--spacing-page-x, 1.5rem) / 2)",
  transform: "translateY(-50%)",
  zIndex: 50,
};

function NavLinks({ onSelect }: { onSelect?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {EXPERIMENT_THEMES.map((theme) => {
        const href = `/playground/${theme.slug}`;
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={theme.slug}
            href={href}
            onClick={onSelect}
            className="group relative flex flex-col gap-0.5 rounded-lg px-2 py-2 transition-all duration-150"
            style={{
              background: isActive ? "rgba(255,255,255,0.07)" : "transparent",
              border: isActive ? "1px solid rgba(255,255,255,0.10)" : "1px solid transparent",
            }}
          >
            {isActive && (
              <div
                className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full"
                style={{ background: "rgba(255,255,255,0.55)" }}
              />
            )}
            <span
              className="text-[10px] font-subtitle font-medium tracking-[0.12em] uppercase pl-2 transition-colors duration-150"
              style={{ color: isActive ? "rgba(255,255,255,0.85)" : undefined }}
            >
              <span className={isActive ? "" : "text-gray-500 group-hover:text-gray-300 transition-colors duration-150"}>
                {theme.label}
              </span>
            </span>
          </Link>
        );
      })}
    </>
  );
}

export function PlaygroundSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isOpen]);

  return (
    <>
      {/* Mobile: hamburger → expanded menu */}
      <div ref={ref} className="md:hidden" style={panelStyle}>
        {isOpen ? (
          <nav className="w-36 px-2 py-2 flex flex-col gap-0.5 rounded-xl">
            <NavLinks onSelect={() => setIsOpen(false)} />
          </nav>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Open navigation"
          >
            <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" aria-hidden="true">
              <path d="M13.6006 11.0098C13.8286 11.0563 14 11.2583 14 11.5C14 11.7417 13.8286 11.9437 13.6006 11.9902L13.5 12H1.5C1.22386 12 1 11.7761 1 11.5C1 11.2239 1.22386 11 1.5 11H13.5L13.6006 11.0098ZM13.6006 7.00977C13.8286 7.05629 14 7.25829 14 7.5C14 7.74171 13.8286 7.94371 13.6006 7.99023L13.5 8H1.5C1.22386 8 1 7.77614 1 7.5C1 7.22386 1.22386 7 1.5 7H13.5L13.6006 7.00977ZM13.6006 3.00977C13.8286 3.05629 14 3.25829 14 3.5C14 3.74171 13.8286 3.94371 13.6006 3.99023L13.5 4H1.5C1.22386 4 1 3.77614 1 3.5C1 3.22386 1.22386 3 1.5 3H13.5L13.6006 3.00977Z" fill="currentColor"/>
            </svg>
          </button>
        )}
      </div>

      {/* Desktop: always-visible sidebar */}
      <nav
        className="hidden md:flex flex-shrink-0 w-36 rounded-xl px-2 py-2 flex-col gap-0.5"
        style={panelStyle}
      >
        <NavLinks />
      </nav>
    </>
  );
}
