import { Outfit, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import LoadingScreen from "@/components/LoadingScreen";
import { LoadingProvider } from "@/components/LoadingProvider";
import Navbar from "@/components/Navbar";
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



export const metadata = {
  title: "Nicholas Gamolin",
  description: "Personal Portfolio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} ${montserrat.variable} antialiased`}
      >
        <LoadingProvider>
          <LoadingScreen />
          <Navbar />
          {children}
        </LoadingProvider>
        <Analytics />
      </body>
    </html>
  );
}
