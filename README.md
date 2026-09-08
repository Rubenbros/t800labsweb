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

## Despliegue

Google Cloud Run (europe-west1) desde `.github/workflows/deploy-cloudrun.yml`: cada push a
`main` aplica el esquema por el Cloud SQL Auth Proxy y despliega la imagen del `Dockerfile`.
