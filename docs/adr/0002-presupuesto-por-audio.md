# ADR 0002 · Prototipo «presupuesto por audio» (demo del vídeo T2)

- **Estado:** aceptada · 13-10-2026
- **Deciden:** arquitecto-software y dev-backend, por encargo del orquestador (el fundador dijo «Sí, encárgalo» el
  13-10). Las decisiones de negocio vienen de `marketing-t800labs/docs/t800labs/oferta.md` (P1) y del guion T2.
- **Alcance:** un prototipo que funcione de verdad el sábado 17-10 para grabar el vídeo T2. **No** es todavía el P1
  vendible (multicliente, tarifa del cliente desde su Excel, su logo, hoja de registro, WhatsApp propio): ese diseño es
  otro encargo (oferta §8) y partirá de este código.

## Contexto

El dueño de un negocio manda un audio («Baño de cinco metros: quitar la bañera, plato de ducha de 120, alicatar hasta
el techo y cambiar el lavabo») y en segundos recibe un **borrador** de presupuesto en PDF: partidas, mediciones,
precios de **su** tarifa y total con IVA. Lo que no está en la tarifa sale como «precio pendiente». Nunca se envía solo
al cliente final. La frase del vídeo tiene que ser verdad: el tiempo que se diga es el medido.

Restricciones: T800 Labs no tiene número de WhatsApp Business; sin gasto ni cuentas nuevas; Windows sin ventanas y sin
Docker en local; secretos solo en Secret Manager; el dinero real (IA, infraestructura) sí cuenta.

## Decisiones

### 1. Canal: bot de Telegram + página web móvil, con el mismo núcleo

| Opción | A favor | En contra |
|---|---|---|
| WhatsApp Cloud API | Es lo que dice el guion | Hace falta número propio, verificación en Meta y ~2 €/mes; no llega al sábado |
| **Bot de Telegram** | Gratis e inmediato; nota de voz y PDF nativos en el chat; es el canal previsto para el P1 mientras no haya número (oferta §10) | El bot lo crea alguien con cuenta de Telegram (@BotFather) |
| **Página `/demo/presupuesto`** | Sin cuentas; graba con el micrófono del móvil y enseña el cronómetro; sirve de respaldo y para probar en producción | No es «un mensaje»: en vídeo se ve como una web |

Se hacen **las dos**: comparten todo (dictado → presupuesto → PDF) y solo cambian la entrada y la salida. WhatsApp será
otro adaptador más cuando exista el número. Si el vídeo usa Telegram o la web, la frase «por WhatsApp» del pie y del
guion hay que cambiarla.

### 2. Dónde vive: dentro de t800labsweb

Contexto acotado `src/lib/presupuestos/` (dominio puro, IA, PDF, canales) más dos rutas (`/api/presupuesto/borrador`,
`/api/presupuesto/telegram`) y la página. Se despliega con el resto de la web (Cloud Run `europe-west1`, Cloud SQL
compartida). Descartado: meterlo en Guardesa (otro producto y otros datos) o un servicio nuevo (más infraestructura sin
ventaja para un prototipo).

### 3. IA: una sola llamada multimodal a Gemini 3.5 Flash-Lite en Vertex `eu`

- **Una llamada** transcribe y extrae a la vez (audio + reglas + catálogo → JSON). Dos pasos (voz a texto y luego
  extracción) suman otra ida y vuelta.
- **Salida restringida por esquema** (los códigos de partida solo pueden ser los de la tarifa o `FUERA_DE_TARIFA`) y
  **validada con zod** al volver.
- **La IA no ve precios.** Elige partidas y dice qué se mide; el precio sale de la tarifa en código. Así no puede
  inventarlos ni cambiarlos.
- **Las mediciones las calcula el código** (`dominio/medicion.ts`). En las pruebas, el modelo daba 17, 19, 20 o 21 m²
  para las mismas paredes; ahora dice «paredes de un baño de 5 m²» y la cuenta es determinista y sale escrita en el PDF.
- **Modelo y ajustes, medidos el 13-10-2026** con un audio sintético de la frase del guion:
  - `gemini-3.5-flash` en `eu`: 41 s o más, inservible.
  - `gemini-3.5-flash-lite` con pensamiento `low`: 6-10 s y alguna partida de más.
  - `gemini-3.5-flash-lite` con pensamiento **`minimal`**: 3-5 s cuando el servidor está libre y partidas correctas
    (tras afinar el prompt, 10 de 10 iguales con la frase del guion). **Elegido.**
  - La cola de Vertex varía mucho: a ratos una de cada dos peticiones tarda de 11 a 35 s, en `eu` y también en
    `global`, pero dos peticiones lanzadas a la vez casi nunca son lentas las dos. Por eso salen **dos peticiones
    iguales a la vez, una tercera si a los 5 s no ha llegado nada**, y gana la primera respuesta válida; las demás se
    cancelan. Medido la tarde del 13-10 (hora punta): 4,8-8,9 s en 13 de 14 pruebas y una de 28 s.
- **Residencia: UE.** `eu` es la única ubicación de la UE que sirve la familia 3.5; en las regionales (`europe-west1`,
  `-west3`, `-west4`, `-west8`, `-west9`, `-southwest1`, `-north1`, `-central2`) da 404. El audio es la voz del dueño y
  lo que cuenta de las casas de sus clientes, y el P1 promete IA en la UE: la demo usa lo mismo que se venderá, para
  que el tiempo del vídeo sea el del producto. `PRESUPUESTO_VERTEX_UBICACION=global` lo cambiaría, pero eso es una
  decisión de privacidad del fundador, no de rendimiento.
- **Credenciales:** ADC con `google-auth-library` (cuenta de servicio de Cloud Run con `roles/aiplatform.user`), por
  REST. No se usa el CLI de gcloud.
- Descartado: Claude en Vertex (cuota 0 en `eu`, según Guardesa) y la familia 2.5 (se retira el 20-10-2026).

### 4. PDF: pdf-lib con fuentes estándar

Generado en el servidor, sin binarios ni ficheros de fuentes: cabe en la imagen y no rompe con el empaquetado de Next.
Descartados `@react-pdf/renderer` (más pesado, WebAssembly), `pdfkit` (lee las fuentes del disco: frágil con el
empaquetado) y Chromium sin cabeza (pesado en Cloud Run). Es el presupuesto de la empresa (su nombre arriba), con
«BORRADOR · DATOS DE EJEMPLO» y la marca T800 Labs discreta en el pie.

### 5. Acceso y gasto

- **Código de la demo** (`PRESUPUESTO_DEMO_CODIGO`, en Secret Manager): abre la web (`#c=<código>` una vez en el
  móvil) y da de alta un chat de Telegram (`t.me/<bot>?start=<código>`). Sin código, la web pide el código y el bot
  contesta «demo privada».
- **Cupos diarios** en Cloud SQL: 60 borradores al día en total y 30 por chat o web (hora de Madrid). Se cuentan
  **antes** de llamar a la IA y, si la base de datos no contesta, no se genera nada.
- **Bordes:** audio de hasta 5 MB y 180 s; el formato se mira por los primeros bytes (OGG, WebM, MP4/M4A, MP3, WAV,
  FLAC, AAC), no por lo que diga el cliente; texto de 12 a 2.000 caracteres; solo chats privados; el webhook se
  firma con `PRESUPUESTO_TELEGRAM_WEBHOOK_SECRET`; cada actualización de Telegram se atiende una sola vez.
- **Coste:** cada petición, unos 0,45 céntimos de dólar (unos 7.000 tokens de entrada y 850 de salida a 0,33 y 2,75 $
  por millón); las que se cancelan cuestan su entrada (~0,23). Con dos o tres en paralelo, **0,7-1 céntimo de dólar
  por borrador**. Con el cupo de 60 al día, el tope es de unos 0,60 $ diarios.

### 6. Secretos leídos en tiempo de ejecución

`src/lib/secretos.ts` lee Secret Manager con ADC y una caché de 5 minutos, en vez de `--set-secrets` en el despliegue:
el token del bot todavía no existe y un secreto que falta haría fallar el despliegue entero. Crear o rotar un secreto
basta; en 5 minutos está activo. Nombres:

| Secreto | Qué es | Quién lo crea |
|---|---|---|
| `PRESUPUESTO_TELEGRAM_BOT_TOKEN` | Token de @BotFather | El orquestador, al crear el bot |
| `PRESUPUESTO_TELEGRAM_WEBHOOK_SECRET` | Firma del webhook | Creado (aleatorio) |
| `PRESUPUESTO_DEMO_CODIGO` | Código de la demo | Creado (aleatorio) |

Con el token creado, `node scripts/presupuesto-telegram-webhook.mjs` registra el webhook y saca el enlace de alta.

### 7. Medición

Cada borrador queda en `presupuesto_registro` (canal, ms totales, de IA y de PDF, tokens, coste, partidas y pendientes;
sin audio ni transcripción). La web enseña el tiempo medido en el navegador, desde que se envía el audio hasta que llega
el PDF. La cifra del vídeo sale de ahí.

## Consecuencias

- La demo funciona sin WhatsApp; el día que haya número, se añade un adaptador.
- El tiempo depende de la cola de Vertex `eu`: hay que medirlo el día de la grabación y decir ese.
- Quedan para el P1 real: tarifa por cliente (cargada desde su Excel), su logo y plantilla, hoja de registro, varias
  personas por empresa, WhatsApp, aviso de IA (art. 50 del Reglamento de IA) y contrato de encargado del tratamiento.
