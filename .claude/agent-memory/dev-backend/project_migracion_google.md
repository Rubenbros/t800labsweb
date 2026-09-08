---
name: migracion-google-t800labsweb
description: Decisiones no obvias de la migración de t800labsweb de Upstash/EmailJS a Cloud SQL + Gmail (2026-09-08)
metadata:
  type: project
---

En la rama `feat/servicios-google` (2026-09-08) se migró la persistencia a Cloud SQL y el correo
a la API de Gmail. Dos cosas se dejaron **a propósito** como estaban:

1. `recordShutdown` sigue aceptando `userTime = 0` como candidato a "mejor tiempo". La ruta
   `/api/hal/shutdown` convierte cualquier cuerpo inválido en `0`, así que un cliente puede dejar
   `fastest` clavado en 0 para siempre. Es un bug previo a la migración, no una regresión.
2. `npm run lint` ya fallaba en `main` con 6 errores (require en `scripts/split-sprite.js`,
   `set-state-in-effect` en componentes GSAP, un comentario JSX en `not-found.tsx`). Ninguno viene
   de la migración.

**Why:** una migración de infraestructura no debe cambiar el comportamiento observable ni arrastrar
refactors de la capa de animación; separar el ruido previo del cambio real es lo que permite revisar
el diff con confianza.

**How to apply:** si alguien reporta un "mejor tiempo" absurdo en el panel de HAL, la causa es la
validación de entrada de la ruta, no la capa de Postgres; arréglalo ahí y con su BDR. Y no bloquees
un PR de esta rama por los errores de lint heredados.
