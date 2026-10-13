# Tarifa de ejemplo 2026: fuentes y método

## Qué es

`src/lib/presupuestos/datos/tarifa-ejemplo.json` es la tarifa de una empresa de reformas **ficticia**:
una pequeña empresa de 2 a 5 operarios en una ciudad media como Zaragoza. El prototipo de
«presupuesto por audio» la usa y el PDF la marca como **«Datos de ejemplo»**. No es la tarifa de
ninguna empresa real. Tiene 71 partidas en 11 capítulos y los precios son **de venta al cliente
final, sin IVA**: el IVA (10 % o 21 %, según el caso) lo añade el presupuesto, no la tarifa.

Investigado el 13-10-2026 por market-researcher.

## Método

- 27 búsquedas y 16 páginas leídas enteras. Fuentes de siete tipos:
  base técnica de precios (CYPE), portales de presupuestos (Habitissimo, Cronoshare,
  cuantomecuesta, Presupix, Presunow), tarifas publicadas por empresas (1reformas, Reformas SYR de
  Zaragoza, Mudanzas Horizonte, reformai), tiendas (Leroy Merlin, Obramat), estadística oficial
  (INE), una comercializadora eléctrica (Endesa) y prensa (Qué!).
- Cada partida del baño de la demo tiene al menos dos fuentes independientes. En el resto se tomó
  un rango coherente entre portales y tarifas de empresa.
- Se tomó el **valor medio del rango de mercado**, ni el más barato ni el más caro. Si una fuente
  daba solo la mano de obra, se le sumó el material de gama media de tienda (sin IVA) y un margen
  razonable sobre ese material.

## Partidas del baño de la demo

Frase de la demo: «Baño de cinco metros: quitar la bañera, plato de ducha de 120, alicatar hasta el
techo y cambiar el lavabo».

| Partida (código) | Tarifa | Rango de mercado sin IVA | Fuentes (ver lista) |
|---|---|---|---|
| Desmontaje de bañera (DEM-01) | 95 €/ud | 40-120 € | Cronoshare Zaragoza 40-120 € [8]; 1reformas 85 €, solo mano de obra, Barcelona [16]; ejemplo de Cronoshare 90 € [10] |
| Picado de alicatado (DEM-02) | 13 €/m² | 8-18 €/m² | CYPE DRA010: 10,95 € de coste directo [2]; Presupix 8-18 € [13]; 1reformas 14 € [16]; Cronoshare Zaragoza 5-10 € [8] |
| Levantado de solado (DEM-03) | 16 €/m² | 10-25 €/m² | CYPE DRS020: 14,73 € de coste directo [3]; motordepresupuestos 10-25 € [28]; 1reformas 14 € [16] |
| Plato de resina extraplano de 101 a 140 cm (SAN-02) | 365 €/ud | 280-600 € instalado | Leroy Merlin Dylan 120x70 a 98,99 € con IVA (gama básica) [19]; Habitissimo: plato de 70x120 unos 180 €, extrafino instalado unos 600 € [5]; Cronoshare Zaragoza 120-300 € el plato [8]; 1reformas 95 € de instalación [16]; CYPE SAD025 504,57 € (80x80, precio de catálogo de fabricante) [1] |
| Alicatado gama media, suministro y colocación (ALI-01) | 42 €/m² | 30-50 €/m² | Presupix 23-42 € más 7 € de adhesivo y rejuntado [13]; cuantomecuesta 42 € [12]; Cronoshare 20-50 € [10] |
| Alicatado, solo mano de obra (ALI-02) | 25 €/m² | 18-35 €/m² | 1reformas 22 € más 4 € de rejuntado [16]; Habitissimo 25 € [5]; cuantomecuesta 25-40 € [12]; Presunow 18-35 € [14] |
| Solado de baño (ALI-03) | 44 €/m² | 28-60 €/m² | Habitissimo, porcelánico 28-60 € (media 45 €) [7]; Cronoshare, calidad media 25-45 € [11] |
| Desmontaje de lavabo (DEM-04) | 35 €/ud | 29-45 € | CYPE DSM010: 28,82 € de coste directo [4]; 1reformas 35 € [16] |
| Mueble de lavabo de 80 cm (SAN-05) | 365 €/ud | 250-450 € | Leroy Merlin, muebles de 80 cm a 171-269 € con IVA y montaje a 99-180 € [19]; 1reformas, montaje 75 € [16]; Cronoshare Zaragoza, lavabo con grifería 200-350 € [9] |
| Adaptación de fontanería para el plato (FON-01) | 260 €/ud | 150-400 € | Cronoshare 150-400 € y ejemplo de 320 € [10]; cuantomecuesta, cambio de grifo y desagüe 375 € [12] |
| Conjunto termostático de ducha (SAN-10) | 245 €/ud | 150-360 € | Cronoshare Zaragoza 120-300 € de material [8]; Cronoshare 90-200 € [10]; Leroy Merlin, columna a 120,99 € con IVA [19] |
| Grifo de lavabo (SAN-09) | 110 €/ud | 80-160 € | Cronoshare Zaragoza 50-120 € de material [8]; 1reformas, instalación 40 € [16] |

**Comprobación de coherencia.** Un baño de 5 m² con unos 20 m² de pared alicatada sale por unos
2.220 € sin IVA y sin mampara (95 + 260 + 840 + 365 + 260 + 35 + 365). Encaja con lo que publica el
mercado de 2026: Reformas SYR (Zaragoza) da 1.500-3.500 € por cambiar la bañera por un plato [17];
Qué! publica unos 1.900 € con mampara básica y sin alicatado completo [25]; Habitissimo da en
Zaragoza 700-1.200 € para el cambio básico sin alicatar [5].

## Resto de capítulos (fuentes principales)

- **Cocina**: montaje a 80 €/ml (Habitissimo 60-90 €/ml [6], Cronoshare 60-70 €/ml [11], Mudanzas
  Horizonte 90-150 €/ml [18]); desmontaje de la cocina a 230 € (1reformas 200 €, solo mano de obra
  [16]; Mudanzas Horizonte 150-350 € [18]); encimera de cuarzo a 330 €/ml (Habitissimo, desde
  200 €/ml; Cronoshare 200-450 €/ml [11]); encimera laminada a 110 €/ml (Habitissimo, unos 160 €/ml;
  colocación de Leroy Merlin desde 150 € hasta 3,6 m [7]).
- **Electricidad**: punto de luz y enchufe a 52-55 € (1reformas 35-75 €/punto [16]; reformai
  40-80 €/punto [15]); cuadro a 550 € (Realadvisor 300-800 €, de oct-2025 y actualizado [22]); CIE a
  140 € (Endesa: media de 100-150 €, rango de 70-300 € [21]); hora a 38 € (reformai 30-45 € [15]).
- **Fontanería**: hora a 38 € (reformai 30-45 € [15]; Trustlocal 35-40 € [26]); termo de 80 l a
  420 € (aparato de 117-359 € con IVA en Leroy Merlin y Obramat [19][20], más 174-250 € de
  instalación según Cronoshare [11]); desatasco a 105 € (Habitissimo 70-150 € [7]).
- **Suelos y carpintería**: laminado AC4 a 30 €/m² (Habitissimo, AC5 a 30-35 € [7]); porcelánico a
  48 €/m² [7][11]; rodapié a 11 €/ml (Habitissimo: material a 3-5 € y colocación a 4,70-8,50 € [7]);
  puerta en block a 245 € (Obramat, 80-99 € con IVA la hoja en block [20]; Cronoshare, unos 220 €
  por puerta instalada [11]).
- **Pintura**: plástica a 9 €/m² (1reformas 9 € [16]; reformai 8-15 € [15]); gotelé a 15 €/m²
  (Cronoshare 8-15 € o más; Habitissimo 15-25 € [7][11]); esmaltado de puerta a 95 € (Habitissimo
  70-120 € [7]).
- **Residuos**: contenedor de 5 m³ a 230 € (GoodCollect Zaragoza, de 175 a 245 € sin IVA por 3 m³
  [23]; Habitissimo, unos 250 € por 5 m³ [7]); limpieza final a 180 € (Cronoshare 200-400 € por un
  piso [11]).
- **Horas de albañilería**: oficial a 30 €/h y peón a 20 €/h (reformai 25-35 € y 15-20 € [15];
  motordepresupuestos 25-38 € y 15-22 € [28]).

## Supuestos

- **Actualización de precios**: casi todas las fuentes son de 2026 y se usan tal cual. Las de 2025
  (Realadvisor de oct-2025, Trustlocal de abr-2025 y GoodCollect) se suben un **4 %**, alineado con el
  IPC general del INE: 4,3 % en agosto de 2026 y 4,9 % en el dato adelantado de septiembre [24]. No
  se encontró en abierto el índice específico de reparación de la vivienda **(a confirmar)**.
- **Gama media**: azulejo hasta 15 €/m² y baldosa hasta 18 €/m² de PVP; sanitarios, grifería y
  plato de marca media, no de marca blanca ni de diseño.
- **CYPE da costes directos**, sin gastos generales ni beneficio industrial. Para compararlos con un
  precio de venta se multiplican por 1,19 aproximadamente: 13 % de gastos generales y 6 % de
  beneficio industrial, los mínimos del art. 131 del RD 1098/2001. Además, el material de CYPE es
  de catálogo de fabricante, más caro que el de un distribuidor.
- **Zaragoza**: reformai aplica a Zaragoza un multiplicador de x0,95 a x1,05 sobre la media
  nacional [15], y Habitissimo la sitúa en la franja baja de precios [5]. Por eso se usaron valores
  medios nacionales, sin la prima de Madrid o Barcelona. Las cifras de 1reformas (Barcelona) sirven
  de techo.
- **IVA en las fuentes**: los precios de tienda se dividieron entre 1,21. Algunos portales no dicen
  si sus rangos llevan IVA, así que se usaron como orientación y no como precio exacto.
- **Estimaciones con una sola fuente o sin fuente directa**, coherentes con el resto pero sin
  triangular: instalación eléctrica de cocina (820 €), ayudas de albañilería (180 €), desplazamiento
  (30 €), protecciones (60 €), tramitación de licencia (150 €; 1reformas cobra 150 € en Barcelona
  [16]), cantoneras (9 €/ml) y hueco en encimera de cuarzo (55 €; 1reformas, 45 € [16]).

## Por qué no hay mampara ni radiador toallero

Faltan **a propósito**. En la demo esas peticiones deben salir como **«precio pendiente»**: la
mampara a medida la presupuesta el cristalero después de medir, y el radiador toallero depende de
la instalación (de agua o eléctrico). Para que el emparejador no confunda esas peticiones con otra
partida, las palabras «mampara», «toallero» y «radiador» no aparecen en ningún campo del JSON, ni
siquiera en `incluye`. Como orientación, Cronoshare Zaragoza da para la mampara de 150 a 1.200 €
según el tipo y para el radiador toallero de 120 a 180 € [8][9].

## A confirmar

- Los precios de CYPE DRA010 y DSM010 y los de Leroy Merlin salen de resultados del buscador; no se
  abrió la ficha. La oferta del termo ElProm terminó el 13-09.
- Para el termo, Habitissimo da 650 € (sin fecha), muy por encima de lo que suman el aparato de
  tienda y la instalación. Se tomó el valor medio, 420 €.

## Fuentes (consultadas el 13-10-2026)

1. CYPE, SAD025 «Plato de ducha de resina» (rehabilitación), sin fecha: https://generadordeprecios.info/rehabilitacion/Senalizacion_y_equipamiento/Aparatos_sanitarios/Duchas/Plato_de_ducha_de_resina.html
2. CYPE, DRA010 «Demolición de alicatado»: https://generadordeprecios.info/rehabilitacion/Demoliciones/Revestimientos_y_trasdosados/Alicatados/Demolicion_de_alicatado.html
3. CYPE, DRS020 «Demolición de pavimento cerámico»: https://generadordeprecios.info/rehabilitacion/Demoliciones/Revestimientos_y_trasdosados/Suelos_y_pavimentos/Demolicion_de_pavimento_ceramico.html
4. CYPE, DSM010 «Desmontaje de aparato sanitario»: https://generadordeprecios.info/rehabilitacion/Demoliciones/Equipamiento/Banos/Desmontaje_de_aparato_sanitario.html
5. Habitissimo, cambiar bañera por ducha (actualizada el 04-06-2026): https://www.habitissimo.es/presupuestos/cambiar-banera-por-ducha
6. Habitissimo, montar muebles de cocina (actualizada el 04-06-2026): https://www.habitissimo.es/presupuestos/montar-muebles-cocina
7. Habitissimo, guías sin fecha visible: https://www.habitissimo.es/presupuestos/suelo-porcelanico · /poner-tarima-flotante · /rodapie · /alisar-paredes · /lacar-puertas · /pintar-puertas · /reparar-atasco · /poner-contenedor-obra · /encimeras
8. Cronoshare, cambiar bañera por ducha en Zaragoza (10-01-2026): https://www.cronoshare.com/cuanto-cuesta/cambiar-banera-plato-ducha/zaragoza
9. Cronoshare, reformar baño en Zaragoza (20-05-2026): https://www.cronoshare.com/cuanto-cuesta/reformar-bano/zaragoza
10. Cronoshare, cambiar bañera por plato de ducha (02-01-2026): https://www.cronoshare.com/blog/?p=7956
11. Cronoshare, guías de 2026: https://www.cronoshare.com/cuanto-cuesta/montar-cocina · https://www.cronoshare.com/blog/?p=9037 (gotelé) · https://www.cronoshare.com/cuanto-cuesta/cambiar-puertas-interior-casa · https://www.cronoshare.com/cuanto-cuesta/servicio-limpieza-fin-obra · https://www.cronoshare.com/cuanto-cuesta/alicatar-bano
12. cuantomecuesta, reforma de baño (abril de 2026): https://cuantomecuesta.com/es/reforma-bano/
13. Presupix, presupuesto de alicatado (01-07-2026): https://presupix.com/blog/presupuesto-alicatado-azulejos
14. Presunow, cuánto cobra un albañil (14-04-2026): https://presunow.com/es/blog/cuanto-cobra-albanil
15. reformai, precios de mano de obra 2026 (26-03-2026): https://reformai.app/articulos/precios/precios-mano-de-obra-reforma-2026
16. 1reformas (Barcelona, sin IVA, sin fecha): https://1reformas.com/reformas-banos/precios-mano-de-obra/ · https://1reformas.com/reformas-cocinas/precios-mano-de-obra/
17. Reformas SYR, Zaragoza (2026; la de reforma integral, actualizada en agosto de 2026): https://www.reformassyr.es/cuanto-cuesta-reformar-bano-zaragoza-2026/ · https://www.reformassyr.es/cuanto-cuesta-una-reforma-integral-en-zaragoza-en-2026-precios-por-m%C2%B2-partidas-licencias-y-presupuesto-completo/
18. Mudanzas Horizonte, montar cocina 2026: https://www.mudanzashorizon.com/blog/montaje/cuanto-cuesta-montar-cocina-precio-metro-lineal/
19. Leroy Merlin, fichas: https://www.leroymerlin.es/productos/plato-de-ducha-dylan-120x70-cm-blanco-91527687.html · https://www.leroymerlin.es/productos/mueble-de-bano-con-lavabo-bora-blanco-mate-80x45-cm-83513840.html · https://www.leroymerlin.es/productos/mueble-de-bano-con-lavabo-espacio-olmo-80x45-cm-93569347.html · https://www.leroymerlin.es/productos/termo-electrico-elprom-de-80-litros-vertical-en-color-blanco-96465066.html
20. Obramat: https://www.obramat.es/productos/puerta-interior-en-block-lisa-lacada-blanca-ciega-60-5cm-izquierda-25023440.html · https://www.obramat.es/fontaneria/termos/termos-electricos/termo-electrico-80-litros-p.html
21. Endesa, boletín eléctrico (CIE): https://www.endesa.com/es/blog/blog-de-endesa/luz/boletin-electrico-cie
22. Realadvisor, precio de instalación eléctrica (oct-2025): https://realadvisor.es/es/blog/pecio-instalacion-electrica-vivienda
23. GoodCollect, contenedores en Zaragoza: https://goodcollect.es/soluciones/alquiler-de-contenedores/alquiler-contenedores-residuos-aragon/zaragoza-50 · contenedoresescombros.com: https://contenedoresescombros.com/zaragoza/
24. INE, IPC de agosto de 2026 (15-09-2026): https://www.ine.es/dyngs/Prensa/IPC0826.htm · IPC adelantado de septiembre (29-09-2026): https://ine.es/dyngs/Prensa/adIPC0926.htm
25. Qué!, «El precio de reformar un baño se dispara» (04-09-2026): https://www.que.es/2026/09/04/precio-reforma-bano-ducha/
26. Trustlocal, fontanero (18-02-2026) y pintor (17-04-2025): https://trustlocal.es/coste/fontanero-coste/ · https://trustlocal.es/coste/pintor-coste/
27. Reiteman, precio del pladur por m² (2026): https://www.reiteman.com/precio-del-pladur-por-m2/
28. motordepresupuestos, demoliciones (2026): https://motordepresupuestos.com/cuanto-cobra/demoliciones
