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

type SheetsCallResult = {
    status: number;
    ok: boolean;
    text: string;
    finalUrl: string;
    redirects: string[];
};

/**
 * Apps Script is now GET-based (query params), not POST.
 * This helper calls /exec?secret=...&email=... etc.
 * It also manually follows redirects (Apps Script often 302s).
 */
async function getFollowRedirects(
    url: string,
    opts?: { timeoutMs?: number; maxRedirects?: number }
): Promise<SheetsCallResult> {
    const timeoutMs = opts?.timeoutMs ?? 15_000;
    const maxRedirects = opts?.maxRedirects ?? 5;

    let currentUrl = url;
    const redirects: string[] = [];

    for (let i = 0; i <= maxRedirects; i++) {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), timeoutMs);

        let res: Response;
        try {
            res = await fetch(currentUrl, {
                method: "GET",
                cache: "no-store",
                redirect: "manual",
                signal: controller.signal,
                headers: {
                    Accept: "application/json,text/plain,*/*",
                },
            });
        } finally {
            clearTimeout(t);
        }

        // Handle redirects manually
        if ([301, 302, 303, 307, 308].includes(res.status)) {
            const location = res.headers.get("location");
            const text = await res.text().catch(() => "");

            if (!location) {
                return { status: res.status, ok: false, text, finalUrl: currentUrl, redirects };
            }

            const nextUrl = new URL(location, currentUrl).toString();
            redirects.push(nextUrl);
            currentUrl = nextUrl;
            continue;
        }

        const text = await res.text().catch(() => "");
        return { status: res.status, ok: res.ok, text, finalUrl: currentUrl, redirects };
    }

    return {
        status: 508,
        ok: false,
        text: "Too many redirects calling Sheets webhook",
        finalUrl: currentUrl,
        redirects,
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
        const sheetsWebhookBase =
            process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.GOOGLE_SHEETS_WEBAPP_URL;

        const sheetsSecret = process.env.GOOGLE_SHEETS_SECRET;

        if (sheetsWebhookBase && !sheetsSecret) {
            return NextResponse.json(
                { ok: false, error: "Missing env: GOOGLE_SHEETS_SECRET" },
                { status: 500 }
            );
        }

        // 3) Log to Sheets first (do not block overall success if it fails)
        const sheets = {
            configured: Boolean(sheetsWebhookBase),
            status: 0,
            ok: false,
            finalUrl: "",
            redirects: [] as string[],
            data: null as JsonValue | string | null,
            error: null as string | null,
        };

        if (sheetsWebhookBase) {
            try {
                // Build GET /exec?secret=...&email=... etc
                const params = new URLSearchParams({
                    secret: sheetsSecret!, // guarded above
                    timestamp: new Date().toISOString(),
                    name: name || "",
                    email,
                    role: role || "",
                    companySize: companySize || "",
                    message: message || "",
                    source,
                });

                const fullUrl = `${sheetsWebhookBase}?${params.toString()}`;

                // ✅ log only the base URL (don’t leak secret)
                console.log("SHEETS URL (base):", sheetsWebhookBase);

                const r = await getFollowRedirects(fullUrl, { timeoutMs: 15_000, maxRedirects: 5 });

                sheets.status = r.status;
                sheets.finalUrl = r.finalUrl;
                sheets.redirects = r.redirects;

                const parsed = tryParseJson(r.text);
                sheets.data = parsed;

                // Success only if JSON includes { ok: true }
                if (isJsonObject(parsed) && parsed["ok"] === true) {
                    sheets.ok = true;
                } else {
                    sheets.ok = false;

                    if (!r.ok) {
                        sheets.error = `Sheets webhook HTTP ${r.status}`;
                    } else if (isJsonObject(parsed) && parsed["ok"] === false) {
                        sheets.error = typeof parsed["error"] === "string" ? parsed["error"] : "Sheets rejected";
                    } else {
                        sheets.error = "Sheets webhook did not return expected JSON {ok:true}.";
                    }

                    console.log("SHEETS STATUS:", r.status);
                    console.log("SHEETS FINAL URL:", r.finalUrl);
                    if (r.redirects.length) console.log("SHEETS REDIRECTS:", r.redirects);
                    console.log("SHEETS RAW (first 200):", (r.text || "").slice(0, 200));
                }
            } catch (e: unknown) {
                sheets.error = e instanceof Error ? e.message : "Sheets webhook failed";
                sheets.ok = false;
            }
        }

        // 4) Resend
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!resendApiKey) {
            return NextResponse.json(
                { ok: false, error: "Missing env: RESEND_API_KEY", sheets },
                { status: 500 }
            );
        }

        const resend = new Resend(resendApiKey);
        const from = process.env.RESEND_FROM || "Areculateir Support <support@areculateir.com>";

        let resendInternalId: string | null = null;
        let resendCustomerId: string | null = null;

        try {
            const internalResult = await resend.emails.send({
                from,
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
                from,
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
