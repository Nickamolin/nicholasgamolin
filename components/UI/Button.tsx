"use client";

import React from "react";
import Link from "next/link";
import { motion, type MotionProps } from "motion/react";
import { useLoading } from "@/components/loading/LoadingProvider";

interface ButtonProps {
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  useTransition?: boolean;
  target?: string;
  download?: boolean | string;
  isExternalHover?: boolean;
}

/**
 * A premium, reusable Button component that supports both Next.js Link
 * and standard button functionality with motion-driven animations.
 */
const MotionLink = motion.create(Link);

export default function Button({
  href,
  onClick,
  children,
  variant = "primary",
  className = "",
  useTransition = false,
  target,
  download,
  isExternalHover,
}: ButtonProps) {
  const { navigateWithTransition } = useLoading();
  const [isHovered, setIsHovered] = React.useState(false);
  const baseStyles =
    "inline-flex items-center justify-center font-subtitle tracking-[0.2em] uppercase text-xs md:text-sm whitespace-nowrap overflow-hidden transition-colors duration-300 cursor-pointer";

  const variants = {
    primary:
      "bg-white text-black px-8 py-3 rounded-full border border-black/20",
    secondary:
      "bg-transparent text-white px-8 py-3 rounded-full border border-white/20 backdrop-blur-md",
    ghost:
      "text-white py-2",
  };

  const combinedClasses = `${baseStyles} ${variants[variant]} ${className}`;

  const tapVariants = {
    primary: { scale: 0.96, backgroundColor: "#f3f4f6" },
    secondary: { scale: 0.96, backgroundColor: "rgba(255, 255, 255, 0.15)" },
    ghost: { scale: 0.96, opacity: 0.8 },
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
  
  const activeHover = isExternalHover !== undefined ? isExternalHover : isHovered;

  const content = (
    <div className="relative overflow-hidden h-[1.2em]">
      <motion.div
        variants={{
          initial: { y: 0 },
          hover: { y: "-100%" },
        }}
        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        className="h-full"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-full">
            {children}
          </div>
          <div className="flex items-center justify-center h-full absolute top-full left-0 w-full">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (href) {
    return (
      <motion.div
        initial="initial"
        animate={activeHover ? "hover" : "initial"}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="inline-block"
      >
        <MotionLink
          href={href}
          className={combinedClasses}
          onClick={handleLinkClick}
          target={target}
          download={download}
          whileTap={tapVariants[variant]}
        >
          {content}
        </MotionLink>
      </motion.div>
    );
  }

  return (
    <motion.button
      initial="initial"
      animate={activeHover ? "hover" : "initial"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileTap={tapVariants[variant]}
      onClick={onClick}
      className={combinedClasses}
    >
      {content}
    </motion.button>
  );
}
