# T800 Labs - Web Project

## Estado actual
Página empezada desde cero. Solo tiene el **Hero section** terminado y aprobado por el usuario.
Se debe ir sección por sección, obteniendo aprobación antes de avanzar.

## Requisito clave
**TODA la página debe estar contenida en GSAP.** Todas las animaciones, transiciones y efectos de scroll deben usar GSAP con ScrollTrigger. No usar Framer Motion ni CSS animations para las animaciones principales.

## Stack técnico
- **Next.js 16.1.6** + React 19.2.3
- **GSAP 3.14.2** con ScrollTrigger (librería principal de animación)
- **Tailwind CSS 4** (PostCSS plugin)
- **TypeScript**
- **Fuentes**: Geist Sans + Geist Mono (Google Fonts)
- Lenis, Framer Motion, Split-Type están instalados pero NO se usan actualmente

## Colores
- Background: `#000000` (negro puro)
- Foreground: `#ededed`
- Accent (rojo): `#e50914`
- Accent secondary: `#ff4d4d`
- Muted: `#888888`
- Surface: `#0a0a0a`
- Surface light: `#141414`

## Archivos actuales
```
src/app/page.tsx          → Página principal (solo Hero actualmente)
src/app/layout.tsx        → Layout raíz (Geist fonts, sin SmoothScroll)
src/app/globals.css       → Estilos base (Tailwind + CSS vars + scrollbar)
src/lib/gsap.ts           → Config GSAP (registra ScrollTrigger, defaults)
```

## Assets en public/
- `logo-t800labs.png` → Logo principal (800x436, PNG transparente, calavera blanca con circuitos y ojo HAL rojo central, texto "T800 LABS" debajo, estilo flat/vector sin efectos de luz)
- `logo-small.png` → Logo reducido (120x65, PNG transparente, para navbar)
- `gun-barrel.jpg` → Interior de cañón estilo James Bond (1920x1048)

## Hero section (COMPLETADO ✅)
El Hero ocupa `h-screen`, fondo negro, y contiene:
- Glow rojo ambiente pulsante (GSAP loop)
- Scanline roja que barre de arriba a abajo
- 4 decoraciones en esquinas (SYS.01, v0.8, SCROLL ↓)
- Logo calavera con entrada blur→nítido + glitch flash
- Título "T800 Labs" con reveal escalonado (T800 blanco, Labs rojo accent)
- Línea divisora que se expande desde el centro
- Tagline "SOFTWARE DE NUEVA GENERACIÓN" en mono
- Botón CTA "INICIAR SECUENCIA" con borde rojo
- Logo con breathing animation sutil
- Todo animado con un master GSAP timeline

## Secciones pendientes (ir una por una con aprobación)
El usuario quiere ir sección por sección. Posibles secciones a añadir:
- Gun Barrel / Bond sequence (usa gun-barrel.jpg)
- Servicios
- Sobre nosotros
- Portfolio
- Contacto
- Footer

## Notas de diseño
- Estética: oscuro, tech, cyberpunk-minimalista
- Typography: Geist Sans para headings, Geist Mono para labels/código
- Esquema: negro + rojo (#e50914) + blanco/gris
- Animaciones: GSAP para todo (timelines, ScrollTrigger, scrub)
- El logo es flat/vector, sin sombras ni glows en la imagen misma (los efectos se añaden con CSS/GSAP)

## Estructura GSAP
```
src/lib/gsap.ts → gsap + ScrollTrigger registrados
                → defaults: ease "power3.out", duration 1
                → ScrollTrigger defaults: toggleActions "play none none reverse"
```
En page.tsx se usa `gsap.context()` con un ref wrapper para cleanup automático.
Todo el contenido de la página irá dentro del mismo `<div ref={wrapperRef}>`.

## Workflow
1. Mostrar resultado al usuario vía captura de pantalla
2. Esperar aprobación antes de avanzar a la siguiente sección
3. Cada sección nueva se añade dentro del mismo wrapperRef en page.tsx
