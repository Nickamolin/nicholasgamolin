// Central registry of experiment themes.
// Add a new entry here + create a matching folder under app/playground/<slug>/
// to register a new theme. The sidebar picks it up automatically.

export interface ExperimentTheme {
  slug: string;        // URL segment, e.g. "refraction"
  label: string;       // Display name shown in the sidebar
  description: string; // Short subtitle
}

export const EXPERIMENT_THEMES: ExperimentTheme[] = [
  {
    slug: "liquid-glass",
    label: "Liquid Glass",
    description: "SVG displacement map glass refraction on live HTML",
  },
  {
    slug: "refraction",
    label: "Refraction Techniques",
    description: "Screen-space, virtual-plane, and html-to-image refraction",
  },
  {
    slug: "animation",
    label: "Real-Time vs Pre-Rendered",
    description: "GLB animation vs pre-rendered video",
  },
];
