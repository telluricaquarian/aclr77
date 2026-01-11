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

type Output = z.infer<typeof OutputSchema>;

// -----------------------------
// Tiny type guards
// -----------------------------
function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}

function asString(v: unknown): string {
    return typeof v === "string" ? v : String(v ?? "");
}

// -----------------------------
// Helpers
// -----------------------------
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

type ParseFailed = { __parse_failed: true; __raw: string };

/**
 * Robust JSON parsing:
 * - tries JSON.parse
 * - tries jsonrepair + JSON.parse
 * - tries extracting {...} then repair + parse
 */
function parseModelJson(textRaw: string): unknown | ParseFailed {
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

function normalizeOutput(raw: unknown): unknown {
    const out: Record<string, unknown> = isRecord(raw) ? { ...raw } : {};

    // brand sometimes comes back as a JSON-string
    out.brand = safeJsonParse(out.brand);

    // sitemap sometimes comes back as ["/", "/services", ...]
    if (Array.isArray(out.sitemap)) {
        if (out.sitemap.length > 0 && typeof out.sitemap[0] === "string") {
            out.sitemap = out.sitemap.map((p) => ({
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
        if (isRecord(maybeParsed)) {
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
        const rec: Record<string, { sections: unknown }> = {};
        for (const item of out.pages) {
            if (!isRecord(item)) continue;

            const routeVal = item.route ?? item.path ?? item.slug;
            const route = routeVal ? String(routeVal) : "";
            if (!route) continue;

            const sections = Array.isArray(item.sections) ? item.sections : [];
            rec[route] = { sections };
        }
        out.pages = Object.keys(rec).length ? rec : {};
    }

    // Ensure sections objects
    if (isRecord(out.pages)) {
        for (const [, pageVal] of Object.entries(out.pages)) {
            if (!isRecord(pageVal)) continue;

            const secs = (pageVal as Record<string, unknown>).sections;

            if (Array.isArray(secs) && secs.length > 0 && typeof secs[0] === "string") {
                (pageVal as Record<string, unknown>).sections = secs.map((s, idx) => ({
                    id: `section-${idx + 1}`,
                    headline: String(s),
                    subcopy: "",
                    ctas: [],
                }));
            }

            const secs2 = (pageVal as Record<string, unknown>).sections;
            if (Array.isArray(secs2)) {
                (pageVal as Record<string, unknown>).sections = secs2.map((sec, idx) => {
                    const secRec = isRecord(sec) ? sec : {};
                    const ctasVal = secRec.ctas;

                    return {
                        id: asString(secRec.id ?? `section-${idx + 1}`),
                        headline: asString(secRec.headline ?? ""),
                        subcopy: asString(secRec.subcopy ?? ""),
                        ctas: Array.isArray(ctasVal) ? ctasVal.map(String) : [],
                    };
                });
            }
        }
    }

    // files sometimes comes back as array of strings; drop it
    if (Array.isArray(out.files) && out.files.length > 0 && typeof out.files[0] === "string") {
        delete out.files;
    }

    // If brand is still wrong type, force a minimal brand object
    if (!isRecord(out.brand)) {
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

        const rawInput = {
            companyName: String(form.get("companyName") ?? "").trim(),
            offer: String(form.get("offer") ?? "").trim(),
            audience: String(form.get("audience") ?? "").trim(),
            primaryCta: String(form.get("primaryCta") ?? "").trim(),
            pages: String(form.get("pages") ?? "").trim(),
            tone: String(form.get("tone") ?? "").trim(),
            notes: String(form.get("notes") ?? "").trim(),
        };

        const input = InputSchema.parse(rawInput);

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ ok: false, error: "GEMINI_API_KEY not set." }, { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });
        const model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

        const response = await ai.models.generateContent({
            model,
            contents: [
                {
                    role: "user",
                    parts: [{ text: JSON.stringify(input, null, 2) }],
                },
            ],
            config: {
                systemInstruction: "Return STRICT JSON only.",
                responseMimeType: "application/json",
                responseJsonSchema: zodToJsonSchema(OutputSchema as unknown as z.ZodTypeAny),
                temperature: 0.2,
            },
        });

        const parsed = parseModelJson(response.text ?? "");

        if (isRecord(parsed) && parsed.__parse_failed) {
            return NextResponse.json(
                { ok: false, error: "Invalid JSON from model", raw: parsed.__raw },
                { status: 502 }
            );
        }

        const normalized = normalizeOutput(parsed);
        const validated: Output = OutputSchema.parse(normalized);

        return NextResponse.json({ ok: true, result: validated });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }
}
