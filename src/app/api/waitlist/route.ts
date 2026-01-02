import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function safeString(v: unknown) {
    return typeof v === "string" ? v.trim() : "";
}

export async function POST(req: Request) {
    try {
        // 1) Parse body safely
        let body: any = null;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json(
                { ok: false, error: "Invalid JSON body" },
                { status: 400 }
            );
        }

        const name = safeString(body?.name);
        const email = safeString(body?.email);
        const role = safeString(body?.role);
        const companySize = safeString(body?.companySize);
        const message = safeString(body?.message);
        const source = safeString(body?.source) || "areculateir_waitlist";

        if (!email) {
            return NextResponse.json(
                { ok: false, error: "Email is required" },
                { status: 400 }
            );
        }

        // 2) Validate env (this is the #1 cause of 500s locally)
        if (!process.env.RESEND_API_KEY) {
            return NextResponse.json(
                { ok: false, error: "Missing env: RESEND_API_KEY" },
                { status: 500 }
            );
        }

        // Optional Google Sheets webhook (Apps Script Web App URL)
        const sheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

        // 3) Fire Google Sheets logging FIRST (so you don't lose leads if email fails)
        // We do it in a try/catch so it never blocks signups.
        let sheetsResult: any = null;
        if (sheetsWebhookUrl) {
            try {
                const payload = {
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
                try {
                    sheetsResult = JSON.parse(text);
                } catch {
                    sheetsResult = text;
                }

                if (!r.ok) {
                    // We don't fail the request; we just report it back for debugging
                    sheetsResult = { ok: false, status: r.status, data: sheetsResult };
                }
            } catch (e: any) {
                sheetsResult = { ok: false, error: e?.message ?? "Sheets webhook failed" };
            }
        } else {
            sheetsResult = { ok: false, error: "GOOGLE_SHEETS_WEBHOOK_URL not set" };
        }

        // 4) Resend emails (internal + customer)
        // If Resend throws, we still return a JSON response with the reason.
        let resendInternalId: string | null = null;
        let resendCustomerId: string | null = null;

        try {
            const internal = await resend.emails.send({
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

            // Resend SDK returns { data, error } in some versions; handle both shapes
            // @ts-ignore
            resendInternalId = internal?.data?.id ?? internal?.id ?? null;

            const customer = await resend.emails.send({
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

            // @ts-ignore
            resendCustomerId = customer?.data?.id ?? customer?.id ?? null;
        } catch (e: any) {
            // IMPORTANT: still return ok:true if Sheets succeeded, so you still capture leads.
            // But we surface the Resend error for debugging.
            return NextResponse.json(
                {
                    ok: true,
                    warning: "Waitlist captured but email sending failed",
                    resendError: e?.message ?? String(e),
                    sheets: sheetsResult,
                },
                { status: 200 }
            );
        }

        // 5) Success
        return NextResponse.json(
            {
                ok: true,
                resend: { internalId: resendInternalId, customerId: resendCustomerId },
                sheets: sheetsResult,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Waitlist error:", error);
        return NextResponse.json(
            { ok: false, error: error?.message ?? "Something went wrong" },
            { status: 500 }
        );
    }
}
