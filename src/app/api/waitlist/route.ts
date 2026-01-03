import { NextResponse } from "next/server";
import { Resend } from "resend";

type WaitlistPayload = {
    name?: string;
    email?: string;
    role?: string;
    companySize?: string;
    message?: string;
    source?: string;
};

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

function safeString(v: unknown): string {
    return typeof v === "string" ? v.trim() : "";
}

function isJsonObject(value: unknown): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function tryParseJson(text: string): JsonValue | string {
    try {
        return JSON.parse(text) as JsonValue;
    } catch {
        return text;
    }
}

// Resend SDK response shape can vary by version. We'll safely extract an id.
function extractResendId(result: unknown): string | null {
    if (!isJsonObject(result)) return null;

    const data = result["data"];
    if (isJsonObject(data)) {
        const id = data["id"];
        return typeof id === "string" ? id : null;
    }

    const id = result["id"];
    return typeof id === "string" ? id : null;
}

/**
 * Google Apps Script /exec often responds with a 302 to script.googleusercontent.com.
 * Many HTTP clients will follow that redirect by switching POST -> GET, which breaks doPost().
 * This helper follows redirects manually while preserving POST + body.
 */
async function postJsonFollowRedirects(
    url: string,
    payload: Record<string, string>,
    opts?: { timeoutMs?: number; maxRedirects?: number }
): Promise<{ status: number; ok: boolean; text: string; finalUrl: string }> {
    const timeoutMs = opts?.timeoutMs ?? 10_000;
    const maxRedirects = opts?.maxRedirects ?? 3;

    const body = JSON.stringify(payload);
    const headers = { "Content-Type": "application/json" };

    let currentUrl = url;

    for (let i = 0; i <= maxRedirects; i++) {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), timeoutMs);

        let res: Response;
        try {
            res = await fetch(currentUrl, {
                method: "POST",
                headers,
                body,
                cache: "no-store",
                redirect: "manual", // we handle redirects ourselves
                signal: controller.signal,
            });
        } finally {
            clearTimeout(t);
        }

        if (
            res.status === 301 ||
            res.status === 302 ||
            res.status === 303 ||
            res.status === 307 ||
            res.status === 308
        ) {
            const location = res.headers.get("location");
            if (!location) {
                const text = await res.text().catch(() => "");
                return { status: res.status, ok: false, text, finalUrl: currentUrl };
            }

            currentUrl = new URL(location, currentUrl).toString();
            continue;
        }

        const text = await res.text();
        return { status: res.status, ok: res.ok, text, finalUrl: currentUrl };
    }

    return {
        status: 508,
        ok: false,
        text: "Too many redirects calling Sheets webhook",
        finalUrl: currentUrl,
    };
}

export async function POST(req: Request) {
    try {
        // 1) Parse JSON body safely
        let body: WaitlistPayload;
        try {
            body = (await req.json()) as WaitlistPayload;
        } catch {
            return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
        }

        const name = safeString(body.name);
        const email = safeString(body.email);
        const role = safeString(body.role);
        const companySize = safeString(body.companySize);
        const message = safeString(body.message);
        const source = safeString(body.source) || "areculateir_waitlist";

        if (!email) {
            return NextResponse.json({ ok: false, error: "Email is required" }, { status: 400 });
        }

        // 2) Sheets webhook config
        // Prefer GOOGLE_SHEETS_WEBAPP_URL (what you added to .env.local),
        // but also support the older name GOOGLE_SHEETS_WEBHOOK_URL.
        const sheetsWebhookUrl =
            process.env.GOOGLE_SHEETS_WEBAPP_URL || process.env.GOOGLE_SHEETS_WEBHOOK_URL;

        const sheetsSecret = process.env.GOOGLE_SHEETS_SECRET;

        // If webhook is configured, secret MUST be present (your Apps Script checks it).
        if (sheetsWebhookUrl && !sheetsSecret) {
            return NextResponse.json(
                { ok: false, error: "Missing env: GOOGLE_SHEETS_SECRET" },
                { status: 500 }
            );
        }

        // 3) Log to Sheets first (do not block overall success if it fails)
        let sheets = {
            configured: Boolean(sheetsWebhookUrl),
            status: 0,
            ok: false,
            finalUrl: "",
            data: null as JsonValue | string | null,
            error: null as string | null,
        };

        if (sheetsWebhookUrl) {
            try {
                const payload: Record<string, string> = {
                    secret: sheetsSecret!, // safe because we guarded above
                    name: name || "",
                    email,
                    role: role || "",
                    companySize: companySize || "",
                    message: message || "",
                    source,
                    timestamp: new Date().toISOString(),
                };

                const r = await postJsonFollowRedirects(sheetsWebhookUrl, payload, {
                    timeoutMs: 10_000,
                    maxRedirects: 3,
                });

                sheets.status = r.status;
                sheets.ok = r.ok;
                sheets.finalUrl = r.finalUrl;

                const parsed = tryParseJson(r.text);
                sheets.data = parsed;

                // Normalize Apps Script error shapes into sheets.error
                if (!r.ok) {
                    sheets.error = `Sheets webhook HTTP ${r.status}`;
                } else if (isJsonObject(parsed) && parsed["ok"] === false) {
                    const errMsg = typeof parsed["error"] === "string" ? parsed["error"] : "Sheets rejected";
                    sheets.error = errMsg;
                    sheets.ok = false;
                }
            } catch (e: unknown) {
                sheets.error = e instanceof Error ? e.message : "Sheets webhook failed";
                sheets.ok = false;
            }
        }

        // 4) Resend
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            // Still return Sheets diagnostics so you can debug end-to-end
            return NextResponse.json(
                { ok: false, error: "Missing env: RESEND_API_KEY", sheets },
                { status: 500 }
            );
        }

        const resend = new Resend(resendApiKey);

        let resendInternalId: string | null = null;
        let resendCustomerId: string | null = null;

        try {
            const internalResult = await resend.emails.send({
                from: "Areculateir Support <support@areculateir.com>",
                to: ["areculateirstudios@gmail.com"],
                subject: "New Waitlist Signup!",
                html: `
          <p><strong>Name:</strong> ${name || "N/A"}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Role:</strong> ${role || "N/A"}</p>
          <p><strong>Company size:</strong> ${companySize || "N/A"}</p>
          <p><strong>Message:</strong> ${message || "N/A"}</p>
          <p><strong>Source:</strong> ${source}</p>
        `,
            });

            resendInternalId = extractResendId(internalResult);

            const customerResult = await resend.emails.send({
                from: "Areculateir Support <support@areculateir.com>",
                to: [email],
                subject: "You’re on the Areculateir waitlist ✅",
                html: `
          <p>Hey ${name || ""},</p>
          <p>Thanks for joining the Areculateir waitlist.</p>
          <p>I’ll be in touch soon about your free prototype and next steps.</p>
          <p>– Llewellyn</p>
        `,
            });

            resendCustomerId = extractResendId(customerResult);
        } catch (e: unknown) {
            // Keep ok:true so leads can still be captured (sheets may have worked)
            return NextResponse.json(
                {
                    ok: true,
                    warning: "Waitlist received but email sending failed",
                    resendError: e instanceof Error ? e.message : "Resend failed",
                    sheets,
                },
                { status: 200 }
            );
        }

        // 5) Success
        return NextResponse.json(
            {
                ok: true,
                resend: { internalId: resendInternalId, customerId: resendCustomerId },
                sheets,
            },
            { status: 200 }
        );
    } catch (e: unknown) {
        console.error("Waitlist error:", e);
        return NextResponse.json(
            { ok: false, error: e instanceof Error ? e.message : "Something went wrong" },
            { status: 500 }
        );
    }
}
