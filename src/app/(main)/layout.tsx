import { StickyVoiceAgent } from "@/components/StickyVoiceAgent"; // or StickyVoiceCta
import { CookieConsent } from "@/components/ui/CookieConsent";
import Footer from "@/components/ui/Footer";
import { NavBar } from "@/components/ui/Navbar";
import { Sidebar } from "@/components/ui/Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen">
            <div className="flex min-h-screen">
                <Sidebar />

                {/* Main column */}
                <div className="min-w-0 flex-1 pl-64">
                    <NavBar />
                    {children}
                    <Footer />
                </div>
            </div>

            <CookieConsent />
            <StickyVoiceAgent />
        </div>
    );
}
