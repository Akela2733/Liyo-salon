import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"LIYO Studio Contact" <${process.env.GMAIL_USER}>`,
      to: "sakuniakela273@gmail.com",
      replyTo: email,
      subject: `New message from ${name} — LIYO Studio`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a0a; color: #f5f5f2; padding: 40px 32px; border-radius: 8px;">
          <h2 style="font-size: 22px; margin: 0 0 24px; color: #ff1111; letter-spacing: 0.06em; text-transform: uppercase;">
            New Contact Message — LIYO Studio
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(245,245,242,0.45); width: 110px;">Name</td>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 15px; font-weight: 600;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(245,245,242,0.45);">Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 15px;"><a href="mailto:${email}" style="color: #ff1111;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(245,245,242,0.45);">Phone</td>
              <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 15px;">${phone || "—"}</td>
            </tr>
          </table>
          <div style="margin-top: 28px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(245,245,242,0.45); margin: 0 0 10px;">Message</p>
            <p style="font-size: 15px; line-height: 1.7; white-space: pre-wrap; margin: 0; padding: 20px; background: rgba(255,255,255,0.04); border-radius: 4px; border-left: 3px solid #ff1111;">${message}</p>
          </div>
          <p style="margin-top: 32px; font-size: 11px; color: rgba(245,245,242,0.3); text-align: center; letter-spacing: 0.08em;">
            LIYO STUDIO · No.6, Pagoda Road, Nugegoda, Sri Lanka
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
