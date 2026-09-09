# 1. Cloud Build en lugar de GitHub Actions para construir y desplegar

- Estado: aceptada
- Fecha: 2026-09-09
- Decisores: fundador (T800 Labs), `devops-infra`
- Ámbito: t800labsweb (parte de la misma migración en los 5 repos del workspace)

## Contexto y planteamiento del problema

t800labsweb se despliega en Cloud Run (`europe-west1`, proyecto GCP `t800labsweb`) desde
`.github/workflows/deploy-cloudrun.yml`. Ese workflow se autentica con **Workload Identity
Federation** contra la cuenta `github-deployer@t800labsweb`, es decir: un tercero (GitHub)
tiene, de forma permanente, un camino para desplegar en producción y para leer los secretos
que el despliegue necesita. Además la configuración no secreta (proyecto, repositorio de
Artifact Registry, cuentas de servicio) vivía en `vars` de GitHub: invisible desde el
repositorio y no auditable en revisión de código.

La pregunta: ¿dónde debe ejecutarse el camino a producción de un proyecto cuya
infraestructura entera está en Google?

## Opciones consideradas

1. **Seguir en GitHub Actions.** Coste cero de migración; el pipeline ya funciona y es
   conocido. Mantiene la superficie de confianza en GitHub (WIF + SA de despliegue), la
   configuración fuera del repositorio y el runner fuera de la red donde vive todo lo demás.
2. **Cloud Build (elegida).** El build corre dentro del proyecto GCP, con una cuenta de
   servicio propia y sin ninguna identidad externa con permiso de despliegue. La
   configuración no secreta pasa a `substitutions:` versionadas y los secretos a Secret
   Manager. A cambio, se pierden funciones del ecosistema de Actions (ver consecuencias) y
   el CI de pull requests deja de ser gratuito de facto.
3. **Mixto: pruebas en Actions, despliegue en Cloud Build.** Aprovecha los minutos gratuitos
   de Actions para el CI. Pero obliga a mantener dos sistemas, dos lenguajes de pipeline y
   dos sitios donde mirar cuando algo falla, y deja igualmente credenciales de GitHub hacia
   Google si el CI necesitara alguna vez tocar recursos del proyecto.

## Decisión

Se adopta la opción 2: **Cloud Build**, con dos ficheros en la raíz del repositorio:

- `cloudbuild.yaml` — despliegue. Corre con `cloudbuild-deployer@t800labsweb`.
- `cloudbuild-ci.yaml` — pruebas de pull request. Corre con `cloudbuild-ci@t800labsweb`,
  que **sólo** puede escribir logs y leer las fuentes: ejecuta código de pull requests,
  incluidas las de terceros, y por eso no puede desplegar ni leer secretos.

La transición es reversible por diseño: el workflow de GitHub Actions **sigue activo** y se
apaga con la variable de repositorio `DEPLOY_VIA_CLOUD_BUILD=true` cuando el primer build de
Cloud Build pase en verde. Hasta ese momento **no** se cumple todavía el objetivo de que
ninguna credencial salga de Google: WIF y `github-deployer` siguen existiendo a propósito.

## Consecuencias

### Positivas

- No hace falta ninguna identidad externa con permiso de despliegue una vez retirado el
  camino viejo (queda pendiente borrar WIF y `github-deployer`).
- La configuración no secreta es visible y revisable en el repositorio (`substitutions:`)
  en vez de estar en `vars` de GitHub.
- Separación de privilegios real entre desplegar y probar, que en Actions no existía.
- Los pasos comparten `/workspace`, así que desaparece el baile de
  `upload-artifact`/`download-artifact`.

### Negativas y mitigaciones

- **Se pierde `concurrency`.** Cloud Build no sabe encolar builds del mismo disparador: dos
  pushes seguidos lanzan builds paralelos que pueden desplegar en orden no determinista, y
  el commit viejo podría quedar sirviendo. Mitigación implementada: el paso
  `verify-revision` comprueba, después del deploy, que la revisión que sirve tráfico usa el
  **digest** publicado por ESTE build; si no, el build se marca rojo. Se eligió verificar el
  hecho consumado en vez de detectar builds en vuelo con `gcloud builds list` porque eso
  último sigue siendo una carrera (el otro build puede desplegar entre la consulta y el
  deploy) y exige permisos extra. Con esta mitigación el estado de producción es siempre el
  del commit más reciente y ningún build miente diciendo que desplegó.
- **Se pierde `environment:` con reglas de aprobación** y `paths-ignore` tal cual: pasan a
  `--require-approval` y a `ignoredFiles` del disparador, con semántica distinta.
- **Coste.** GitHub Actions era gratis. Cloud Build cobra por minuto de build y el tramo
  gratuito (2 500 min/mes) **sólo aplica a la máquina por defecto**: al heredar
  `machineType: E2_HIGHCPU_8` para igualar la velocidad del runner de GitHub, todos los
  minutos se facturan (≈0,016 $/min ⇒ ≈0,15 $ por build de ~10 min). Con el ritmo de
  commits de este proyecto son unos pocos euros al mes, más el almacenamiento de imágenes
  en Artifact Registry, que ya se pagaba. Si molesta, bajar a la máquina por defecto y
  recuperar el tramo gratuito es cambiar una línea: en apps pequeñas el cuello de botella
  es la red (`docker build` sin caché, `npm ci`), no la CPU.
- **Menos ecosistema**: no hay `actions/*` reutilizables; cada cosa se escribe en bash, lo
  que obliga a cuidar el escape `$$` de las variables de shell.
- **Nuevo trabajo operativo**: hay que crear y mantener los disparadores (uno de despliegue
  sobre `main` con `_IMAGE_TAG=$COMMIT_SHA`, uno de pruebas por pull request), que no viven
  en el repositorio.

## Verificación añadida en esta decisión

Al no existir ya el `concurrency` ni la red de seguridad de Actions, el `cloudbuild.yaml`
incorpora tres comprobaciones que el workflow viejo no tenía: guarda de `_IMAGE_TAG` (un
disparador mal configurado falla en segundos en vez de publicar una imagen mal etiquetada),
verificación de la revisión servida y **smoke test HTTP real** contra la URL del servicio,
que exige un 200 antes de dar el despliegue por bueno.

## Notas

Este repositorio no tiene `docs/negocio/decisiones.md`: la decisión es puramente técnica y
no genera BDR. Si se crea ese registro más adelante, esta ADR es la referencia.
