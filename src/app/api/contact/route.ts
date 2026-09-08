import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail/gmail";

// Formulario de contacto → correo por la API de Gmail (Google Workspace).
// Variables: MAILER_SERVICE_ACCOUNT, GMAIL_SENDER, MAIL_FROM, CONTACT_TO.
// En local, MAIL_TRANSPORT=console imprime el correo en vez de enviarlo.

export const runtime = "nodejs";

const DEFAULT_TO = "admin@t800labs.com";
const DEFAULT_FROM = "T800 Labs <admin@t800labs.com>";

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Quita saltos de línea: evitan inyección de cabeceras en asunto/replyTo. */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? singleLine(body.name) : "";
  const email = typeof body.email === "string" ? singleLine(body.email) : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 },
    );
  }

  if (
    name.length > MAX_NAME ||
    email.length > MAX_EMAIL ||
    message.length > MAX_MESSAGE
  ) {
    return NextResponse.json({ error: "Field too long" }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const to = process.env.CONTACT_TO || DEFAULT_TO;
  const from = process.env.MAIL_FROM || DEFAULT_FROM;

  try {
    await sendMail({
      to,
      from,
      replyTo: `${name} <${email}>`,
      subject: `Contacto desde t800labs.com — ${name}`,
      text: `Nombre: ${name}\nEmail: ${email}\n\n${message}`,
      html:
        `<p><strong>Nombre:</strong> ${escapeHtml(name)}</p>` +
        `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` +
        `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] no se pudo enviar el correo:", err);
    return NextResponse.json(
      { error: "No se pudo enviar el mensaje. Escribe a " + to },
      { status: 502 },
    );
  }
}
