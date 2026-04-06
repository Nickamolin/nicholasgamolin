import LoadingAnimation from "@/components/LoadingAnimation";

export default function AboutPage() {
    return (
        <div className="min-h-screen w-full p-8 flex flex-col items-center justify-center bg-black">
            <LoadingAnimation className="w-48 h-48 md:w-64 md:h-64" />
        </div>
    );
}
