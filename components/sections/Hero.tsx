import Head3D from "@/components/3D/Head3D";
import Image from "next/image";

export default function Hero() {
    return (
        <div className="flex flex-col md:grid md:grid-cols-2 items-center justify-center min-h-[80vh] md:min-h-[80vh] w-full gap-8 md:gap-0 px-6 max-w-[1400px] mx-auto">
            {/* 3D Head Container - Using Grid for perfect 50/50 split */}
            <div className="w-full max-w-[300px] sm:max-w-[400px] md:max-w-none aspect-square flex items-center justify-center order-1 md:order-none">
                <div className="w-full h-full max-w-[500px] max-h-[500px]">
                    <Head3D />
                </div>
            </div>

            <div className="flex flex-col justify-center items-center gap-4 z-10 w-full order-2 md:order-none">
                <h1 className="text-[clamp(2rem,9vw,4rem)] md:text-[clamp(3rem,5vw,6rem)] font-title font-bold text-center whitespace-nowrap leading-[0.9]">
                    Nicholas Gamolin
                </h1>

                <span className="text-xs md:text-sm text-center font-subtitle font-medium tracking-[0.2em] uppercase text-gray-400">
                    Design Engineer / Creative Technologist
                </span>

                <div className="flex gap-8 items-center flex-row opacity-75">
                    <a
                        href="https://github.com/Nickamolin"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src="/icons/github.svg"
                            width={50}
                            height={50}
                            alt="GitHub"
                            className="dark:invert hover:opacity-75 transition-all duration-500 w-[24px] h-[24px] md:w-[36px] md:h-[36px]"
                        />
                    </a>
                    <a
                        href="https://www.youtube.com/@Drakonic/videos"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src="/icons/YouTubeIconBW.svg"
                            width={50}
                            height={50}
                            alt="YouTube"
                            className="dark:invert hover:opacity-75 transition-all duration-500 w-[24px] h-[24px] md:w-[36px] md:h-[36px]"
                        />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/nicholas-gamolin/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src="/icons/linkedinBlack.svg"
                            width={50}
                            height={50}
                            alt="LinkedIn"
                            className="dark:invert hover:opacity-75 transition-all duration-500 w-[24px] h-[24px] md:w-[36px] md:h-[36px]"
                        />
                    </a>
                </div>
            </div>
        </div>
    );
}
