"use client";

import { motion } from "motion/react";

// A template (unlike a layout) re-mounts on every navigation, so this enter
// animation replays each time you switch between experiment pages. The sidebar
// lives in the layout and stays put; only the page content fades/slides in.
export default function PlaygroundTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full flex flex-col items-center"
    >
      {children}
    </motion.div>
  );
}
