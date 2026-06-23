import RefractionExperiments from "./RefractionExperiments";
import { ExperimentHeader } from "../_components/ExperimentHeader";

export const metadata = {
  title: "Refraction Techniques — Playground",
  description: "Screen-space, virtual-plane, and html-to-image refraction experiments.",
};

export default function RefractionPage() {
  return (
    <>
      <ExperimentHeader
        title="Refraction Techniques"
        subtitle="Screen-space, virtual-plane, and html-to-image refraction"
      />
      <RefractionExperiments />
    </>
  );
}
