import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
    try {
        const { name, email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const { data, error } = await resend.emails.send({
            // This is the PROFESSIONAL from address your users will see
            from: "Areculateir Support <support@areculateir.com>",
            // This is where YOU get notified of new opt-ins
            to: ["areculateirstudios@gmail.com"],
            subject: "New Waitlist Signup!",
            html: `
        <p><strong>Name:</strong> ${name || "—"}</p>
        <p><strong>Email:</strong> ${email}</p>
      `,
        });

        if (error) {
            console.error("Resend error:", error);
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Waitlist route error:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
