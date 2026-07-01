"use client";

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SliderDef {
  label: string;
  key: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  format?: (v: number) => string;
}

export interface SelectDef {
  label: string;
  key: string;
  options: { value: string | number; label: string }[];
  defaultValue: string | number;
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function fmt2(v: number) { return v.toFixed(2); }
export function fmt1(v: number) { return v.toFixed(1); }

// ─── Defaults helpers ─────────────────────────────────────────────────────────

export function makeDefaults(sliders: SliderDef[]): Record<string, number> {
  return Object.fromEntries(sliders.map((s) => [s.key, s.defaultValue]));
}

export function makeSelectDefaults(selects: SelectDef[]): Record<string, any> {
  return Object.fromEntries(selects.map((s) => [s.key, s.defaultValue]));
}

// ─── DebugPanel ───────────────────────────────────────────────────────────────

interface DebugPanelProps {
  sliders?: SliderDef[];
  selects?: SelectDef[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  isResetting?: boolean;
  children?: React.ReactNode;
  columns?: 1 | 2;
}

export function DebugPanel({ sliders, selects, values, onChange, isResetting, children, columns = 1 }: DebugPanelProps) {
  return (
    <div
      className="w-full mt-3 rounded-xl px-4 py-3 flex flex-col gap-2.5"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className={columns === 2 ? "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5" : "flex flex-col gap-2.5"}>
      {sliders && sliders.map((s) => {
        const val = values[s.key] ?? s.defaultValue;
        const pct = ((val - s.min) / (s.max - s.min)) * 100;
        return (
          <div key={s.key} className="flex flex-col gap-1">
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-subtitle font-medium tracking-[0.12em] uppercase text-gray-500">
                {s.label}
              </span>
              <span className="text-[10px] font-mono text-gray-400">
                {(s.format ?? fmt2)(val)}
              </span>
            </div>
            <div className="relative h-[2px] rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${pct}%`,
                  background: "rgba(255,255,255,0.55)",
                  transition: "none",
                }}
              />
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${pct}%`,
                  top: "50%",
                  width: "8px",
                  height: "8px",
                  transform: "translate(-50%, -50%)",
                  background: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }}
              />
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={val}
                onChange={(e) => onChange(s.key, parseFloat(e.target.value))}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                style={{ height: "16px", top: "-7px" }}
              />
            </div>
          </div>
        );
      })}
      </div>
      {selects && selects.map((s) => (
        <div key={s.key} className="flex flex-col gap-1">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-[10px] font-subtitle font-medium tracking-[0.12em] uppercase text-gray-500">
              {s.label}
            </span>
          </div>
          <div className="relative">
            <select
              value={values[s.key] ?? s.defaultValue}
              onChange={(e) => onChange(s.key, e.target.value)}
              className="w-full rounded-md text-[11px] font-mono text-gray-300 px-2 py-1.5 focus:outline-none cursor-pointer appearance-none transition-colors"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                WebkitAppearance: "none",
                MozAppearance: "none",
              }}
            >
              {s.options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-gray-900 text-white font-mono text-[11px]">
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-400">
              <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      ))}
      {children}
    </div>
  );
}
