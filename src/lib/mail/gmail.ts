/**
 * Envío de correo transaccional por la API de Gmail (Google Workspace) SIN clave
 * de cuenta de servicio.
 *
 * Cómo funciona (delegación de dominio sin fichero JSON):
 *  1. La identidad del proceso (ADC: la cuenta de servicio de Cloud Run, o
 *     `gcloud auth application-default login` en local) pide a la IAM
 *     Credentials API que FIRME un JWT en nombre de la cuenta de servicio
 *     "mailer" (`MAILER_SERVICE_ACCOUNT`). Requiere el rol
 *     `roles/iam.serviceAccountTokenCreator` sobre esa cuenta.
 *  2. El JWT lleva `sub = GMAIL_SENDER` (usuario de Workspace suplantado).
 *     La cuenta mailer tiene delegación de dominio autorizada en el Admin de
 *     Workspace con el scope `https://www.googleapis.com/auth/gmail.send`.
 *  3. Se cambia el JWT firmado por un access token en oauth2.googleapis.com y
 *     se llama a `users.messages.send`.
 *
 * Variables de entorno:
 *  - MAILER_SERVICE_ACCOUNT  email de la cuenta de servicio con delegación
 *  - GMAIL_SENDER            usuario de Workspace suplantado (admin@t800labs.com)
 *  - MAIL_FROM               remitente por defecto, formato "Nombre <dir@dominio>"
 *  - MAIL_TRANSPORT          "gmail" (defecto) | "console" (no envía, imprime)
 */
import { GoogleAuth } from "google-auth-library";
import MailComposer from "nodemailer/lib/mail-composer";
import type Mail from "nodemailer/lib/mailer";

const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GMAIL_SEND_URL =
  "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

export interface MailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface SendMailInput {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: MailAttachment[];
  headers?: Record<string, string>;
}

export interface SendMailResult {
  /** id del mensaje en Gmail (o `console` cuando MAIL_TRANSPORT=console) */
  id: string;
  threadId?: string;
}

export class MailError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "MailError";
  }
}

let cachedToken: { value: string; expiresAt: number } | null = null;
let auth: GoogleAuth | null = null;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new MailError(`Falta la variable de entorno ${name}`);
  return v;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Access token de Gmail para el usuario suplantado, con caché en memoria. */
export async function getDelegatedAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt - 60 > now) return cachedToken.value;

  const mailerSa = requireEnv("MAILER_SERVICE_ACCOUNT");
  const subject = requireEnv("GMAIL_SENDER");

  auth ??= new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const { token: sourceToken } = await client.getAccessToken();
  if (!sourceToken) throw new MailError("No se pudo obtener el token ADC de origen");

  const claims = {
    iss: mailerSa,
    sub: subject,
    scope: GMAIL_SEND_SCOPE,
    aud: TOKEN_ENDPOINT,
    iat: now,
    exp: now + 3600,
  };
  const signRes = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(mailerSa)}:signJwt`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sourceToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload: JSON.stringify(claims) }),
    },
  );
  if (!signRes.ok) {
    throw new MailError(
      `signJwt falló (${signRes.status}): ${await signRes.text()}`,
      signRes.status,
    );
  }
  const { signedJwt } = (await signRes.json()) as { signedJwt: string };

  const tokenRes = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt,
    }),
  });
  if (!tokenRes.ok) {
    throw new MailError(
      `Intercambio de token falló (${tokenRes.status}): ${await tokenRes.text()}`,
      tokenRes.status,
    );
  }
  const data = (await tokenRes.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = { value: data.access_token, expiresAt: now + data.expires_in };
  return data.access_token;
}

async function composeRaw(input: SendMailInput): Promise<Buffer> {
  const mail: Mail.Options = {
    from: input.from ?? requireEnv("MAIL_FROM"),
    to: input.to,
    cc: input.cc,
    bcc: input.bcc,
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.text,
    html: input.html,
    headers: input.headers,
    attachments: input.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType,
    })),
  };
  return new MailComposer(mail).compile().build();
}

/**
 * Envía un correo. Lanza `MailError` si Gmail rechaza el mensaje. Los errores
 * 429/5xx son reintentables por quien llama.
 */
export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  if (!input.html && !input.text) throw new MailError("El correo necesita html o text");
  const raw = await composeRaw(input);

  if ((process.env.MAIL_TRANSPORT ?? "gmail") === "console") {
    console.info(
      `[mail:console] to=${String(input.to)} subject="${input.subject}"`,
    );
    return { id: "console" };
  }

  const token = await getDelegatedAccessToken();
  const res = await fetch(GMAIL_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: base64url(raw) }),
  });
  if (res.status === 401) cachedToken = null;
  if (!res.ok) {
    throw new MailError(
      `Gmail send falló (${res.status}): ${await res.text()}`,
      res.status,
    );
  }
  const data = (await res.json()) as { id: string; threadId?: string };
  return { id: data.id, threadId: data.threadId };
}

/** Solo para tests: limpia la caché de token. */
export function __resetMailerCache(): void {
  cachedToken = null;
  auth = null;
}
