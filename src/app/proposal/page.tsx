"use client";

import { ProposalGeneratorForm } from "@/components/ui/ProposalGeneratorForm";

export default function ProposalPage() {
    return (
        <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
            {/* Header / Hero */}
            <div className="w-full text-center">
                <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl border">
                    <span className="font-semibold">Aa</span>
                </div>

                <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                    Generate a high-end functional website proposal
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
                    Enter a few details and we’ll generate a structured proposal outlining
                    scope, flows, and investment. Built for serious upgrades and
                    conversion-ready systems.
                </p>
            </div>

            {/* Form Card (matches the prototype layout intention) */}
            <section className="mt-12 w-full max-w-3xl">
                <div className="rounded-2xl bg-white p-8 shadow-[0_30px_90px_rgba(0,0,0,0.25)] ring-1 ring-black/10">
                    <ProposalGeneratorForm />
                </div>
            </section>
        </main>
    );
}
