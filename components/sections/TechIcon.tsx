import React from "react";
import Image from "next/image";

export default function TechIcon({ src, alt }: { src: string, alt: string }) {
    return (
        <div className="relative group flex items-center justify-center transition-transform duration-300 hover:scale-110 w-24 h-24">

            {/* Monochrome Base Image */}
            <Image
                src={src}
                alt={alt}
                fill
                className="object-contain filter grayscale invert opacity-50"
            />

            {/* Masked Sheen Overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    WebkitMaskImage: `url('${src}')`,
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskImage: `url('${src}')`,
                    maskSize: 'contain',
                    maskPosition: 'center',
                    maskRepeat: 'no-repeat'
                }}
            >
                {/* The diagonal sheen sweeping right to left */}
                <div
                    className="absolute top-0 bottom-0 w-[150%] bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-25deg] translate-x-[150%] group-hover:-translate-x-[150%] transition-transform duration-700 ease-in-out"
                />
            </div>

            {/* Tooltip Name */}
            <span className="absolute -bottom-8 text-xs font-subtitle font-medium text-white tracking-widest opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                {alt}
            </span>
        </div>
    );
}