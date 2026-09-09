---
name: patron-cloud-build-migracion
description: Trampas concretas al portar GitHub Actions a Cloud Build (COMMIT_SHA vacío, $GITHUB_ENV, Testcontainers, rate limit de Docker Hub, SA del CI)
metadata:
  type: reference
---

Trampas verificadas al portar workflows de GitHub Actions a Cloud Build. Todas muerden en
silencio si no se atacan a propósito.

- **`$COMMIT_SHA` llega VACÍO en `gcloud builds submit` manual** (solo lo rellenan los triggers).
  Si es a la vez etiqueta de imagen y `GIT_COMMIT_SHA` (versión de Cloud Error Reporting), el
  resultado es `imagen:` y agrupación de errores perdida. Solución: substitución propia `_TAG`
  con un centinela (`sin-definir`), un step 0 que falla si no se pasa, y el trigger mapeando
  `_TAG = $COMMIT_SHA`.
- **No existe `$GITHUB_ENV`**: los steps no comparten variables. Pasar por ficheros en
  `/workspace`. Peligroso cuando el valor alimenta `--set-secrets` o `--set-env-vars`, que son
  DESTRUCTIVOS: una cadena vacía BORRA lo que hoy tiene el servicio. Verificar el fichero no
  vacío antes de usarlo.
- **Testcontainers NO funciona tal cual**: cada step ES un contenedor sobre un daemon compartido,
  así que el puerto mapeado no está en su `localhost`. Peor si el setup captura el fallo y marca
  "skipped": build VERDE sin haber corrido un test. Solución: sidecar `docker run -d
  --network=cloudbuild --name X` + una URL externa por env, y que ese camino NO capture errores.
- **Rate limit de Docker Hub**: los pulls salen por NAT compartido de Google. Usar
  `mirror.gcr.io/library/<imagen>` (espejo gratuito de Google) en lugar de Docker Hub directo.
- **Con `serviceAccount:` propia, `options.logging: CLOUD_LOGGING_ONLY` es OBLIGATORIO.**
- **El CI necesita SA DISTINTA de la del deploy**: en el CI se ejecuta código de pull requests;
  darle permisos de despliegue es un agujero de cadena de suministro. CI = solo
  `logging.logWriter`.
- **El free tier (2.500 min/mes) solo aplica a la máquina POR DEFECTO.** Subir a `E2_HIGHCPU_8`
  para igualar la velocidad de un runner de GitHub renuncia al free tier.
- **`.dockerignore` es del contexto**: si excluye directorios que otra imagen del mismo repo sí
  necesita, ensamblar un contexto aparte en `/workspace` en vez de pelearse con BuildKit.
- **Trabajo de cómputo bajo demanda (`workflow_dispatch` disparado por la app)**: la mejor
  traducción es un **Cloud Run Job** invocado con `jobs:run` (API v2) y ADC, no
  `builds.create`. Menos payload en la app, retries/timeout nativos y elimina el PAT. Se pierde
  el `concurrency: group` por clave dinámica que GitHub daba gratis: hay que apoyarse en la
  idempotencia de la aplicación.
