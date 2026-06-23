import { PlaygroundSidebar } from "./_components/PlaygroundSidebar";

export const metadata = {
  title: "Playground — Nicholas Gamolin",
  description: "A hidden playground of interactive experiments.",
};

// Both sides get the same padding so content is centred between the two margins.
// The sidebar is fixed inside the left margin; row-level reset buttons can sit
// in the right margin using position:absolute on section wrappers.
const CONTENT_PADDING = "calc(var(--spacing-page-x) + 9rem + 1rem)";

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen w-full pt-(--spacing-page-top) pb-(--spacing-page-bottom) flex flex-col items-center justify-start"
      style={{ paddingLeft: CONTENT_PADDING, paddingRight: CONTENT_PADDING }}
    >
      <PlaygroundSidebar />

      <main className="w-full flex flex-col items-center">
        {children}
      </main>

      <div className="h-(--spacing-section) w-full" />
    </div>
  );
}
