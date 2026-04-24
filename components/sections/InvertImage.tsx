import Image from "next/image";

export default function InvertImage({ src, alt }: { src: string, alt: string }) {
    return (
        <div className="">
            <Image
                src={src}
                fill
                alt={alt}
                className="rounded-xl object-cover"
            />
        </div>
    );
}