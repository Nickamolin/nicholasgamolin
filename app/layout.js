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
  title: "Nicholas Gamolin",
  description: "Personal Portfolio",
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
