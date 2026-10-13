# T800 Labs - Web Project

## Estado actual
La home tiene implementadas sus secciones: Hero, Bond Barrel, Servicios, Proceso, Portfolio (Tron), Equipo (Blade Runner) y HAL 9000 (Contacto) + Footer.
Además existe la página `/automatiza`, con la oferta de entrada de automatizaciones con IA.
Se debe ir sección por sección, obteniendo aprobación antes de avanzar.

Gobernanza de autocompany: `ligero` (`.autocompany/config.json`). Las decisiones de negocio de T800 Labs
(público, paquetes, precios, llamada a la acción) viven en `marketing-t800labs/docs/t800labs/oferta.md`
(BDR-MKT-08 y 09): la web las refleja, no las decide. Ese documento cambia: antes de tocar el texto de
`/automatiza`, vuelve a leerlo.

## Requisito clave
**TODA la página debe estar contenida en GSAP.** Todas las animaciones, transiciones y efectos de scroll deben usar GSAP con ScrollTrigger. No usar Framer Motion ni CSS animations para las animaciones principales.

## Stack técnico
- **Next.js 16.1.6** + React 19.2.3
- **GSAP 3.14.2** con ScrollTrigger (librería principal de animación)
- **Tailwind CSS 4** (PostCSS plugin)
- **TypeScript**
- **next-intl** para i18n (español/inglés, default: es, localePrefix: "as-needed")
- **Fuentes**: Geist Sans + Geist Mono (Google Fonts)
- Lenis, Framer Motion, Split-Type están instalados pero NO se usan actualmente

## Colores
- Background: `#000000` (negro puro)
- Foreground: `#ededed`
- Accent (rojo): `#e50914`
- Accent secondary: `#ff4d4d`
- Matrix green: `#00ff41` (sección servicios)
- Muted: `#888888`
- Surface: `#0a0a0a`
- Surface light: `#141414`

## Estructura de archivos
```
src/app/[locale]/page.tsx       → Página principal (server component, renderiza HomeClient)
src/app/[locale]/HomeClient.tsx → Client component con todo el contenido y GSAP
src/app/[locale]/layout.tsx     → Layout raíz (Geist fonts, next-intl provider)
src/app/[locale]/automatiza/page.tsx → Página /automatiza (metadatos + JSON-LD; el contenido, en components/automatiza)
src/components/automatiza/      → Bloques de /automatiza (página, tarjeta de paquete, demo de chat, WhatsApp, formulario)
src/lib/automatiza/offer.ts     → Paquetes, tramos a medida y precios (fuente única; salen de las BDR-MKT-08 y 09)
src/lib/automatiza/whatsapp.ts  → Enlace de WhatsApp con el mensaje según el utm_source
src/lib/escaparate/             → Vídeos publicados que la web enseña sola (los lee del panel de marketing)
src/app/api/escaparate/route.ts → Los vídeos publicados, para que el navegador ponga la página al día
src/lib/seo.ts                  → Imagen para compartir (la genera src/app/opengraph-image.tsx)
src/app/globals.css             → Estilos base (Tailwind + CSS vars + scrollbar)
src/lib/gsap.ts                 → Config GSAP (registra ScrollTrigger, defaults)
src/lib/hal-stats.ts            → Tipos/utilidades para stats de HAL
src/i18n/routing.ts             → Config next-intl (locales: es/en)
src/i18n/request.ts             → next-intl request handler
src/proxy.ts                    → Proxy config
messages/es.json                → Traducciones español
messages/en.json                → Traducciones inglés

Componentes:
src/components/Navbar.tsx           → Navbar fixed con morph del logo, links con scroll a pinned sections
src/components/Hal9000v2.tsx        → Ojo HAL 9000 con parallax al mouse
src/components/HalShutdownPanel.tsx → Panel interactivo de "apagado" de HAL con stats
src/components/MatrixRain.tsx       → Efecto lluvia Matrix (canvas) para sección servicios
src/components/ProcessTesseract.tsx → Sección proceso: estantería de libros + tesseract wormhole
src/components/Starfield.tsx        → Campo de estrellas (canvas)
src/components/LanguageSelector.tsx → Selector de idioma (ES/EN)

API Routes:
src/app/api/hal/visit/route.ts    → Registra visitas para HAL stats
src/app/api/hal/shutdown/route.ts → Endpoint para shutdown de HAL
```

## Assets en public/
- `logo-t800labs.png` → Logo principal (800x436, PNG transparente, calavera blanca con circuitos y ojo HAL rojo central, texto "T800 LABS" debajo, estilo flat/vector sin efectos de luz)
- `logo-small.png` → Logo reducido (120x65, PNG transparente, para navbar)
- `gun-barrel.jpg` → Interior de cañón estilo James Bond (1920x1048)
- `barrel_rifling_bond.png` → Estrías del cañón para secuencia Bond
- `blood-overlay.png` → Overlay de sangre para secuencia Bond
- `bond-frames/` → Carpeta con frames del sprite del personaje Bond (frame-00.png a frame-11.png)
- `bond-sprite-raw.png` → Sprite sheet original del personaje Bond
- `ruben-jarne.jpg` → Foto de Rubén Jarné para sección Equipo

## Secciones COMPLETADAS

### 1. Hero section ✅
El Hero ocupa `h-screen`, fondo negro, y contiene:
- Glow rojo ambiente pulsante (GSAP loop)
- Scanline roja que barre de arriba a abajo
- 4 decoraciones en esquinas (SYS.01, v0.8)
- Logo calavera (flying-logo) con entrada blur→nítido + glitch flash
- Título "T800 Labs" (flying-title) con reveal escalonado (T800 blanco, Labs rojo accent)
- Línea divisora que se expande desde el centro
- Tagline "SOFTWARE DE NUEVA GENERACIÓN" en mono
- Indicador de scroll con flecha animada
- Logo y título con breathing animation sutil
- Al hacer scroll: hero se desvanece, logo+título morphean a la navbar (pinned)

### 2. Navbar + Logo Morph ✅
- Navbar fixed que aparece al scrollear el hero (opacity 0→1)
- Logo y título (elementos fixed `.flying-logo` y `.flying-title`) morphean desde el centro del hero a la esquina superior izquierda del navbar
- Background con backdrop-blur se materializa gradualmente
- Línea roja accent se dibuja
- Links de navegación aparecen staggered
- Links: Servicios, Proceso, Equipo, Contacto + selector idioma
- Navegación inteligente a secciones pinned (calcula scroll position según pin progress)
- Menú hamburguesa responsive en móvil

### 3. Bond Barrel Sequence ✅
- Sección pinned con scrub (~2500px desktop, ~1400px mobile)
- Círculo blanco pequeño viaja de izquierda a derecha
- 3 ghost circles dejan trail con labels de servicios (Web Apps, AI Integrations, Custom Software)
- Círculo se agranda revelando rifling del cañón (rotación lenta)
- Personaje Bond aparece dentro (sprite animation: walk → turn → aim)
- Canvas con 12 frames: 6 walk, 4 turn, 2 aim
- Flash de disparo (muzzle flash con layers blanco/amarillo/naranja)
- Sangre cae en drips con easing líquido orgánico (7 drips + solid fill)
- Fade a negro al final

### 4. Services Section ✅ (id="servicios")
- Sección pinned con fondo Matrix Rain (canvas verde)
- Header con subtítulo + título en verde Matrix (#00ff41)
- Grid de 5 cards: Web Development, AI & Automation, Mobile Apps, Cloud & DevOps, Custom Software
- Cards con borde verde, stagger entrance + glow flash verde
- Esquinas decorativas verdes (SYS.03, MATRIX)
- Fade to black al final del pin
- Grid responsive: 2 cols mobile, 3 tablet, 5 desktop

### 5. Process Section ✅ (id="proceso")
- Componente `ProcessTesseract` independiente
- Estantería de libros interactiva + efecto wormhole tesseract
- 5 pasos con imágenes de Unsplash
- Grid de libros 8x5 con gaps
- Animaciones GSAP propias dentro del componente

### 6. Team Section ✅ (id="equipo") — Blade Runner / Tyrell Corp
- Sección pinned con temática Blade Runner (archivos de replicantes Tyrell Corp)
- Paleta ámbar (#F2A900) — contrasta con rojo (hero) y verde (servicios)
- Card tipo "expediente de replicante" con foto + datos técnicos
- Foto con scan lines overlay + tinte ámbar + scan sweep animation
- Datos: NEXUS-7 model, inception 2019, función, especializaciones, asignaciones previas, protocolos adicionales
- Links a GitHub y LinkedIn
- Cita de Blade Runner: "All those moments will be lost in time, like tears in rain"
- Esquinas decorativas ámbar (SYS.04, TYRELL)
- Animación GSAP: CRT power-on para card, scan sweep para foto, data lines staggered
- Fade to black al final
- Escalable: cuando se una alguien más, se añade otra card NEXUS

### 7. HAL 9000 Section ✅ (id="contacto")
- Sección pinned como sección de contacto
- Componente `Hal9000v2`: ojo HAL 9000 fotorrealista con parallax al mouse
- Componente `HalShutdownPanel`: panel interactivo con fases (idle → shutting-down → revealed)
- API endpoints para tracking de visitas y simulación de shutdown
- Stats reales del visitante
- Esquinas decorativas rojas
- Fade to black al final

### 8. Footer ✅
- 3 columnas: Logo+descripción, Contacto (email+WhatsApp), Social (GitHub+LinkedIn)
- Línea de copyright
- Font mono, estilo minimalista acorde al resto
- Email: hola@t800labs.com
- WhatsApp: +34 645 515 267

### 9. Portfolio ✅ (id="portfolio") — Tron
- Sección pinned entre Proceso y Equipo, paleta cian (#00d4ff), con `TronBikes` de fondo
- 4 tarjetas, definidas en `PORTFOLIO_PROJECTS` (HomeClient.tsx) con sus textos en `Portfolio.projectN*`:
  Guardesa (SaaS propio), Stelvia (producto propio), The Rehab Studio (cliente) y Aula (formación)
- Rejilla 2×2 en móvil y tablet, 4 en fila en escritorio. En móvil se enseña `projectNSummary` (una línea)
  y desde tablet `projectNDesc`; las etiquetas de tecnología se ocultan en móvil y en pantallas bajas
- Las cuatro tarjetas, el título y el CTA tienen que caber en la pantalla con la navbar (80 px): al
  añadir o alargar una tarjeta, comprobarlo a 1280×620 y a 360×640

### 10. Página /automatiza ✅
- Página aparte (no pinned, scroll normal) para el tráfico de los vídeos: pequeños negocios de España de
  cualquier sector, casi todo móvil. Oferta general (BDR-MKT-09): «automatización con IA para negocios»
- Tres ejemplos con precio (ninguno destacado: no son un catálogo cerrado), cuota, plazo, qué incluye y qué
  no; los tres tramos a medida y la regla «si no te compensa, te lo digo»; cómo funciona; condiciones y
  garantía; quién lo monta; dudas; WhatsApp y formulario (que usa `/api/contact`)
- El mensaje de WhatsApp dice de qué red viene el visitante: `?utm_source=instagram|tiktok|youtube|facebook`
  → «Hola, vengo de Instagram. Te cuento qué me quita tiempo:»
- La demo del chat lleva siempre la etiqueta «Datos de ejemplo»
- Líneas rojas del copy (oferta §7): sin cifras de ahorro que no sean del cliente, sin «garantizado» fuera
  de la garantía escrita y sin «100 % automático»
- Movimiento con GSAP (`AutomatizaMotion`, `ChatDemo`, `StickyCta`); el contenido se sirve visible y
  respeta «reducir movimiento»
- El botón flotante de WhatsApp del layout no se pinta aquí: la página lleva los suyos

### 11. La web se actualiza sola ✅ (ADR 0003)
- La dispara un vídeo que sale en las redes: el panel de marketing lo publica y la web lo lee de su escaparate
  (`panel.t800labs.com/api/publico/escaparate`, ADR-MKT-012 de marketing-t800labs). Nadie toca la web ni la despliega
- `/automatiza`: «Casos en vídeo» (`VideoCases`, los vídeos de T800 Labs; sin ninguno, la sección no existe) y
  «Esta web se actualiza sola» dentro de «Quién lo monta» (`ProductVideos`, los últimos de Guardesa y Stelvia)
- Home: las tarjetas del portfolio con `brand` enseñan la fecha de su último vídeo (desde tablet)
- `src/lib/escaparate/`: `feed.ts` valida lo que llega del panel, `source.ts` guarda la última lista buena en el
  servidor y `use-published-videos.ts` la pone al día en el navegador con `/api/escaparate`
- La página nunca espera al panel más de 1,2 s ni falla por él. Es lo que enseña el vídeo T1: si cambia qué la
  dispara o qué aparece, hay que cambiar también `marketing-t800labs/docs/t800labs/guiones-semana-1.md`

## Secciones pendientes
- Aviso legal, privacidad y consentimiento de cookies (hoy no existen; ver `.autocompany/estado.json`)

## Notas de diseño
- Estética: oscuro, tech, cyberpunk-minimalista
- Typography: Geist Sans para headings, Geist Mono para labels/código
- Esquema: negro + rojo (#e50914) + blanco/gris + verde matrix (#00ff41 solo en servicios) + ámbar blade runner (#F2A900 solo en equipo)
- Animaciones: GSAP para todo (timelines, ScrollTrigger, scrub)
- Cada sección pinned tiene un fade-to-black al final antes de unpin
- El logo es flat/vector, sin sombras ni glows en la imagen misma (los efectos se añaden con CSS/GSAP)
- Persistent scroll indicator (flecha + progress bar) visible durante toda la página, se oculta al final
- **Pre-entrance glows**: cada sección tiene un glow radial temático (blanco Bond, verde Services, ámbar Team, rojo HAL) que se anima durante el gap entre secciones, reduciendo la percepción de "negro muerto"
- **Manifesto es scroll-through** (no pinned), fluye directamente a la siguiente sección sin gap
- **Duraciones de pin comprimidas** ~30% respecto al diseño original para reducir scroll total

## Estructura GSAP
```
src/lib/gsap.ts → gsap + ScrollTrigger registrados
                → defaults: ease "power3.out", duration 1
                → ScrollTrigger defaults: toggleActions "play none none reverse"
```
En HomeClient.tsx se usa `gsap.context()` con un ref wrapper para cleanup automático.
Todo el contenido de la página va dentro del mismo `<div ref={wrapperRef}>`.
Al final del useEffect se hace `ScrollTrigger.sort()` + `ScrollTrigger.refresh()` con delay 150ms.

## i18n
- Librería: next-intl
- Locales: `es` (default), `en`
- Prefix: "as-needed" (sin /es/ en URLs para español)
- Archivos de traducción: `messages/es.json`, `messages/en.json`
- Namespaces: Metadata, Hero, Bond, Services, Navbar, Hal, HalCorners, ScrollIndicator, Manifesto, Portfolio, Process, Team, FAQ, Footer, Automatiza, Demo
- `tests/messages.test.ts` falla si español e inglés no tienen exactamente las mismas claves

## Workflow
1. Mostrar resultado al usuario vía captura de pantalla
2. Esperar aprobación antes de avanzar a la siguiente sección
3. Cada sección nueva se añade dentro del mismo wrapperRef en HomeClient.tsx
