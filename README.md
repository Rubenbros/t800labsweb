This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), una familia tipográfica de Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Servicios

- **Base de datos**: Cloud SQL (PostgreSQL 17), instancia `t800labsweb:europe-west1:t800labs-pg`.
  Esquema en `db/schema.sql`, se aplica con `npm run db:schema` (necesita `DATABASE_URL`).
  Guarda los contadores del panel HAL y las fichas de las demos dinámicas.
- **Correo**: API de Gmail de Google Workspace con delegación de dominio (`src/lib/mail/gmail.ts`).
  En local, `MAIL_TRANSPORT=console` imprime el correo en vez de enviarlo.

Copia `.env.example` a `.env.local` para trabajar en local. Sin `DATABASE_URL` la web
funciona igual: las estadísticas usan un fallback determinista y las demos dinámicas
quedan deshabilitadas.

## Pruebas

```bash
npm test          # unitarias (pg mockeado)
npm run typecheck
npm run lint
```

El test de integración de `tests/db.integration.test.ts` solo se ejecuta si defines
`DATABASE_URL_TEST`; crea y borra su propio esquema, no toca los datos de la aplicación.
Para ejecutarlo en local con un Postgres de usar y tirar:

```bash
docker run -d --name t800-pg \
  -e POSTGRES_HOST_AUTH_METHOD=trust -e POSTGRES_DB=t800labsweb_test \
  -p 55432:5432 mirror.gcr.io/library/postgres:17-alpine
DATABASE_URL_TEST=postgresql://postgres@127.0.0.1:55432/t800labsweb_test npm test
```

En CI ese Postgres lo levanta el propio `cloudbuild-ci.yaml`, así que los 17 tests se
ejecutan de verdad (no 12 pasados + 5 omitidos).

## Despliegue

Google Cloud Run (europe-west1) desde **Cloud Build** (`cloudbuild.yaml`): valida la
etiqueta de la imagen, construye la imagen del `Dockerfile`, la publica en Artifact
Registry con las etiquetas del commit y `latest`, aplica el esquema de la base de datos a
traves del Cloud SQL Auth Proxy, despliega el servicio, comprueba que la revision que
sirve trafico es la de ESTE commit y hace una peticion HTTP real que debe devolver 200.

La configuracion no secreta (proyecto, region, repositorio, cuentas de servicio, instancia
de Cloud SQL, variables de entorno del servicio) vive versionada en `substitutions:` dentro
del propio `cloudbuild.yaml`. Los secretos se leen de Secret Manager (`availableSecrets`).

Build a mano (`_IMAGE_TAG` es obligatorio: sin el, el build falla en el primer paso):

```bash
gcloud builds submit --config cloudbuild.yaml --project t800labsweb \
  --substitutions=_IMAGE_TAG=$(git rev-parse HEAD)
```

Las pruebas (lint, typecheck, vitest con Postgres efimero y `next build`) estan en
`cloudbuild-ci.yaml`, pensado para un trigger de pull request. Corre con la cuenta
`cloudbuild-ci@t800labsweb`, que solo puede escribir logs y leer las fuentes: no puede
desplegar ni leer secretos, porque ejecuta codigo de pull requests.

```bash
gcloud builds submit --config cloudbuild-ci.yaml --project t800labsweb
```

### Estado de la transicion (2026-09-09)

El despliegue por GitHub Actions (`.github/workflows/deploy-cloudrun.yml`) sigue **activo**
a proposito hasta que el primer build de Cloud Build pase en verde: los disparadores de
Cloud Build aun no existen y desactivarlo ahora dejaria el repositorio sin despliegue.
Se apaga poniendo la variable de repositorio `DEPLOY_VIA_CLOUD_BUILD` a `true`, y solo
entonces se borra el fichero.

Mientras tanto **si hay credenciales de GitHub hacia Google**: siguen existiendo la
federacion de identidad (Workload Identity Federation) y la cuenta `github-deployer`, que
permiten a GitHub Actions desplegar en este proyecto. Es deliberado, es el camino de vuelta
si Cloud Build falla, y el orquestador lo retirara despues de validar el nuevo. El objetivo
de que ninguna credencial salga de Google **no esta cumplido todavia**; lo estara cuando se
borren el proveedor de identidad federada, la cuenta `github-deployer` y este workflow.
