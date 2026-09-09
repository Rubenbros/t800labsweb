# syntax=docker/dockerfile:1

# Imagen para Google Cloud Run (europe-west1). Construir SIEMPRE para linux/amd64:
#   docker build --platform=linux/amd64 -t t800labsweb .
# Cloud Build y GitHub Actions (ubuntu-latest) ya construyen en amd64 por defecto.
#
# Este proyecto NO usa variables NEXT_PUBLIC_* (no hay ninguna en src/), así que no
# hacen falta build args: toda la configuración se inyecta en runtime desde Cloud Run
# (DATABASE_URL, DEMO_API_KEY, MAILER_SERVICE_ACCOUNT, GMAIL_SENDER, MAIL_FROM, CONTACT_TO).
#
# La base es `mirror.gcr.io/library/node:24-slim`, la caché de Docker Hub de Google:
# mismo contenido que `node:24-slim` (mismo digest) pero sin el límite de descargas
# anónimas de Docker Hub, que hace fallar builds con un 429 sin causa aparente. Sirve
# igual en local; si algún día molesta, `node:24-slim` sigue siendo equivalente.
# La directiva `# syntax` de arriba sólo se resuelve con BuildKit activado (no es el
# caso del builder `gcr.io/cloud-builders/docker` de Cloud Build) y este Dockerfile no
# usa nada exclusivo de BuildKit.

############################
# Stage 1: deps (npm ci)
############################
FROM mirror.gcr.io/library/node:24-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
# Incluye devDependencies: `next build` necesita typescript, tailwind y sharp.
RUN npm ci

############################
# Stage 2: build
############################
FROM mirror.gcr.io/library/node:24-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# `next build` con output: "standalone" (ver next.config.ts)
RUN npm run build

############################
# Stage 3: runner
############################
FROM mirror.gcr.io/library/node:24-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0

# Usuario no-root
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# Salida standalone: server.js + node_modules trazados (incluye pg, nodemailer y sharp).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# static y public NO van dentro de standalone: hay que copiarlos aparte.
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 8080

# Cloud Run inyecta PORT (8080); el server standalone lo respeta.
CMD ["node", "server.js"]
