import { NextResponse } from "next/server";

type ProposalRequestBody = {
    ownerName?: unknown;
    email?: unknown;
    businessName?: unknown;
    serviceArea?: unknown;
    industry?: unknown;
    source?: unknown;
};

function asTrimmedString(v: unknown): string {
    return typeof v === "string" ? v.trim() : String(v ?? "").trim();
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as ProposalRequestBody;

        const ownerName = asTrimmedString(body.ownerName);
        const email = asTrimmedString(body.email);
        const businessName = asTrimmedString(body.businessName);
        const serviceArea = asTrimmedString(body.serviceArea);
        const industry = asTrimmedString(body.industry);
        const source = asTrimmedString(body.source) || "proposal_page_form";

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
            let txt = "";
            try {
                txt = await res.text();
            } catch {
                // ignore
            }

            return NextResponse.json(
                {
                    ok: false,
                    error: `Sheets webhook failed (${res.status}). ${txt}`.trim(),
                },
                { status: 502 }
            );
        }

        // Apps Script usually returns JSON, but don’t hard-fail if it returns text
        const text = await res.text();
        try {
            const parsed: unknown = JSON.parse(text);
            if (
                parsed &&
                typeof parsed === "object" &&
                "ok" in parsed &&
                (parsed as { ok?: unknown }).ok === false
            ) {
                const errMsg =
                    "error" in parsed && typeof (parsed as { error?: unknown }).error === "string"
                        ? (parsed as { error: string }).error
                        : "Sheet error";

                return NextResponse.json({ ok: false, error: errMsg }, { status: 502 });
            }
        } catch {
            // ignore JSON parse failure
        }

        return NextResponse.json({
            ok: true,
            requestId: crypto.randomUUID(),
            message: "Request received — check your inbox shortly.",
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Server error";
        return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
}
