// src/app/(main)/layout.tsx
import { StickyVoiceAgent } from "@/components/StickyVoiceAgent";
import { CookieConsent } from "@/components/ui/CookieConsent";
import Footer from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/Navbar";
import { Sidebar } from "@/components/ui/Sidebar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {/* Desktop sidebar only */}
            <Sidebar />

            <div className="min-h-screen lg:pl-72">
                {/* Desktop-only navbar */}
                <div className="hidden lg:block">
                    <NavBar />
                </div>

                {children}
                <Footer />
            </div>

            <CookieConsent />

            {/* Mobile-only voice CTA */}
            <div className="lg:hidden">
                <StickyVoiceAgent />
            </div>
        </>
    );
}
