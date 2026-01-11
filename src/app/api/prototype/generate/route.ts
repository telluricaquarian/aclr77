import { GoogleGenAI } from "@google/genai";
import { jsonrepair } from "jsonrepair";
import { NextResponse } from "next/server";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const runtime = "nodejs";

// -----------------------------
// Schemas
// -----------------------------
const InputSchema = z.object({
    companyName: z.string().min(1),
    offer: z.string().min(1),
    audience: z.string().min(1),
    primaryCta: z.string().min(1),
    pages: z.string().min(1),
    tone: z.string().min(1),
    notes: z.string().optional().default(""),
});

const OutputSchema = z.object({
    brand: z.object({
        name: z.string(),
        tagline: z.string(),
        voice: z.array(z.string()),
        colors: z.object({
            background: z.string(),
            foreground: z.string(),
            accent: z.string(),
        }),
        typography: z.object({
            primary: z.string(),
            accent: z.string(),
        }),
        logoPlacement: z.object({
            navbar: z.boolean(),
            footer: z.boolean(),
            sizeHint: z.string(),
            fileNameExpected: z.string(),
        }),
    }),
    sitemap: z.array(z.object({ path: z.string(), purpose: z.string() })),
    pages: z.record(
        z.string(),
        z.object({
            sections: z.array(
                z.object({
                    id: z.string(),
                    headline: z.string(),
                    subcopy: z.string(),
                    ctas: z.array(z.string()).default([]),
                })
            ),
        })
    ),
    files: z
        .array(
            z.object({
                path: z.string(),
                content: z.string(),
            })
        )
        .optional(),
});

// -----------------------------
// Helpers
// -----------------------------
function blobToBase64(buffer: ArrayBuffer) {
    return Buffer.from(buffer).toString("base64");
}

function cleanJsonText(s: string) {
    let t = (s ?? "").trim();

    // strip ```json fences
    const fence = t.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (fence?.[1]) t = fence[1].trim();

    return t;
}

function safeJsonParse(maybeJson: unknown): unknown {
    if (typeof maybeJson !== "string") return maybeJson;
    const s = maybeJson.trim();
    if (!s) return maybeJson;
    if (!(s.startsWith("{") || s.startsWith("["))) return maybeJson;
    try {
        return JSON.parse(s);
    } catch {
        return maybeJson;
    }
}

function extractFirstJsonObject(text: string) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    return text.slice(start, end + 1);
}

/**
 * Robust JSON parsing:
 * - tries JSON.parse
 * - tries jsonrepair + JSON.parse
 * - tries extracting {...} then repair + parse
 */
function parseModelJson(textRaw: string) {
    const text = cleanJsonText(textRaw);

    // 1) direct parse
    try {
        return JSON.parse(text);
    } catch {
        // continue
    }

    // 2) repair whole text
    try {
        const repaired = jsonrepair(text);
        return JSON.parse(repaired);
    } catch {
        // continue
    }

    // 3) extract {...} and repair
    const block = extractFirstJsonObject(text);
    if (block) {
        try {
            const repaired = jsonrepair(block);
            return JSON.parse(repaired);
        } catch {
            // continue
        }
    }

    return { __parse_failed: true, __raw: text.slice(0, 2000) };
}

function normalizeOutput(raw: any) {
    const out: any = typeof raw === "object" && raw ? raw : {};

    // brand sometimes comes back as a JSON-string
    out.brand = safeJsonParse(out.brand);

    // sitemap sometimes comes back as ["/", "/services", ...]
    if (Array.isArray(out.sitemap)) {
        if (out.sitemap.length > 0 && typeof out.sitemap[0] === "string") {
            out.sitemap = out.sitemap.map((p: string) => ({
                path: String(p),
                purpose: "Describe the page purpose.",
            }));
        }
    }

    // pages sometimes comes back as:
    // - string (parse or wrap)
    // - array (convert)
    if (typeof out.pages === "string") {
        const maybeParsed = safeJsonParse(out.pages);
        if (typeof maybeParsed === "object" && maybeParsed && !Array.isArray(maybeParsed)) {
            out.pages = maybeParsed;
        } else {
            out.pages = {
                "/": {
                    sections: [
                        {
                            id: "hero",
                            headline: "Prototype outline",
                            subcopy: String(out.pages).slice(0, 800),
                            ctas: [],
                        },
                    ],
                },
            };
        }
    }

    if (Array.isArray(out.pages)) {
        const rec: Record<string, any> = {};
        for (const item of out.pages) {
            const route =
                item && (item.route || item.path || item.slug)
                    ? String(item.route || item.path || item.slug)
                    : "";
            if (!route) continue;

            const sections = Array.isArray(item.sections) ? item.sections : [];
            rec[route] = { sections };
        }
        out.pages = Object.keys(rec).length ? rec : {};
    }

    // Ensure sections objects
    if (out.pages && typeof out.pages === "object" && !Array.isArray(out.pages)) {
        for (const [, page] of Object.entries(out.pages)) {
            if (!page || typeof page !== "object") continue;

            const secs = (page as any).sections;

            if (Array.isArray(secs) && secs.length > 0 && typeof secs[0] === "string") {
                (page as any).sections = secs.map((s: string, idx: number) => ({
                    id: `section-${idx + 1}`,
                    headline: String(s),
                    subcopy: "",
                    ctas: [],
                }));
            }

            if (Array.isArray((page as any).sections)) {
                (page as any).sections = (page as any).sections.map((sec: any, idx: number) => ({
                    id: String(sec?.id ?? `section-${idx + 1}`),
                    headline: String(sec?.headline ?? ""),
                    subcopy: String(sec?.subcopy ?? ""),
                    ctas: Array.isArray(sec?.ctas) ? sec.ctas.map(String) : [],
                }));
            }
        }
    }

    // files sometimes comes back as array of strings; drop it
    if (Array.isArray(out.files) && out.files.length > 0 && typeof out.files[0] === "string") {
        delete out.files;
    }

    // If brand is still wrong type, force a minimal brand object
    if (!out.brand || typeof out.brand !== "object" || Array.isArray(out.brand)) {
        out.brand = {
            name: String(out.brand ?? "Brand"),
            tagline: "High-end systems that convert.",
            voice: ["Minimal", "Direct", "Confident"],
            colors: { background: "#0B0F1A", foreground: "#FFFFFF", accent: "#ED4D30" },
            typography: { primary: "Geist Sans", accent: "Redaction Italic" },
            logoPlacement: {
                navbar: true,
                footer: true,
                sizeHint: "24–32px height",
                fileNameExpected: "client-logo.png",
            },
        };
    }

    return out;
}

// -----------------------------
// Route
// -----------------------------
export async function POST(req: Request) {
    try {
        const form = await req.formData();

        // Old keys (from your curl)
        const businessName = String(form.get("businessName") ?? "").trim();
        const description = String(form.get("description") ?? "").trim();
        const industry = String(form.get("industry") ?? "").trim();
        const serviceArea = String(form.get("serviceArea") ?? "").trim();

        // New + fallback merge
        const rawInput = {
            companyName: String(form.get("companyName") ?? "").trim() || businessName,
            offer: String(form.get("offer") ?? "").trim() || description || "Prototype website build",
            audience:
                String(form.get("audience") ?? "").trim() ||
                [industry, serviceArea, description].filter(Boolean).join(" — ").slice(0, 600) ||
                "Founders and operators",
            primaryCta: String(form.get("primaryCta") ?? "").trim() || "Request a prototype",
            pages:
                String(form.get("pages") ?? "").trim() ||
                "Home, Services, Workflows, Resources, Contact, Prototype",
            tone: String(form.get("tone") ?? "").trim() || "Premium, minimal, conversion-first, no hype",
            notes: String(form.get("notes") ?? "").trim(),
        };

        const input = InputSchema.parse(rawInput);

        // Optional logo upload
        const logo = form.get("logo");
        let logoPart: any = null;

        if (logo instanceof Blob && logo.size > 0) {
            const ab = await logo.arrayBuffer();
            const base64 = blobToBase64(ab);
            const mimeType = (logo as File).type || "image/png";
            logoPart = { inlineData: { mimeType, data: base64 } };
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ ok: false, error: "GEMINI_API_KEY not set on server." }, { status: 500 });
        }

        const model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
        const ai = new GoogleGenAI({ apiKey });

        const jsonExample = {
            brand: {
                name: "Example Co",
                tagline: "High-end systems that convert.",
                voice: ["Minimal", "Direct", "Confident"],
                colors: { background: "#0B0F1A", foreground: "#FFFFFF", accent: "#ED4D30" },
                typography: { primary: "Geist Sans", accent: "Redaction Italic" },
                logoPlacement: {
                    navbar: true,
                    footer: true,
                    sizeHint: "24–32px height",
                    fileNameExpected: "client-logo.png",
                },
            },
            sitemap: [
                { path: "/", purpose: "Convert visitors into leads" },
                { path: "/services", purpose: "Explain offer + deliverables" },
            ],
            pages: {
                "/": {
                    sections: [
                        {
                            id: "hero",
                            headline: "Secure your position.",
                            subcopy: "Short supporting copy.",
                            ctas: ["Start Project"],
                        },
                    ],
                },
            },
        };

        const systemInstruction = `
Return STRICT JSON only. No markdown. No tables. No commentary.

Types MUST match:
- brand must be an OBJECT (not a string)
- sitemap must be an ARRAY OF OBJECTS {path,purpose} (not strings)
- pages MUST be an OBJECT/record keyed by route. NEVER a string. NEVER an array.
- files is OPTIONAL. If included, it MUST be an array of objects {path, content}. Otherwise OMIT it.

Do NOT repeat keys. Do NOT duplicate "brand" keys.

If a logo image is provided:
- Treat it as the production logo mark (do NOT invent a new logo)
- Assume developer will save it as /public/client-logo.(png|svg)
- Set logoPlacement.navbar=true and footer=true
`.trim();

        const prompt = `
Client brief:
- Company: ${input.companyName}
- Offer: ${input.offer}
- Audience: ${input.audience}
- Primary CTA: ${input.primaryCta}
- Pages: ${input.pages}
- Tone: ${input.tone}
- Notes: ${input.notes}

Output JSON must match this example SHAPE (values can differ):
${JSON.stringify(jsonExample, null, 2)}
`.trim();

        const response = await ai.models.generateContent({
            model,
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }, ...(logoPart ? [logoPart] : [])],
                },
            ],
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseJsonSchema: zodToJsonSchema(OutputSchema),
                temperature: 0.2,
            },
        });

        const parsedAny = parseModelJson(response.text ?? "");

        if ((parsedAny as any)?.__parse_failed) {
            return NextResponse.json(
                { ok: false, error: "Model did not return valid JSON", raw: (parsedAny as any).__raw },
                { status: 502 }
            );
        }

        const normalized = normalizeOutput(parsedAny);
        const validated = OutputSchema.parse(normalized);

        return NextResponse.json({ ok: true, result: validated });
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err?.message ?? "Unknown error" }, { status: 400 });
    }
}
