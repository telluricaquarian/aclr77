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

function safeFileName(name: string) {
    return name.replace(/[^\w.\-() ]+/g, "_").slice(0, 120);
}

export default function PrototypePage() {
    const [businessName, setBusinessName] = useState("");
    const [serviceArea, setServiceArea] = useState("");
    const [industry, setIndustry] = useState("");
    const [description, setDescription] = useState("");
    const [offer, setOffer] = useState("");
    const [notes, setNotes] = useState("");

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

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

    function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null;

        if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);

        if (!f) {
            setLogoFile(null);
            setLogoPreviewUrl(null);
            return;
        }

        const maxMB = 5;
        if (f.size > maxMB * 1024 * 1024) {
            setError(`Logo file is too large. Max ${maxMB}MB.`);
            e.target.value = "";
            setLogoFile(null);
            setLogoPreviewUrl(null);
            return;
        }

        setError(null);
        setLogoFile(f);
        setLogoPreviewUrl(URL.createObjectURL(f));
    }

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
            const fd = new FormData();
            fd.set("businessName", businessName.trim());
            fd.set("serviceArea", serviceArea.trim());
            fd.set("industry", industry.trim());
            fd.set("description", description.trim());
            fd.set("offer", offer.trim());
            fd.set("notes", notes.trim());

            if (logoFile) {
                fd.set("logo", logoFile, safeFileName(logoFile.name));
            }

            const res = await fetch("/api/prototype/generate", {
                method: "POST",
                body: fd,
            });

            const json = (await res.json()) as
                | { ok: true; result: PrototypeResult }
                | { ok: false; error: string };

            if (!json.ok) {
                throw new Error(json.error || "Failed to generate.");
            }

            setResult(json.result);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Something went wrong generating the prototype.";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
            <div className="mx-auto max-w-2xl text-center">
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

                <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
                    Prototype{" "}
                    <span className="font-redaction italic text-[#ED4D30]">Website</span>{" "}
                    Generator + Quote
                </h1>

                <p className="mt-4 text-sm leading-6 text-zinc-600 sm:text-base">
                    Enter the core business inputs. Next we’ll wire it to Gemini for higher
                    quality and structured output.
                </p>
            </div>

            <section className="mx-auto mt-10 grid w-full max-w-5xl gap-6 lg:grid-cols-2">
                {/* Form */}
                <div className="rounded-2xl bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.12)] ring-1 ring-black/10">
                    <form onSubmit={onGenerate} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Brand logo (optional)</label>
                            <div className="mt-2 flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border bg-zinc-50">
                                    {logoPreviewUrl ? (
                                        <img
                                            src={logoPreviewUrl}
                                            alt="Logo preview"
                                            className="h-full w-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-xs text-zinc-400">No logo</span>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                        onChange={onLogoChange}
                                        className="block w-full text-sm"
                                    />
                                    <p className="mt-1 text-xs text-zinc-500">
                                        PNG/JPG/SVG/WebP. Max 5MB. Later we’ll extract a palette from
                                        this.
                                    </p>
                                </div>
                            </div>
                        </div>

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
                            Next step: this calls <code>/api/prototype/generate</code>. After
                            that we’ll swap the stub for Gemini.
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
