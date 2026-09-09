---
name: migracion-cloudbuild
description: Migración de GitHub Actions a Cloud Build en los 5 repos del workspace (sep-2026); rent2rent hecho en rama feat/cloud-build
metadata:
  type: project
---

Se sustituye GitHub Actions por Cloud Build en los 5 repos ya migrados a Cloud Run.
Diseño común: `cloudbuild.yaml` (despliegue) + `cloudbuild-ci.yaml` (pruebas), SA de build
`cloudbuild-deployer@<proyecto>.iam.gserviceaccount.com`, config no secreta en `substitutions:`
versionadas y secretos en Secret Manager vía `availableSecrets`.

**Why:** el fundador quiere que ninguna credencial salga de Google y no depender de GitHub para
ejecutar nada. Antes la config vivía en `vars`/`secrets` de GitHub: invisible y no auditable.

**How to apply:** al tocar CI/CD de cualquier proyecto del workspace, asumir Cloud Build, no
Actions. Los workflows viejos se mueven a `.github/workflows-legacy/` (no se borran) hasta que el
primer build real pase en verde — así se revierte en un commit.

Estado (2026-09-09): `rent2rent` migrado en la rama `feat/cloud-build` (sin push ni merge).
Pendiente del orquestador: crear la SA de build con sus roles, el secreto
`next-public-firebase-api-key` en Secret Manager, el bucket de artefactos y los triggers.

Ver [[patron-gh-actions-a-cloud-build]] para las trampas técnicas de la conversión.
