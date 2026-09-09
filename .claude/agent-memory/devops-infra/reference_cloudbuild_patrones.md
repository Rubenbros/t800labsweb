---
name: cloudbuild-patrones
description: Patrones verificados al traducir GitHub Actions a Cloud Build (proceso en background, $COMMIT_SHA vacío, escape $$, Cloud SQL por socket unix)
metadata:
  type: reference
---

Trampas verificadas traduciendo un workflow de GitHub Actions a Cloud Build (t800labsweb,
2026-09-09). Reutilizables en los otros repos del workspace.

- **Un proceso en segundo plano NO sobrevive al paso.** Cada step es un contenedor propio:
  el patrón `proxy &` en un step + consumirlo en el siguiente no se traduce. Hay que
  fusionar ambos en un solo step (o levantar un sidecar con `docker run -d --network=cloudbuild`).
- **Cloud SQL Auth Proxy con `--unix-socket /cloudsql`** reproduce dentro del step la misma
  ruta que Cloud Run monta (`/cloudsql/<instancia>/.s.PGSQL.5432`), así que el secreto
  `DATABASE_URL` de PRODUCCIÓN sirve tal cual y no hace falta un secreto `*_CI` con URL TCP.
  El proxy se autentica por ADC del servidor de metadatos (la SA del build).
- **`$COMMIT_SHA` llega vacío** en `gcloud builds submit`. Usar una substitución `_IMAGE_TAG`
  con default explícito y hacer que el trigger la fije a `$COMMIT_SHA`. Necesario además
  porque `images:` exige un valor resoluble.
- **Escapar las variables de shell con `$$`** dentro de `args: ['-c', ...]`: Cloud Build
  sustituye `$X` antes de ejecutar y falla con las que no conoce.
- **`allowFailure: true`** es la forma auditable de dejar un paso no bloqueante (lint con
  errores preexistentes): sale entero en el log y el build sigue.
- **Sin equivalente:** `concurrency` (dos pushes seguidos lanzan builds en paralelo),
  `environment:` con aprobaciones, y `paths-ignore` (los triggers usan `ignoredFiles`, que
  no aplica en builds manuales).
- El builder `gcr.io/cloud-builders/docker` ya viene autenticado contra `*.pkg.dev`:
  sobra `gcloud auth configure-docker`.
- Con `serviceAccount:` propia, `options.logging: CLOUD_LOGGING_ONLY` es obligatorio y la
  SA necesita `roles/logging.logWriter`.
