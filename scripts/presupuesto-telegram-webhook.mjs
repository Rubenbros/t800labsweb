#!/usr/bin/env node
/**
 * Conecta el bot de Telegram de la demo «presupuesto por audio» con producción.
 * Se ejecuta UNA vez, cuando ya existe en Secret Manager (proyecto t800labsweb)
 * el secreto PRESUPUESTO_TELEGRAM_BOT_TOKEN con el token que da @BotFather.
 *
 *   node scripts/presupuesto-telegram-webhook.mjs            registra el webhook y enseña los enlaces
 *   node scripts/presupuesto-telegram-webhook.mjs --estado   solo enseña el estado del webhook
 *
 * Qué hace: lee el token, el secreto del webhook y el código de la demo con las
 * credenciales por defecto (ADC, sin el CLI de gcloud); registra el webhook en
 * https://t800labs.com/api/presupuesto/telegram firmado con el secreto; pone la
 * descripción del bot; e imprime el enlace de alta (t.me/<bot>?start=<código>)
 * y el de la página web. El token NUNCA se imprime.
 */
import { GoogleAuth } from "google-auth-library";

const PROYECTO = process.env.SECRETOS_PROYECTO || "t800labsweb";
const URL_WEBHOOK = process.env.PRESUPUESTO_URL_WEBHOOK || "https://t800labs.com/api/presupuesto/telegram";
const SOLO_ESTADO = process.argv.includes("--estado");

const auth = new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });

async function secreto(nombre) {
  const token = await auth.getAccessToken();
  const res = await fetch(
    `https://secretmanager.googleapis.com/v1/projects/${PROYECTO}/secrets/${nombre}/versions/latest:access`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Secret Manager respondió ${res.status} al leer ${nombre}`);
  const json = await res.json();
  return Buffer.from(json.payload.data, "base64").toString("utf8").trim() || null;
}

async function telegram(token, metodo, cuerpo = {}) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${metodo}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  const json = await res.json().catch(() => ({}));
  if (!json.ok) throw new Error(`Telegram ${metodo}: ${res.status} ${json.description ?? ""}`);
  return json.result;
}

const tokenBot = await secreto("PRESUPUESTO_TELEGRAM_BOT_TOKEN");
if (!tokenBot) {
  console.error(
    "Falta el secreto PRESUPUESTO_TELEGRAM_BOT_TOKEN en Secret Manager (proyecto t800labsweb).\n" +
      "Créalo con el token de @BotFather:  gcloud secrets create PRESUPUESTO_TELEGRAM_BOT_TOKEN " +
      "--project t800labsweb --replication-policy=user-managed --locations=europe-west1 --data-file=-",
  );
  process.exit(1);
}

const bot = await telegram(tokenBot, "getMe");
console.log(`Bot: @${bot.username} (${bot.first_name})`);

if (!SOLO_ESTADO) {
  const secretoWebhook = await secreto("PRESUPUESTO_TELEGRAM_WEBHOOK_SECRET");
  if (!secretoWebhook) throw new Error("Falta el secreto PRESUPUESTO_TELEGRAM_WEBHOOK_SECRET");
  await telegram(tokenBot, "setWebhook", {
    url: URL_WEBHOOK,
    secret_token: secretoWebhook,
    allowed_updates: ["message"],
    drop_pending_updates: true,
    max_connections: 10,
  });
  await telegram(tokenBot, "setMyShortDescription", {
    short_description: "Demo de T800 Labs: un audio y te llega el borrador del presupuesto en PDF. Datos de ejemplo.",
  });
  await telegram(tokenBot, "setMyDescription", {
    description:
      "Demo privada de T800 Labs. Mándame un audio contando el trabajo y te devuelvo el borrador del presupuesto en PDF " +
      "con los precios de la tarifa. Empresa y tarifa ficticias: datos de ejemplo.",
  });
  console.log(`Webhook registrado en ${URL_WEBHOOK}`);
}

const info = await telegram(tokenBot, "getWebhookInfo");
console.log(
  `Estado: url=${info.url || "(ninguna)"} pendientes=${info.pending_update_count}` +
    (info.last_error_message ? ` último error=«${info.last_error_message}»` : ""),
);

const codigo = await secreto("PRESUPUESTO_DEMO_CODIGO");
if (codigo) {
  console.log(`\nAlta en el bot (abrir una vez en el móvil): https://t.me/${bot.username}?start=${codigo}`);
  console.log(`Página web de la demo: https://t800labs.com/demo/presupuesto#c=${codigo}`);
}
