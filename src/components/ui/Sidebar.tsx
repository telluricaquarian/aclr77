"use client";

import { StickyVoiceAgent } from "@/components/StickyVoiceAgent";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type NavItem = { label: string; id: string };

const nav: NavItem[] = [
    { label: "Web Design w/ High End UI", id: "solutions" },
    { label: "Client Acquisition (by discretion)", id: "farm-management" },
    { label: "Funnel Optimization (by discretion)", id: "solar-analytics" },
];

const resources = [
    {
        label: "Design Sensibilities – Notable Design Figures",
        href: "https://resourceareculateir.vercel.app/design-sensibilities",
    },
    { label: "Web Design", href: "/web-design" },
];

export function Sidebar() {
    const pathname = usePathname();

    const scrollToId = React.useCallback((id: string) => {
        const el = document.getElementById(id);
        if (!el) return;

        const prefersReduced =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        el.scrollIntoView({
            behavior: prefersReduced ? "auto" : "smooth",
            block: "start",
        });
    }, []);

    const go = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        // If we're on home, scroll in-page like the navbar
        if (pathname === "/") {
            e.preventDefault();
            scrollToId(id);

            // Clean up the hash if it exists (matches your navbar behavior)
            if (window.location.hash) {
                history.replaceState(null, "", window.location.pathname);
            }
        }
        // If we're NOT on home, we let the Link navigate to "/#id"
        // so the browser lands on the section.
    };

    const isActive = (id: string) => {
        // Sidebar highlight based on being on home.
        // (Hash isn't available from next/navigation in a stable way here.)
        return pathname === "/" && id === "solutions"; // optional: keep one default active on home
    };

    return (
        <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-80 lg:flex-col">
            <div className="relative h-full border-r bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                {/* Logo area */}
                <div className="px-6 pb-4 pt-6">
                    <Link href="/" aria-label="Home" className="inline-flex items-center">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-md border border-black/10 bg-white shadow-sm">
                            <Image
                                src="/images/Aaisolate.png"
                                alt="Areculateir Aa mark"
                                fill
                                sizes="40px"
                                priority
                                className="select-none object-contain p-1.5"
                            />
                        </div>
                    </Link>
                </div>

                <div className="space-y-8 px-6 pb-6">
                    <div>
                        <div className="mb-2 inline-flex rounded-full border px-2 py-0.5 text-xs font-medium">
                            Home
                        </div>

                        <nav className="space-y-2">
                            {nav.map((item) => {
                                const href = `/#${item.id}`;
                                return (
                                    <Link
                                        key={item.id}
                                        href={href}
                                        onClick={go(item.id)}
                                        className={cn(
                                            "block text-sm transition",
                                            isActive(item.id)
                                                ? "font-medium text-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div>
                        <div className="mb-2 inline-flex rounded-full border px-2 py-0.5 text-xs font-medium">
                            Resources
                        </div>

                        <nav className="space-y-2">
                            {resources.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "block text-sm transition",
                                        pathname === item.href
                                            ? "font-medium text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Desktop-only mount inside sidebar */}
                <div className="hidden lg:block">
                    <StickyVoiceAgent />
                </div>
            </div>
        </aside>
    );
}
