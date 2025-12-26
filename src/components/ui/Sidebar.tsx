"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
    { label: "Home", href: "/" },
    { label: "Web Design w/ High End UI", href: "/web-design" },
    { label: "Client Acquisition (by discretion)", href: "/client-acquisition" },
    { label: "Funnel Optimization (by discretion)", href: "/funnel-optimization" },
];

const resources = [
    { label: "Design Sensibilities – Notable Design Figures", href: "/design-sensibilities" },
    { label: "Web Design", href: "/web-design" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
            <div className="h-full border-r bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-6 pt-6 pb-4">
                    <div className="text-xl font-semibold">A~</div>
                </div>

                <div className="px-6 pb-6 space-y-8">
                    <div>
                        <div className="mb-2 inline-flex rounded-full border px-2 py-0.5 text-xs font-medium">
                            Home
                        </div>
                        <nav className="space-y-2">
                            {nav.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "block text-sm transition",
                                        pathname === item.href ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
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
                                        pathname === item.href ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>
        </aside>
    );
}
