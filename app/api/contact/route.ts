import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { name, email, message } = await request.json();

        // Basic validation
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "All fields are required." },
                { status: 400 }
            );
        }

        const contactEmail = process.env.CONTACT_EMAIL;
        if (!contactEmail) {
            console.error("CONTACT_EMAIL environment variable is not set.");
            return NextResponse.json(
                { error: "Server configuration error." },
                { status: 500 }
            );
        }

        const { data, error } = await resend.emails.send({
            from: "Portfolio Contact Form <onboarding@resend.dev>",
            to: contactEmail,
            subject: `New message from ${name}`,
            replyTo: email,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">New Contact Form Submission</h2>
                    <hr style="border: none; border-top: 1px solid #eee;" />
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <hr style="border: none; border-top: 1px solid #eee;" />
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap; color: #555;">${message}</p>
                </div>
            `,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return NextResponse.json(
                { error: error.message || "Failed to send email." },
                { status: 500 }
            );
        }

        console.log("Email sent successfully:", data);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to send email:", error);
        return NextResponse.json(
            { error: "Failed to send message. Please try again later." },
            { status: 500 }
        );
    }
}
