"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";

type PrototypeResult = {
    headline: string;
    theme: {
        palette: string[];
        typography: string;
        vibe: string;
    };
    sitemap: string[];
    sections: string[];
    pages: Array<{
        route: string;
        purpose: string;
        components: string[];
    }>;
    quote: {
        rangeAUD: { low: number; high: number };
        timelineWeeks: { low: number; high: number };
        assumptions: string[];
    };
    copy: {
        heroHeadline: string;
        heroSubheadline: string;
        primaryCta: string;
        secondaryCta: string;
    };
};

function clampText(v: string, max = 2000) {
    const s = (v ?? "").toString();
    return s.length > max ? s.slice(0, max) : s;
}

export default function PrototypePage() {
    const [businessName, setBusinessName] = useState("");
    const [serviceArea, setServiceArea] = useState("");
    const [industry, setIndustry] = useState("");
    const [description, setDescription] = useState("");
    const [offer, setOffer] = useState("");
    const [notes, setNotes] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<PrototypeResult | null>(null);

    const isValid = useMemo(() => {
        return (
            businessName.trim().length > 1 &&
            description.trim().length > 20 &&
            offer.trim().length > 5
        );
    }, [businessName, description, offer]);

    const resultText = useMemo(() => {
        return result ? JSON.stringify(result, null, 2) : "";
    }, [result]);

    async function onGenerate(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!isValid) {
            setError(
                "Please fill Business name, a solid description (20+ chars), and your offer."
            );
            return;
        }

        setIsSubmitting(true);
        try {
            // For now: local stub generator (compiles/deploys)
            // Next: swap for POST to /api/prototype/generate (Gemini)
            const base = businessName.trim();

            const draft: PrototypeResult = {
                headline: `${base} — High-end site prototype + quote`,
                theme: {
                    palette: ["#0B0F1A", "#FFFFFF", "#ED4D30", "#F4F4F5"],
                    typography: "Geist Sans + Accent Italic (Redaction-like)",
                    vibe: "Premium, conversion-first, minimal, confident",
                },
                sitemap: ["Home", "Services", "Case Studies", "About", "Contact"],
                sections: [
                    "Hero (headline + sub + CTA)",
                    "Trust strip (logos/testimonials)",
                    "Services (3–6 cards)",
                    "Proof (case studies)",
                    "Process (steps)",
                    "FAQ",
                    "CTA band",
                    "Footer",
                ],
                pages: [
                    {
                        route: "/",
                        purpose: "Convert visitors into calls/leads",
                        components: ["Hero", "Services", "Case Studies", "FAQ", "CTA"],
                    },
                    {
                        route: "/services",
                        purpose: "Clarify offer + pricing anchors",
                        components: ["Service tiers", "Deliverables", "FAQ", "CTA"],
                    },
                    {
                        route: "/contact",
                        purpose: "Capture lead with form + scheduling",
                        components: ["Contact form", "Calendly embed (optional)", "Map (optional)"],
                    },
                ],
                quote: {
                    rangeAUD: { low: 4500, high: 12000 },
                    timelineWeeks: { low: 2, high: 6 },
                    assumptions: [
                        "Single brand, single language",
                        "Client provides logo/brand assets (or we create)",
                        "Copy is drafted from your inputs and refined once",
                    ],
                },
                copy: {
                    heroHeadline: `Build a high-end ${industry.trim() || "business"
                        } website that converts.`,
                    heroSubheadline:
                        "Designed with premium UI components, clear messaging, and fast performance — optimized for calls and leads.",
                    primaryCta: "Get a quote",
                    secondaryCta: "See examples",
                },
            };

            const extra = [
                serviceArea.trim() ? `Service area: ${serviceArea.trim()}` : null,
                industry.trim() ? `Industry: ${industry.trim()}` : null,
                notes.trim() ? `Notes: ${clampText(notes.trim(), 300)}` : null,
            ].filter(Boolean) as string[];

            if (extra.length) draft.quote.assumptions.unshift(...extra);

            draft.quote.assumptions.unshift(`Offer: ${clampText(offer.trim(), 250)}`);
            draft.quote.assumptions.unshift(
                `Description: ${clampText(description.trim(), 350)}`
            );

            setResult(draft);
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Something went wrong generating the prototype.";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-2xl text-center">
                {/* Aa boxed logo (matches proposal vibe) */}
                <div className="mx-auto mb-5 flex w-full justify-center">
                    <div className="rounded-2xl bg-white p-3 shadow-[0_30px_90px_rgba(0,0,0,0.12)] ring-1 ring-black/10">
                        <Image
                            src="/images/Aaisolate.png"
                            alt="Areculateir logo"
                            width={32}
                            height={32}
                            className="h-8 w-8 object-contain select-none"
                            priority
                        />
                    </div>
                </div>

                <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
                    Prototype{" "}
                    <span className="font-redaction italic text-[#ED4D30]">Website</span>{" "}
                    Generator + Quote
                </h1>

                <p className="mt-4 text-sm leading-6 text-zinc-600 sm:text-base">
                    Enter the core business inputs. For now this generates a local draft.
                    Next we’ll wire it to Gemini for higher quality and structured output.
                </p>
            </div>

            <section className="mx-auto mt-10 grid w-full max-w-5xl gap-6 lg:grid-cols-2">
                {/* Form */}
                <div className="rounded-2xl bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.12)] ring-1 ring-black/10">
                    <form onSubmit={onGenerate} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Business / Brand Name *</label>
                            <input
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="e.g. Areculateir Studios"
                                className="mt-1 w-full rounded-xl border px-3 py-2"
                                required
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium">Service area</label>
                                <input
                                    value={serviceArea}
                                    onChange={(e) => setServiceArea(e.target.value)}
                                    placeholder="e.g. Sydney"
                                    className="mt-1 w-full rounded-xl border px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Industry</label>
                                <input
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    placeholder="e.g. Plumbing"
                                    className="mt-1 w-full rounded-xl border px-3 py-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">
                                Description of business + products/services *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What do you do, who do you serve, what outcomes do you deliver?"
                                className="mt-1 min-h-[110px] w-full rounded-xl border px-3 py-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">
                                Offer + example prices (what you sell) *
                            </label>
                            <textarea
                                value={offer}
                                onChange={(e) => setOffer(e.target.value)}
                                placeholder="e.g. Website build packages: $4,500 starter, $8,500 growth, $12k premium..."
                                className="mt-1 min-h-[90px] w-full rounded-xl border px-3 py-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Notes (optional)</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any must-have features, style direction, competitors, constraints..."
                                className="mt-1 min-h-[80px] w-full rounded-xl border px-3 py-2"
                            />
                        </div>

                        {error ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {isSubmitting ? "Generating..." : "Generate Prototype + Quote"}
                        </button>

                        <p className="text-xs text-zinc-500">
                            Next step: connect this button to a server route that calls Gemini
                            and returns structured JSON.
                        </p>
                    </form>
                </div>

                {/* Output */}
                <div className="rounded-2xl bg-zinc-50 p-6 ring-1 ring-black/10">
                    {!result ? (
                        <div className="text-sm text-zinc-600">
                            Output will appear here after generation.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                    Summary
                                </div>
                                <div className="mt-2 text-lg font-semibold">{result.headline}</div>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500">Sitemap</div>
                                        <ul className="mt-2 list-disc pl-5 text-sm">
                                            {result.sitemap.map((x) => (
                                                <li key={x}>{x}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-500">Sections</div>
                                        <ul className="mt-2 list-disc pl-5 text-sm">
                                            {result.sections.map((x) => (
                                                <li key={x}>{x}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <details className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
                                <summary className="cursor-pointer text-sm font-semibold text-zinc-800">
                                    Full text (copy/paste JSON)
                                </summary>
                                <pre className="mt-4 whitespace-pre-wrap break-words text-xs text-zinc-800">
                                    {resultText}
                                </pre>
                            </details>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
