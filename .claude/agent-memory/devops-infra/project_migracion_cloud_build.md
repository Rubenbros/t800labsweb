---
name: migracion-cloud-build
description: Migración de GitHub Actions a Cloud Build en los 5 repos del porfolio (2026-09-09); diseño canónico y estado por repo
metadata:
  type: project
---

Se está migrando el CI/CD de los proyectos de GitHub Actions a **Cloud Build**, con un diseño
idéntico en los 5 repos: `cloudbuild.yaml` (despliegue) + `cloudbuild-ci.yaml` (pruebas), la
configuración NO secreta en `substitutions:` versionadas y los secretos en Secret Manager vía
`availableSecrets`.

**Why:** decisión del fundador — que ninguna credencial salga de Google y no depender de GitHub
para ejecutar nada. Cierra el hueco de los PAT de larga vida y de la Workload Identity Federation
hacia un tercero.

**How to apply:** al tocar CI/CD de cualquier proyecto del porfolio, seguir ese diseño; no
reintroducir dependencias de GitHub Actions. Los workflows viejos se dejan inertes en
`.github/workflows-legacy/` con un README de una línea y solo se borran cuando el primer build
real de Cloud Build pasa en verde.

**Estado 2026-09-09 · venta-estrellas (repo Rubenbros/stelvia, proyecto GCP stelvia-web):** hecho
en la rama `feat/cloud-build` (sin push). Incluye la parte difícil: el worker de composición de
vídeo (ffmpeg) deja de ser un `workflow_dispatch` y pasa a **Cloud Run Job** invocado por la app
con `jobs:run` y ADC → desaparece el PAT `GITHUB_TOKEN`.

Ver [[patron-cloud-build-migracion]] para lo reutilizable.
