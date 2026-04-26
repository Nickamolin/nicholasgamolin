import React from 'react';
import Button from "@/components/UI/Button";

export default function PlaygroundPage() {
    return (
        <div className="min-h-screen w-full px-(--spacing-page-x) pt-(--spacing-page-top) pb-(--spacing-page-bottom) flex flex-col items-center justify-center gap-(--spacing-section)">
            <div className="flex flex-row items-center gap-8">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
            </div>
        </div>
    );
}