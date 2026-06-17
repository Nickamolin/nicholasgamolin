export const metadata = {
    description: "My personal playground.",
};

import RefractionLab from "./RefractionLab";

export default function PlaygroundPage() {
    return (
        <div className="min-h-screen w-full px-(--spacing-page-x) pt-(--spacing-page-top) pb-(--spacing-page-bottom) flex flex-col items-center justify-start gap-(--spacing-section)">
            {/* Header */}
            <div className="flex flex-col items-center gap-(--spacing-header-gap) mb-(--spacing-header-mb) md:mt-(--spacing-page-top)">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold">My Hidden Playground!</h1>
                <span className="text-xs md:text-sm font-subtitle font-medium tracking-[0.2em] uppercase text-gray-400">
                    Some interactions I&apos;m testing out.
                </span>
            </div>
            <RefractionLab />
            <div className="h-(--spacing-section) w-full" />
        </div>
    );
}

