---
name: patron-gh-actions-a-cloud-build
description: Trampas concretas al convertir un workflow de GitHub Actions a Cloud Build (services, timeout, COMMIT_SHA, artifacts, secretEnv)
metadata:
  type: reference
---

Checklist validado convirtiendo `rent2rent` (2026-09-09). Detalle largo en el banco global
`~/.claude/agent-memory-global/devops-infra.md`.

- `services:` de Actions → `docker run -d --name X --network=cloudbuild`. Los pasos del build
  corren en esa misma red: **el host deja de ser `localhost` y pasa a ser el nombre del
  contenedor**, y el puerto es el nativo, no el mapeado. Si algún fichero de test tiene el host
  hardcodeado, hay que parametrizarlo por env con el valor viejo por defecto.
- El healthcheck de `services:` se reemplaza por un bucle `docker exec ... pg_isready`.
- `timeout` por defecto de Cloud Build = **10 min**. Suites largas exigen `timeout:` explícito.
- Máquina por defecto e2-medium (1-2 vCPU) vs runner de GitHub (4 vCPU/16 GB): poner
  `machineType: E2_HIGHCPU_8` o el build se degrada. Con `serviceAccount:` propia,
  `options.logging: CLOUD_LOGGING_ONLY` es **obligatorio**.
- `$COMMIT_SHA` solo se rellena en builds de trigger; en `gcloud builds submit` va vacío. Añadir un
  paso guarda que falle rápido y documentar `--substitutions=COMMIT_SHA=$(git rev-parse HEAD)`.
- En scripts bash dentro del YAML, toda variable de shell va como `$$VAR` (Cloud Build sustituye
  `$VAR` y falla si el nombre no es una substitution conocida).
- `upload-artifact` con `if: always()` no tiene equivalente: `artifacts:` solo sube si el build va
  verde. Patrón: `set +e` + guardar el código de salida en `/workspace/`, subir el artefacto en el
  paso siguiente y un último paso que hace `exit $$CODE`.
- Sin equivalente: `concurrency` (encolar sin cancelar) y `environment:` como gate del paso
  (`approvalConfig` bloquea el build entero). `paths-ignore` → `ignoredFiles` del trigger.
- Secretos: `availableSecrets.secretManager` + `secretEnv` por paso. Si el secreto no existe, el
  build falla al arrancar (no en el paso).
