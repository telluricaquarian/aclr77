"use client";

import { ProposalGeneratorForm } from "@/components/ui/ProposalGeneratorForm";
import Image from "next/image";

export default function ProposalPage() {
    return (
        <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
            {/* Header / Hero */}
            <div className="w-full text-center">
                <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl border bg-white shadow-sm">
                    <Image
                        src="/images/Aaisolate.png"
                        alt="Areculateir logo"
                        width={32}
                        height={32}
                        className="h-8 w-8 object-contain select-none"
                        priority
                    />
                </div>

                <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                    Generate a high-end functional{" "}
                    <span className="font-redaction italic text-orange-500">website</span>{" "}
                    proposal
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
                    Enter a few details below and we’ll generate a tailored proposal
                    automatically.
                </p>
            </div>

            {/* Form Card */}
            <section className="mt-12 w-full max-w-3xl">
                <div className="rounded-2xl bg-white p-8 shadow-[0_30px_90px_rgba(0,0,0,0.25)] ring-1 ring-black/10">
                    <ProposalGeneratorForm />
                </div>
            </section>
        </main>
    );
}
