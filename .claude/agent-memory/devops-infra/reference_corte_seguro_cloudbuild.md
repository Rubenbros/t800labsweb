---
name: corte-seguro-cloudbuild
description: Cómo cambiar de GitHub Actions a Cloud Build sin ventana sin despliegue, y las tres verificaciones que sustituyen a lo que Actions daba gratis
metadata:
  type: reference
---

Cómo hacer el CORTE (no la traducción del yaml, que está en [[patron-cloud-build-migracion]]).

**El workflow viejo NO se mueve a `.github/workflows-legacy/`.** Al fusionar deja de
ejecutarse en el acto, y los disparadores de Cloud Build normalmente todavía no existen: hay
una ventana sin despliegue ninguno, y el orden de las fusiones no debería importar. Se deja
el fichero donde está, ACTIVO, con un interruptor por variable de repositorio:

```yaml
jobs:
  deploy:
    if: vars.DEPLOY_VIA_CLOUD_BUILD != 'true'
```

`gh variable set DEPLOY_VIA_CLOUD_BUILD --body true` cuando el primer build de Cloud Build
pase en verde; borrar el fichero, el proveedor WIF y la SA `github-deployer` DESPUÉS. Nunca
hay ventana sin despliegue ni dos despliegues a la vez, y revertir es cambiar una variable.

**Las tres comprobaciones que hay que añadir al `cloudbuild.yaml`** (Actions las daba gratis
o no hacían falta):

1. **Guarda de `_IMAGE_TAG`**: valor por defecto centinela (`SET_BY_TRIGGER`) y paso 0 que
   exige `^[0-9a-f]{7,40}$`. Un default "usable" tipo `manual` convierte un disparador mal
   configurado en una degradación silenciosa (imagen sin trazabilidad al commit).
2. **Sustituto de `concurrency`**: tras el deploy, comprobar que la revisión que sirve
   tráfico usa el DIGEST publicado por este build; si no, fallar. Verificar el hecho
   consumado es más robusto que buscar builds en vuelo con `gcloud builds list`, que sigue
   siendo una carrera y pide permisos extra. Producción acaba sirviendo el commit más nuevo
   y el build perdedor no miente diciendo que desplegó.
   - `gcloud run services describe --format='value(status.traffic[0].revisionName)'`
   - `gcloud run revisions describe --format='value(status.imageDigest)'` devuelve la
     REFERENCIA COMPLETA `repo/imagen@sha256:…` (hay que hacer `${VAR##*@}`), y Cloud Run
     resuelve la etiqueta a digest también en `spec.containers[0].image`: comparar por
     etiqueta NO funciona.
   - El digest publicado se saca en el propio build con
     `docker image inspect IMG --format '{{index .RepoDigests 0}}' | cut -d@ -f2` y se pasa
     entre pasos por un fichero en `/workspace`.
3. **Smoke test HTTP real** contra `status.url` exigiendo 200, con reintentos por el arranque
   en frío de `min-instances=0`. Sin él, un build sale verde aunque la revisión nueva
   devuelva 500 en todas las rutas.

**Validación local antes de dar nada por bueno** (no hace falta lanzar un build):
`python -c "import yaml;yaml.safe_load(open('cloudbuild.yaml'))"`; comprobar que toda
substitución declarada se usa y que no queda ningún `$VAR` sin escapar (cargar el YAML,
serializarlo y buscar `$` tras quitar los `$$`); y extraer los scripts embebidos aplicando
las substituciones a mano para pasarles `bash -n` y ejecutarlos donde se pueda (la guarda de
`_IMAGE_TAG` y la verificación de revisión se pueden probar contra el servicio ya
desplegado, en solo lectura).
