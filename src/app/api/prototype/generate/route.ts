import { NextResponse } from "next/server";

type PrototypeResult = {
    headline: string;
    theme: { palette: string[]; typography: string; vibe: string };
    sitemap: string[];
    sections: string[];
    pages: Array<{ route: string; purpose: string; components: string[] }>;
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

function clampText(v: string, max = 500) {
    const s = (v ?? "").toString();
    return s.length > max ? s.slice(0, max) : s;
}

export async function POST(req: Request) {
    try {
        const fd = await req.formData();

        const businessName = String(fd.get("businessName") ?? "").trim();
        const serviceArea = String(fd.get("serviceArea") ?? "").trim();
        const industry = String(fd.get("industry") ?? "").trim();
        const description = String(fd.get("description") ?? "").trim();
        const offer = String(fd.get("offer") ?? "").trim();
        const notes = String(fd.get("notes") ?? "").trim();

        // logo is optional for now; later you can:
        // - store it
        // - extract a palette
        // - pass it to Gemini as image input
        const logo = fd.get("logo");
        const hasLogo = logo instanceof File && logo.size > 0;

        if (!businessName || description.length < 20 || offer.length < 6) {
            return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
        }

        const result: PrototypeResult = {
            headline: `${businessName} — High-end site prototype + quote`,
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
                    components: ["Contact form", "Calendar embed (optional)", "Map (optional)"],
                },
            ],
            quote: {
                rangeAUD: { low: 4500, high: 12000 },
                timelineWeeks: { low: 2, high: 6 },
                assumptions: [
                    `Description: ${clampText(description, 350)}`,
                    `Offer: ${clampText(offer, 250)}`,
                    serviceArea ? `Service area: ${serviceArea}` : "Service area: (not provided)",
                    industry ? `Industry: ${industry}` : "Industry: (not provided)",
                    notes ? `Notes: ${clampText(notes, 300)}` : "Notes: (none)",
                    hasLogo ? "Logo uploaded: yes" : "Logo uploaded: no",
                ],
            },
            copy: {
                heroHeadline: `Build a high-end ${industry || "business"} website that converts.`,
                heroSubheadline:
                    "Designed with premium UI components, clear messaging, and fast performance — optimized for calls and leads.",
                primaryCta: "Get a quote",
                secondaryCta: "See examples",
            },
        };

        return NextResponse.json({ ok: true, result });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Server error";
        return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
}
