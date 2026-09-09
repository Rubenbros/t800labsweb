---
name: cloudbuild-migracion-t800labsweb
description: t800labsweb migró su despliegue de GitHub Actions a Cloud Build (rama feat/cloud-build, 2026-09-09, endurecida tras revisión adversarial); qué queda pendiente del orquestador
metadata:
  type: project
---

El despliegue de t800labsweb pasó a Cloud Build (`cloudbuild.yaml` + `cloudbuild-ci.yaml`),
rama `feat/cloud-build`, 2026-09-09. Sin push ni merge: lo hace el orquestador.

**Why:** el fundador quiere que ninguna credencial salga de Google y no depender de GitHub
para ejecutar nada. Es la misma migración en los 5 repos del workspace.

**How to apply — estado tras la revisión adversarial (2026-09-09, segunda pasada):**

- El workflow de Actions **volvió a `.github/workflows/` y está ACTIVO**, con
  `if: vars.DEPLOY_VIA_CLOUD_BUILD != 'true'` en el job. Dejarlo en `workflows-legacy` habría
  dejado el repo sin despliegue al fusionar (los disparadores de Cloud Build aún no existen).
  `.github/workflows-legacy/` ya no existe.
- `cloudbuild-ci.yaml` corre con `cloudbuild-ci@t800labsweb` (solo logs + lectura de fuentes),
  nunca con la SA de despliegue: ejecuta código de pull requests.
- `_IMAGE_TAG` ya no cae a `'manual'`: centinela `SET_BY_TRIGGER` + paso 0 que exige un SHA.

**Pendiente del orquestador** (por orden):
1. Crear el disparador de despliegue sobre `main` con `_IMAGE_TAG = $COMMIT_SHA` y el de
   pruebas por pull request apuntando a `cloudbuild-ci.yaml`.
2. Cuando el primer build pase en verde: `gh variable set DEPLOY_VIA_CLOUD_BUILD --body true`,
   y solo DESPUÉS borrar `.github/workflows/deploy-cloudrun.yml`, el proveedor WIF y la SA
   `github-deployer` (mientras existan, el README dice la verdad: sí hay credenciales de
   GitHub hacia Google).
3. Estrechar IAM: `cloudbuild-deployer` no necesita `roles/storage.admin` de proyecto; basta
   `roles/storage.objectViewer` acotado a `gs://t800labsweb_cloudbuild`. El yaml ya no usa
   `images:`, así que tampoco necesita escritura en buckets.
4. Deuda con fecha: 2026-10-09 para arreglar los 6 errores de lint preexistentes, borrar el
   script `lint:ci` de `package.json` y dejar `npm run lint` bloqueante.

Ver también [[cloudbuild-patrones]] y [[patron-cloud-build-migracion]].
