import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const ownerName = String(body.ownerName || "").trim();
        const email = String(body.email || "").trim();
        const businessName = String(body.businessName || "").trim();
        const serviceArea = String(body.serviceArea || "").trim();
        const industry = String(body.industry || "").trim();
        const source = String(body.source || "proposal_page_form").trim();

        if (!ownerName || !email || !businessName || !serviceArea) {
            return NextResponse.json(
                { ok: false, error: "Missing required fields." },
                { status: 400 }
            );
        }

        const url = process.env.PROPOSAL_WEBHOOK_URL;
        const secret = process.env.PROPOSAL_WEBHOOK_SECRET || "";

        if (!url) {
            return NextResponse.json(
                { ok: false, error: "Missing PROPOSAL_WEBHOOK_URL" },
                { status: 500 }
            );
        }

        const u = new URL(url);
        if (secret) u.searchParams.set("secret", secret);

        u.searchParams.set("ownerName", ownerName);
        u.searchParams.set("email", email);
        u.searchParams.set("businessName", businessName);
        u.searchParams.set("serviceArea", serviceArea);
        u.searchParams.set("industry", industry);
        u.searchParams.set("source", source);
        u.searchParams.set("timestamp", new Date().toISOString());

        const res = await fetch(u.toString(), { method: "GET" });

        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            return NextResponse.json(
                { ok: false, error: `Sheets webhook failed (${res.status}). ${txt}`.trim() },
                { status: 502 }
            );
        }

        // Apps Script usually returns JSON, but don’t hard-fail if it returns text
        const text = await res.text();
        try {
            const parsed = JSON.parse(text);
            if (parsed && parsed.ok === false) {
                return NextResponse.json(
                    { ok: false, error: parsed.error || "Sheet error" },
                    { status: 502 }
                );
            }
        } catch {
            // ignore JSON parse failure
        }

        return NextResponse.json({
            ok: true,
            requestId: crypto.randomUUID(),
            message: "Request received — check your inbox shortly.",
        });
    } catch (err: any) {
        return NextResponse.json(
            { ok: false, error: err?.message || "Server error" },
            { status: 500 }
        );
    }
}
