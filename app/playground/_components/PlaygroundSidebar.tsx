"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EXPERIMENT_THEMES } from "./registry";

export function PlaygroundSidebar() {
  const pathname = usePathname();

  return (
    <nav
      className="flex-shrink-0 w-36 rounded-xl px-2 py-2 flex flex-col gap-0.5"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        position: "fixed",
        top: "50vh",
        left: "var(--spacing-page-x, 1.5rem)",
        transform: "translateY(-50%)",
      }}
    >
      {EXPERIMENT_THEMES.map((theme) => {
        const href = `/playground/${theme.slug}`;
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={theme.slug}
            href={href}
            className="group relative flex flex-col gap-0.5 rounded-lg px-2 py-2 transition-all duration-150"
            style={{
              background: isActive ? "rgba(255,255,255,0.07)" : "transparent",
              border: isActive ? "1px solid rgba(255,255,255,0.10)" : "1px solid transparent",
            }}
          >
            {/* Active accent bar */}
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
    </nav>
  );
}
