"use client";

import React from "react";

interface PlayPauseButtonProps {
  isPaused: boolean;
  onToggle: () => void;
}

export function PlayPauseButton({ isPaused, onToggle }: PlayPauseButtonProps) {
  const label = isPaused ? "Play" : "Pause";
  return (
    <button
      onClick={onToggle}
      title={label}
      className="group flex flex-col items-center gap-2 cursor-pointer"
      style={{ background: "none", border: "none", padding: 0 }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <img
          src={isPaused ? "/icons/buttons/play.svg" : "/icons/buttons/pause.svg"}
          alt={label}
          className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-all invert"
        />
      </div>
      <span className="text-[9px] font-subtitle font-medium tracking-[0.14em] uppercase text-gray-600 group-hover:text-gray-400 transition-colors">
        {label}
      </span>
    </button>
  );
}
