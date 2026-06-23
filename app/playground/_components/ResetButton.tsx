"use client";

import React from "react";

interface ResetButtonProps {
  onClick: () => void;
  spinning: boolean;
  label?: string;
}

export function ResetButton({ onClick, spinning, label = "Reset" }: ResetButtonProps) {
  return (
    <button
      onClick={onClick}
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
          src="/icons/buttons/refresh.svg"
          alt="Reset"
          className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-all invert"
          style={{
            transform: spinning ? "rotate(-360deg)" : "rotate(0deg)",
            transition: spinning
              ? "transform 0.65s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease, filter 0.2s ease"
              : "transform 0.2s ease, opacity 0.2s ease, filter 0.2s ease",
          }}
        />
      </div>
      <span className="text-[9px] font-subtitle font-medium tracking-[0.14em] uppercase text-gray-600 group-hover:text-gray-400 transition-colors">
        {label}
      </span>
    </button>
  );
}
