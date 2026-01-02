import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // common shapes: { data: { id: "..." } } OR { id: "..." }
    const data = result["data"];
    if (isJsonObject(data)) {
        const id = data["id"];
        return typeof id === "string" ? id : null;
    }

    const id = result["id"];
    return typeof id === "string" ? id : null;
}

export async function POST(req: Request) {
    try {
        // 1) Parse JSON body safely
        let body: WaitlistPayload;
        try {
            body = (await req.json()) as WaitlistPayload;
        } catch {
            return NextResponse.json(
                { ok: false, error: "Invalid JSON body" },
                { status: 400 }
            );
        }

        const name = safeString(body.name);
        const email = safeString(body.email);
        const role = safeString(body.role);
        const companySize = safeString(body.companySize);
        const message = safeString(body.message);
        const source = safeString(body.source) || "areculateir_waitlist";

        if (!email) {
            return NextResponse.json(
                { ok: false, error: "Email is required" },
                { status: 400 }
            );
        }

        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json(
                { ok: false, error: "Missing env: RESEND_API_KEY" },
                { status: 500 }
            );
        }

        const sheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

        // 2) Log to Sheets first (non-blocking if it fails)
        let sheetsResult: JsonValue | string | { ok: false; error: string } = {
            ok: false,
            error: "GOOGLE_SHEETS_WEBHOOK_URL not set",
        };

        if (sheetsWebhookUrl) {
            try {
                const payload: Record<string, string> = {
                    name: name || "N/A",
                    email,
                    role: role || "N/A",
                    companySize: companySize || "N/A",
                    message: message || "N/A",
                    source,
                    timestamp: new Date().toISOString(),
                };

                const r = await fetch(sheetsWebhookUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    cache: "no-store",
                });

                const text = await r.text();
                const parsed = tryParseJson(text);

                if (!r.ok) {
                    sheetsResult = {
                        ok: false,
                        error: `Sheets webhook failed with status ${r.status}`,
                    };
                } else {
                    sheetsResult = parsed;
                }
            } catch (e: unknown) {
                sheetsResult = {
                    ok: false,
                    error: e instanceof Error ? e.message : "Sheets webhook failed",
                };
            }
        }

        // 3) Send Resend emails
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
            // Still return ok:true so leads are captured (Sheets likely already captured)
            return NextResponse.json(
                {
                    ok: true,
                    warning: "Waitlist captured but email sending failed",
                    resendError: e instanceof Error ? e.message : "Resend failed",
                    sheets: sheetsResult,
                },
                { status: 200 }
            );
        }

        // 4) Success response
        return NextResponse.json(
            {
                ok: true,
                resend: { internalId: resendInternalId, customerId: resendCustomerId },
                sheets: sheetsResult,
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
