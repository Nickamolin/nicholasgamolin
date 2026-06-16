//export const dynamic = 'force-dynamic';

export const metadata = {
    description: "My personal playground.",
};

export default function PlaygroundPage() {
    return (
        <div className="min-h-screen w-full px-(--spacing-page-x) pt-(--spacing-page-top) pb-(--spacing-page-bottom) flex flex-col items-center justify-start gap-(--spacing-section)">


            <div className="flex flex-col items-center w-full max-w-5xl">
                <div className="flex flex-col items-center gap-(--spacing-header-gap) mb-(--spacing-header-mb) md:mt-(--spacing-page-top)">
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold">Playground</h1>
                    <span className="text-xs md:text-sm font-subtitle font-medium tracking-[0.2em] uppercase text-gray-400">Some interactions I'm testing out.</span>
                </div>
            </div>

        </div>
    );
}
