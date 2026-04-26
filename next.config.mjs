/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ahkkpmqdyghygygqonbi.supabase.co",
                port: "",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/games/:path*.gz",
                headers: [
                    {
                        key: "Content-Encoding",
                        value: "gzip",
                    },
                ],
            },
            {
                source: "/games/:path*.wasm.gz",
                headers: [
                    {
                        key: "Content-Type",
                        value: "application/wasm",
                    },
                ],
            },
            {
                source: "/games/:path*.js.gz",
                headers: [
                    {
                        key: "Content-Type",
                        value: "application/javascript",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
