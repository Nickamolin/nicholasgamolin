import { PlaygroundSidebar } from "./_components/PlaygroundSidebar";

export const metadata = {
  title: "Playground — Nicholas Gamolin",
  description: "A hidden playground of interactive experiments.",
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full px-(--spacing-page-x) pt-(--spacing-page-top) pb-(--spacing-page-bottom) flex flex-col items-center justify-start gap-(--spacing-section)">

      {/* Header */}
      <div className="flex flex-col items-center gap-(--spacing-header-gap) mb-(--spacing-header-mb) md:mt-(--spacing-page-top)">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold">My Hidden Playground!</h1>
        <span className="text-xs md:text-sm font-subtitle font-medium tracking-[0.2em] uppercase text-gray-400">
          Some interactions I&apos;m testing out.
        </span>
      </div>

      {/* Sidebar + content */}
      <div className="flex flex-row items-start justify-center w-full gap-6">
        <PlaygroundSidebar />
        <main className="flex-1 min-w-0 flex flex-col items-center">
          {children}
        </main>
      </div>

      <div className="h-(--spacing-section) w-full" />
    </div>
  );
}
