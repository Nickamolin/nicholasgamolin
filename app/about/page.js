export default function AboutPage() {
    return (
        <div className="min-h-screen w-full p-8 flex flex-col items-center justify-center bg-black">

            <video
                autoPlay
                loop
                muted
                playsInline
                className="w-48 h-48 md:w-64 md:h-64 object-contain"
            >
                <source src="https://ahkkpmqdyghygygqonbi.supabase.co/storage/v1/object/public/animations/draft.mkv" type="video/x-matroska" />
                Loading...
            </video>

        </div>
    );
}
