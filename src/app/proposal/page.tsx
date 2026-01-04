"use client";

import QuoteModal from "@/components/ui/WaitlistModal"; // adjust if path differs
import { useState } from "react";

export default function ProposalPage() {
    const [open, setOpen] = useState(false);

    return (
        <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
            <div className="text-center">
                <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl border">
                    <span className="font-semibold">Aa</span>
                </div>

                <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                    Generate a high-end functional website proposal
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
                    Enter a few details and we’ll generate a structured proposal outlining scope, flows,
                    and investment. Built for serious upgrades and conversion-ready systems.
                </p>

                <div className="mt-10 flex justify-center">
                    <button
                        onClick={() => setOpen(true)}
                        className="rounded-md bg-yellow-300 px-6 py-3 text-sm font-semibold text-black shadow-sm transition hover:brightness-95"
                    >
                        Generate Design Proposal
                    </button>
                </div>
            </div>

            <QuoteModal
                isOpen={open}
                onClose={() => setOpen(false)}
                modalType="quote"
            />
        </main>
    );
}
