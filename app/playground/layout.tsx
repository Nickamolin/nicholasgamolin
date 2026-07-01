import { PlaygroundSidebar } from "./_components/PlaygroundSidebar";

export const metadata = {
  title: "Playground — Nicholas Gamolin",
  description: "A hidden playground of interactive experiments.",
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen w-full px-(--spacing-page-x) pt-(--spacing-page-top) pb-(--spacing-page-bottom) flex flex-col items-center justify-start"
    >
      <PlaygroundSidebar />

      <main className="w-full flex flex-col items-center">
        {children}
      </main>

      <div className="h-(--spacing-section) w-full" />
    </div>
  );
}
