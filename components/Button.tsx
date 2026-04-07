"use client";

import React from "react";
import Link from "next/link";
import { motion, type MotionProps } from "motion/react";
import { useLoading } from "@/components/LoadingProvider";

interface ButtonProps {
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  useTransition?: boolean;
}

/**
 * A premium, reusable Button component that supports both Next.js Link
 * and standard button functionality with motion-driven animations.
 */
export default function Button({
  href,
  onClick,
  children,
  variant = "primary",
  className = "",
  useTransition = false,
}: ButtonProps) {
  const { navigateWithTransition } = useLoading();
  const baseStyles =
    "inline-flex items-center justify-center transition-all duration-300 font-subtitle tracking-[0.2em] uppercase text-xs md:text-sm whitespace-nowrap";

  const variants = {
    primary:
      "bg-white text-black px-8 py-3 rounded-full hover:bg-gray-100 shadow-lg hover:shadow-white/10",
    secondary:
      "bg-transparent text-white px-8 py-3 rounded-full border border-white/20 backdrop-blur-md hover:bg-white/10",
    ghost:
      "text-white hover:underline underline-offset-8",
  };

  const combinedClasses = `${baseStyles} ${variants[variant]} ${className}`;

  // Framer Motion shared animation props
  const motionProps = {
    whileHover: { scale: 1.05, y: -2 },
    whileTap: { scale: 0.98, y: 0 },
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { type: "tween" as const, duration: 0.5, ease: "easeInOut" as const },
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (useTransition && href) {
      e.preventDefault();
      if (onClick) onClick(e);
      navigateWithTransition(href);
    } else if (onClick) {
      onClick(e);
    }
  };

  if (href) {
    return (
      <motion.div {...motionProps} className="inline-block">
        <Link href={href} className={combinedClasses} onClick={handleLinkClick}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      {...motionProps}
      onClick={onClick}
      className={combinedClasses}
    >
      {children}
    </motion.button>
  );
}
