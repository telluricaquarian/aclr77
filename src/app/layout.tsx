import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { StickyVoiceCta } from "@/components/sticky-voice-cta";
import Footer from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/Navbar";
import { siteConfig } from "./siteConfig";

import { CookieConsent } from "@/components/ui/CookieConsent";
import { Sidebar } from "@/components/ui/Sidebar";

const redaction = localFont({
  src: "../../public/fonts/Redaction-Italic.otf",
  display: "swap",
  variable: "--font-redaction",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yoururl.com"),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: ["Marketing", "Database", "Software"],
  authors: [{ name: "yourname", url: "" }],
  creator: "Founded by Llewellyn",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@yourname",
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={redaction.variable}>
      <body
        className={`${GeistSans.className} min-h-screen overflow-x-hidden scroll-auto bg-gray-50 antialiased selection:bg-orange-100 selection:text-orange-600`}
      >
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main shell */}
        <div className="min-h-screen lg:pl-72">
          <NavBar />
          {children}
          <Footer />
        </div>

        <CookieConsent />
        <StickyVoiceCta />
      </body>
    </html>
  );
}
