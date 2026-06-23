import LiquidGlassExperiments from "./LiquidGlassExperiments";
import { ExperimentHeader } from "../_components/ExperimentHeader";

export const metadata = {
  title: "Liquid Glass — Playground",
  description: "SVG displacement map glass refraction on live HTML.",
};

export default function LiquidGlassPage() {
  return (
    <>
      <ExperimentHeader
        title="Liquid Glass"
        subtitle="SVG displacement map glass refraction on live HTML"
      />
      <p className="text-sm text-gray-500 text-center -mt-4 mb-8">
        Inspired by{" "}
        <a
          href="https://developer.apple.com/documentation/technologyoverviews/liquid-glass"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-gray-400 transition-colors"
        >
          Apple&apos;s Liquid Glass
        </a>
        {" "}design language and{" "}
        <a
          href="https://aave.com/design/building-glass-for-the-web"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-gray-400 transition-colors"
        >
          Aave&apos;s web implementation
        </a>
        .
      </p>
      <LiquidGlassExperiments />
    </>
  );
}
