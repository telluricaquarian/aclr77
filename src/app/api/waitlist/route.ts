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
};

async function callSheetsViaGet(
    baseUrl: string,
    payload: Record<string, string>,
    opts?: { timeoutMs?: number }
): Promise<SheetsCallResult> {
    const timeoutMs = opts?.timeoutMs ?? 15_000;

    const u = new URL(baseUrl);

    // IMPORTANT: Apps Script expects query params for doGet-based webhook
    Object.entries(payload).forEach(([k, v]) => u.searchParams.set(k, v));

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(u.toString(), {
            method: "GET",
            redirect: "follow", // OK for GET
            cache: "no-store",
            signal: controller.signal,
            headers: {
                Accept: "application/json,text/plain,*/*",
            },
        });

        const text = await res.text().catch(() => "");
        return { status: res.status, ok: res.ok, text, finalUrl: res.url };
    } finally {
        clearTimeout(t);
    }
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
        const sheetsWebhookUrl =
            process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.GOOGLE_SHEETS_WEBAPP_URL;

        const sheetsSecret = process.env.GOOGLE_SHEETS_SECRET;

        if (sheetsWebhookUrl && !sheetsSecret) {
            return NextResponse.json(
                { ok: false, error: "Missing env: GOOGLE_SHEETS_SECRET" },
                { status: 500 }
            );
        }

        // 3) Log to Sheets first (do not block overall success if it fails)
        const sheets = {
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
                    secret: sheetsSecret!, // safe due to guard above
                    name: name || "",
                    email,
                    role: role || "",
                    companySize: companySize || "",
                    message: message || "",
                    source,
                    timestamp: new Date().toISOString(),
                };

                console.log("SHEETS URL (GET):", sheetsWebhookUrl);

                const r = await callSheetsViaGet(sheetsWebhookUrl, payload, { timeoutMs: 15_000 });

                sheets.status = r.status;
                sheets.finalUrl = r.finalUrl;

                const parsed = tryParseJson(r.text);
                sheets.data = parsed;

                // Only success if JSON ok:true
                if (isJsonObject(parsed) && parsed["ok"] === true) {
                    sheets.ok = true;
                } else {
                    sheets.ok = false;
                    if (!r.ok) sheets.error = `Sheets webhook HTTP ${r.status}`;
                    else if (isJsonObject(parsed) && parsed["ok"] === false && typeof parsed["error"] === "string")
                        sheets.error = parsed["error"];
                    else sheets.error = "Sheets webhook did not return expected JSON {ok:true}.";
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
