import AnimationExperiments from "./AnimationExperiments";
import { ExperimentHeader } from "../_components/ExperimentHeader";

export const metadata = {
  title: "Animation Techniques — Playground",
  description: "GLB animation and pre-rendered sprite playback experiments.",
};

export default function AnimationPage() {
  return (
    <>
      <ExperimentHeader
        title="Real-Time vs Pre-Rendered"
        subtitle="GLB animation vs pre-rendered video"
      />
      <AnimationExperiments />
    </>
  );
}
