import type { ReactNode } from "react";

/**
 * Proposal route layout
 * ---------------------
 * Overrides the global RootLayout so the proposal page:
 * - Has NO sidebar
 * - Has NO navbar
 * - Has NO footer
 * - Has NO mobile voice CTA
 *
 * Keeps the proposal page focused and conversion-oriented.
 */
export default function ProposalLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <main className="min-h-screen bg-gray-50 antialiased">
            {children}
        </main>
    );
}
