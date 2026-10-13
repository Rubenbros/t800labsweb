# ADR 0003 · La web se actualiza sola con los vídeos publicados

- **Estado:** aceptada · 13-10-2026
- **Deciden:** el fundador (pidió juntar lo decidido en marketing con la web y publicarlo) y arquitecto-software (el
  diseño). El contenido viene de `marketing-t800labs`: el guion T1 («mi web se actualiza sola») y la oferta §6 y §7.
- **Relacionada:** ADR-MKT-012 de `marketing-t800labs` (el escaparate del panel, que es de donde se lee).

## Contexto

El vídeo T1 de T800 Labs dice «¿Cuándo actualizaste tu web por última vez? La mía se actualiza sola», y solo se puede
grabar si es verdad. Hasta el 13-10 la web era estática: el portfolio estaba escrito en el código y enseñó durante
semanas un proyecto caído. Lo que cambia cada semana son los vídeos que publica el panel de marketing (T800 Labs,
Guardesa y Stelvia); el portfolio cambia un par de veces al año.

## Decisiones

### 1. Qué la dispara y qué aparece

La dispara **un vídeo que sale en las redes**. Aparece, sin tocar la web ni desplegarla:

| Dónde | Qué |
|---|---|
| `/automatiza`, «Casos en vídeo» | Los vídeos de T800 Labs: portada, fecha, título, texto del pie, enlaces a las redes y un botón de WhatsApp que nombra el vídeo. Mientras no haya ninguno, la sección no existe |
| `/automatiza`, «Esta web se actualiza sola» (en «Quién lo monta») | Los cuatro últimos vídeos de Guardesa y Stelvia, como prueba de lo que ya funciona |
| Home, tarjetas del portfolio | La fecha del último vídeo de Guardesa y de Stelvia (desde tablet) |

Descartado: que un proyecto nuevo entre solo en el portfolio. Cambia poco, cada tarjeta lleva texto en dos idiomas y
elegir qué proyectos se enseñan es decisión del fundador (hay proyectos que no deben salir).

### 2. De dónde se lee

De `https://panel.t800labs.com/api/publico/escaparate`, una ruta de solo lectura del panel con lo que ya es público en
las redes. La web no toca la base del panel ni necesita credenciales. `ESCAPARATE_URL` apunta a otro origen en local.

### 3. Sin esperar al panel y sin fallar por él

El panel escala a cero y puede tardar segundos en despertar. Por eso:

- El servidor de la web guarda la última lista buena y la refresca una vez por minuto como mucho
  (`src/lib/escaparate/source.ts`).
- La página sale con la lista que el servidor tenga a mano: si no tiene ninguna, espera 1,2 s y, si el panel no llega,
  sale sin vídeos.
- El navegador pide después `/api/escaparate` y pinta lo último. Esa petición sí puede esperar (8 s), porque ya no
  retrasa la página.
- Si el panel falla, se sigue enseñando la última lista buena. Una respuesta vacía no borra lo que ya se veía.

Descartado: regenerar la página cada cierto tiempo (ISR). En Cloud Run cada instancia tiene su caché y, con la web
escalando a cero, casi toda visita cae en una instancia recién arrancada, que enseñaría la lista del día del despliegue.

### 4. Lo que llega de fuera se valida entero

`parseShowcase` (`src/lib/escaparate/feed.ts`) descarta la pieza que no encaja en vez de fallar: marca fuera de la lista,
fecha que no es ISO, enlace que no es `https` o no es del dominio de su red, portada que no sirve el propio escaparate.
Del pie se quitan etiquetas y enlaces, y un pie con un hueco sin rellenar («{duracion}») no se enseña. Las portadas pasan
por el optimizador de imágenes de Next, limitado a esa ruta del panel (`next.config.ts`).

## Consecuencias

- Publicar un vídeo basta: en un minuto está en la web. El tiempo que se diga en T1 es el que se cronometre.
- El título y el pie de cada vídeo de T800 Labs se ven en la web: valen las mismas líneas rojas que ya frenan su
  aprobación en el panel.
- La web depende del panel solo para lo nuevo; sin él, funciona igual con lo último que tenía (o sin la sección).
- `/automatiza` gana contenido que cambia cada semana (`changeFrequency` semanal en el sitemap).

## Comprobación

`tests/escaparate.test.ts`: el contrato con el panel, lo que se descarta, la limpieza del pie, qué se enseña en cada
sitio, la fecha de Madrid, el minuto de memoria, el fallo del panel y la página que no espera.
