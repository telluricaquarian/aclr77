import { PrototypeResultSchema, type PrototypeResult } from "@/lib/prototypeSchema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";


function clampText(v: string, max = 800) {
    const s = (v ?? "").toString();
    return s.length > max ? s.slice(0, max) : s;
}

function stripCodeFences(s: string) {
    // Gemini sometimes returns ```json ... ```
    return s
        .replace(/```json\s*/gi, "")
        .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ""))
        .replace(/```/g, "")
        .trim();
}

function extractFirstJsonObject(text: string) {
    // Best-effort: find the first top-level {...} block
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    return text.slice(start, end + 1);
}

function stubResult(params: {
    businessName: string;
    serviceArea: string;
    industry: string;
    description: string;
    offer: string;
    notes: string;
    hasLogo: boolean;
}): PrototypeResult {
    const { businessName, serviceArea, industry, description, offer, notes, hasLogo } = params;

    return {
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

        const logo = fd.get("logo");
        const hasLogo = logo instanceof File && logo.size > 0;

        if (!businessName || description.length < 20 || offer.length < 6) {
            return NextResponse.json(
                { ok: false, error: "Missing required fields." },
                { status: 400 }
            );
        }

        // If no API key (or you want to keep it optional), fall back to stub.
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            const result = stubResult({
                businessName,
                serviceArea,
                industry,
                description,
                offer,
                notes,
                hasLogo,
            });
            return NextResponse.json({ ok: true, result, warning: "GEMINI_API_KEY not set; returned stub." });
        }

        // Build prompt (tight, schema-first)
        const prompt = `
You are generating JSON ONLY for a "website prototype plan + quote".

Return a SINGLE valid JSON object that matches EXACTLY this TypeScript shape:

{
  "headline": string,
  "theme": { "palette": string[], "typography": string, "vibe": string },
  "sitemap": string[],
  "sections": string[],
  "pages": { "route": string, "purpose": string, "components": string[] }[],
  "quote": {
    "rangeAUD": { "low": number, "high": number },
    "timelineWeeks": { "low": number, "high": number },
    "assumptions": string[]
  },
  "copy": {
    "heroHeadline": string,
    "heroSubheadline": string,
    "primaryCta": string,
    "secondaryCta": string
  }
}

Rules:
- Output JSON only. No markdown. No backticks.
- Use AUD numbers for quote fields (realistic).
- Make it premium + conversion-first.
- Use the user's details below, and include them in assumptions.
- Keep palette to 4-6 hex strings. You may keep Areculateir orange #ED4D30 if it fits.

User inputs:
Business name: ${businessName}
Service area: ${serviceArea || "(not provided)"}
Industry: ${industry || "(not provided)"}
Description: ${clampText(description, 1500)}
Offer/pricing: ${clampText(offer, 1200)}
Notes: ${clampText(notes, 800)}
Logo uploaded: ${hasLogo ? "yes" : "no"}
`.trim();

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const resp = await model.generateContent(prompt);
        const rawText = resp.response.text();

        const cleaned = stripCodeFences(rawText);
        const jsonBlock = extractFirstJsonObject(cleaned) ?? cleaned;

        let parsed: unknown;
        try {
            parsed = JSON.parse(jsonBlock);
        } catch {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Gemini returned non-JSON output. Try again.",
                    debug: cleaned.slice(0, 500),
                },
                { status: 502 }
            );
        }

        const validated = PrototypeResultSchema.safeParse(parsed);
        if (!validated.success) {
            return NextResponse.json(
                {
                    ok: false,
                    error: "Gemini returned JSON but it did not match the required schema.",
                    issues: validated.error.issues,
                },
                { status: 502 }
            );
        }

        return NextResponse.json({ ok: true, result: validated.data });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Server error";
        return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
}
