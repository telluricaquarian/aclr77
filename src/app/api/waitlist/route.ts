import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { name, email } = await request.json();

        // Send email notification to yourself
        const data = await resend.emails.send({
            from: 'Waitlist <onboarding@resend.dev>', // Change this to your verified domain
            to: ['your-email@example.com'], // Your email to receive notifications
            subject: 'New Waitlist Signup!',
            html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p>`,
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}