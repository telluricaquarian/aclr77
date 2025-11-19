import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { name, email, role, companySize, message } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // 1) Internal notification to you
        await resend.emails.send({
            from: "Areculateir Support <support@areculateir.com>",
            to: ["areculateirstudios@gmail.com"],
            subject: "New Waitlist Signup!",
            html: `
        <p><strong>Name:</strong> ${name || "N/A"}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Role:</strong> ${role || "N/A"}</p>
        <p><strong>Company size:</strong> ${companySize || "N/A"}</p>
        <p><strong>Message:</strong> ${message || "N/A"}</p>
      `,
        });

        // 2) Confirmation email to the customer
        await resend.emails.send({
            from: "Areculateir Support <support@areculateir.com>",
            to: [email], // 👈 this is the subscriber’s email
            subject: "You’re on the Areculateir waitlist ✅",
            html: `
        <p>Hey ${name || ""},</p>
        <p>Thanks for joining the Areculateir waitlist.</p>
        <p>I'll be in touch soon about your free prototype and next steps.</p>
        <p>– Llewellyn</p>
      `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Waitlist error:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
