import { NextResponse } from "next/server";

// EmailJS config — set these in your .env.local:
// EMAILJS_SERVICE_ID=your_service_id
// EMAILJS_TEMPLATE_ID=your_template_id
// EMAILJS_PUBLIC_KEY=your_public_key
// EMAILJS_PRIVATE_KEY=your_private_key (optional, for server-side)
//
// Setup steps:
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Add an email service (Gmail) under Email Services
// 3. Create a template with variables: {{from_name}}, {{from_email}}, {{message}}
// 4. Copy the IDs to .env.local

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !templateId || !publicKey) {
      // If EmailJS is not configured, log the message and return success
      // This way the form still "works" during development
      console.log("📬 Contact form submission (EmailJS not configured):");
      console.log(`  Name: ${name}`);
      console.log(`  Email: ${email}`);
      console.log(`  Message: ${message}`);
      return NextResponse.json({ ok: true, fallback: true });
    }

    // Send via EmailJS REST API (server-side)
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: {
          from_name: name,
          from_email: email,
          message: message,
        },
      }),
    });

    if (res.ok) {
      return NextResponse.json({ ok: true });
    } else {
      const text = await res.text();
      console.error("EmailJS error:", text);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
