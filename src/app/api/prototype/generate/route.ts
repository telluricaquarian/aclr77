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
function blobToBase64(buffer: ArrayBuffer) {
    return Buffer.from(buffer).toString("base64");
}

function cleanJsonText(s: string) {
    let t = (s ?? "").trim();

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

function parseModelJson(textRaw: string): unknown | ParseFailed {
    const text = cleanJsonText(textRaw);

    try {
        return JSON.parse(text);
    } catch { }

    try {
        const repaired = jsonrepair(text);
        return JSON.parse(repaired);
    } catch { }

    const block = extractFirstJsonObject(text);
    if (block) {
        try {
            const repaired = jsonrepair(block);
            return JSON.parse(repaired);
        } catch { }
    }

    return { __parse_failed: true, __raw: text.slice(0, 2000) };
}

function normalizeOutput(raw: unknown): unknown {
    const out: Record<string, unknown> = isRecord(raw) ? { ...raw } : {};

    out.brand = safeJsonParse(out.brand);

    if (Array.isArray(out.sitemap) && typeof out.sitemap[0] === "string") {
        out.sitemap = out.sitemap.map((p) => ({
            path: String(p),
            purpose: "Describe the page purpose.",
        }));
    }

    if (typeof out.pages === "string") {
        const maybeParsed = safeJsonParse(out.pages);
        out.pages = isRecord(maybeParsed)
            ? maybeParsed
            : {
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

    if (Array.isArray(out.pages)) {
        const rec: Record<string, { sections: unknown }> = {};
        for (const item of out.pages) {
            if (!isRecord(item)) continue;
            const route = String(item.route ?? item.path ?? item.slug ?? "");
            if (!route) continue;
            rec[route] = { sections: Array.isArray(item.sections) ? item.sections : [] };
        }
        out.pages = rec;
    }

    if (isRecord(out.pages)) {
        for (const page of Object.values(out.pages)) {
            if (!isRecord(page)) continue;
            const secs = page.sections;
            if (Array.isArray(secs)) {
                page.sections = secs.map((sec, i) => {
                    const r = isRecord(sec) ? sec : {};
                    return {
                        id: asString(r.id ?? `section-${i + 1}`),
                        headline: asString(r.headline ?? ""),
                        subcopy: asString(r.subcopy ?? ""),
                        ctas: Array.isArray(r.ctas) ? r.ctas.map(String) : [],
                    };
                });
            }
        }
    }

    if (Array.isArray(out.files) && typeof out.files[0] === "string") {
        delete out.files;
    }

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
                responseJsonSchema: zodToJsonSchema(
                    OutputSchema as unknown as z.ZodTypeAny
                ),
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
