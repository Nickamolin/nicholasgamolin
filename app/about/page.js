import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="min-h-screen w-full p-8 flex flex-col items-center justify-start gap-8">

            <div className="flex flex-col items-center justify-center gap-4">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-title font-bold mt-8">Background</h1>
                <span className="text-xs md:text-sm font-subtitle font-medium tracking-[0.2em] uppercase text-gray-400">A little bit about me</span>
            </div>

            <div className="flex flex-row items-start justify-start gap-8 mt-8">
                <Image
                    src="/photos/TimesSquare.jpeg"
                    width={500}
                    height={500}
                    alt="Headshot"
                    className="rounded-xl"
                />
                <p className="text-lg md:text-xl font-body font-medium text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
            </div>

        </div>
    );
}
