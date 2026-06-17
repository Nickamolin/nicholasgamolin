export const metadata = {
    description: "My personal playground.",
};

import PlaygroundClient from "./PlaygroundClient";

export default function PlaygroundPage() {
    return (
        <div className="min-h-screen w-full px-(--spacing-page-x) pt-(--spacing-page-top) pb-(--spacing-page-bottom) flex flex-col items-center justify-start gap-(--spacing-section)">
            <PlaygroundClient />
        </div>
    );
}
