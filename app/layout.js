import { Outfit, Inter, Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LoadingScreen from "@/components/loading/LoadingScreen";
import { LoadingProvider } from "@/components/loading/LoadingProvider";
import { MouseProvider } from "@/components/context/MouseContext";
import Navbar from "@/components/UI/Navbar";
import { Analytics } from "@vercel/analytics/next"

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const jetbrains_mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});



export const metadata = {
  title: {
    default: "Nicholas Gamolin",
    template: "%s | Nicholas Gamolin",
  },
  description: "A showcase of my work as a digital artist and full-stack software engineer.",
  openGraph: {
    title: "Nicholas Gamolin",
    description: "A showcase of my work as a digital artist and full-stack software engineer.",
    type: "website",
    siteName: "Nicholas Gamolin",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Nicholas Gamolin Portfolio Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nicholas Gamolin",
    description: "A showcase of my work as a digital artist and full-stack software engineer.",
    images: ["/android-chrome-512x512.png"],
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ backgroundColor: '#000000' }}>
      <body
        className={`${outfit.variable} ${inter.variable} ${montserrat.variable} ${jetbrains_mono.variable} antialiased`}
      >
        <LoadingProvider>
          <MouseProvider>
            <LoadingScreen />
            <Navbar />
            {children}
          </MouseProvider>
        </LoadingProvider>
        <Analytics />
      </body>
    </html>
  );
}
