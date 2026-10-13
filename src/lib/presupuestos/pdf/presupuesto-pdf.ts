/**
 * PDF del BORRADOR de presupuesto, generado en el servidor con pdf-lib.
 *
 * Es el presupuesto de la empresa (su nombre arriba), con «Borrador · Datos de
 * ejemplo» visible y la marca T800 Labs discreta en el pie. A4 vertical; si las
 * partidas no caben, sigue en otra página con la cabecera de la tabla repetida.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { ETIQUETA_UNIDAD } from "../dominio/tarifa";
import {
  TEXTO_MOTIVO,
  formatearCantidad,
  formatearEuros,
  formatearFecha,
  type LineaPresupuesto,
  type Presupuesto,
} from "../dominio/presupuesto";
import { limpiar, partir, recortar } from "./texto-pdf";

const A4 = { ancho: 595.28, alto: 841.89 };
const M = { izq: 46, der: 46, arriba: 46, abajo: 64 };
const ANCHO_UTIL = A4.ancho - M.izq - M.der;

const C = {
  texto: rgb(0.11, 0.11, 0.12),
  gris: rgb(0.42, 0.42, 0.45),
  grisClaro: rgb(0.6, 0.6, 0.63),
  linea: rgb(0.85, 0.85, 0.87),
  fondo: rgb(0.965, 0.965, 0.97),
  rojo: rgb(0.898, 0.035, 0.078), // #e50914, el rojo de T800 Labs
  ambar: rgb(0.71, 0.33, 0.04), // #b45309: «pendiente»
  blanco: rgb(1, 1, 1),
};

/** Columnas de la tabla (x de inicio; las numéricas se alinean a la derecha de su fin). */
const COL = {
  num: { x: M.izq + 6, fin: M.izq + 22 },
  desc: { x: M.izq + 30, ancho: 252 },
  cant: { fin: M.izq + 340 },
  ud: { x: M.izq + 348 },
  precio: { fin: M.izq + 432 },
  importe: { fin: A4.ancho - M.der - 6 },
};

interface Fuentes {
  normal: PDFFont;
  negrita: PDFFont;
  cursiva: PDFFont;
}

class Lienzo {
  pagina!: PDFPage;
  y = 0;
  paginas: PDFPage[] = [];

  constructor(
    private readonly doc: PDFDocument,
    readonly f: Fuentes,
  ) {
    this.nuevaPagina();
  }

  nuevaPagina(): void {
    this.pagina = this.doc.addPage([A4.ancho, A4.alto]);
    this.paginas.push(this.pagina);
    this.y = A4.alto - M.arriba;
  }

  /** Salta de página si no caben `alto` puntos. Devuelve `true` si ha saltado. */
  asegurar(alto: number): boolean {
    if (this.y - alto >= M.abajo) return false;
    this.nuevaPagina();
    return true;
  }

  texto(t: string, x: number, y: number, fuente: PDFFont, tamano: number, color: RGB = C.texto): void {
    const limpio = limpiar(t, fuente);
    if (limpio) this.pagina.drawText(limpio, { x, y, font: fuente, size: tamano, color });
  }

  textoDerecha(t: string, fin: number, y: number, fuente: PDFFont, tamano: number, color: RGB = C.texto): void {
    const limpio = limpiar(t, fuente);
    this.texto(limpio, fin - fuente.widthOfTextAtSize(limpio, tamano), y, fuente, tamano, color);
  }

  linea(y: number, color: RGB = C.linea, grosor = 0.6, x1 = M.izq, x2 = A4.ancho - M.der): void {
    this.pagina.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: grosor, color });
  }

  rect(x: number, y: number, ancho: number, alto: number, relleno?: RGB, borde?: RGB): void {
    this.pagina.drawRectangle({
      x,
      y,
      width: ancho,
      height: alto,
      ...(relleno ? { color: relleno } : {}),
      ...(borde ? { borderColor: borde, borderWidth: 0.9 } : {}),
    });
  }

  /** Párrafo partido en líneas; avanza `y`. */
  parrafo(t: string, x: number, ancho: number, fuente: PDFFont, tamano: number, color: RGB = C.texto, interlineado = 1.35): void {
    for (const l of partir(t, fuente, tamano, ancho)) {
      this.asegurar(tamano * interlineado);
      this.texto(l, x, this.y - tamano, fuente, tamano, color);
      this.y -= tamano * interlineado;
    }
  }
}

function cabecera(l: Lienzo, p: Presupuesto): void {
  const { f } = l;
  const derecha = A4.ancho - M.der;

  // Sello de borrador, arriba a la derecha.
  const sello = p.empresa.datosDeEjemplo ? "BORRADOR · DATOS DE EJEMPLO" : "BORRADOR";
  const anchoSello = f.negrita.widthOfTextAtSize(sello, 8) + 16;
  l.rect(derecha - anchoSello, l.y - 18, anchoSello, 18, undefined, C.rojo);
  l.texto(sello, derecha - anchoSello + 8, l.y - 12.4, f.negrita, 8, C.rojo);

  // Empresa.
  l.texto(recortar(p.empresa.nombre, f.negrita, 19, ANCHO_UTIL - anchoSello - 16), M.izq, l.y - 17, f.negrita, 19);
  if (p.empresa.subtitulo) l.texto(p.empresa.subtitulo, M.izq, l.y - 31, f.normal, 8.5, C.gris);
  l.y -= 52;
  l.linea(l.y, C.texto, 1.2);
  l.y -= 22;

  // Obra y datos del documento.
  const xMeta = derecha - 150;
  l.texto("PRESUPUESTO · BORRADOR", M.izq, l.y, f.negrita, 7.5, C.gris);
  const meta: Array<[string, string]> = [
    ["Número", p.numero],
    ["Fecha", formatearFecha(p.fecha)],
    ["Validez", `${p.empresa.validezDias} días`],
  ];
  meta.forEach(([k, v], i) => {
    l.texto(k, xMeta, l.y - i * 13, f.normal, 8.5, C.gris);
    l.textoDerecha(v, derecha, l.y - i * 13, f.negrita, 8.5);
  });
  const lineasTitulo = partir(p.titulo, f.negrita, 15, xMeta - M.izq - 16).slice(0, 2);
  lineasTitulo.forEach((t, i) => l.texto(t, M.izq, l.y - 19 - i * 18, f.negrita, 15));
  let y = l.y - 19 - (lineasTitulo.length - 1) * 18 - 18;
  const datos: Array<[string, string | null]> = [
    ["Cliente", p.cliente],
    ["Dirección de la obra", p.ubicacion],
  ];
  for (const [k, v] of datos) {
    l.texto(`${k}:`, M.izq, y, f.normal, 8.5, C.gris);
    const xv = M.izq + f.normal.widthOfTextAtSize(`${k}: `, 8.5);
    l.texto(v ?? "pendiente", xv, y, v ? f.normal : f.cursiva, 8.5, v ? C.texto : C.grisClaro);
    y -= 12;
  }
  l.y = Math.min(y, l.y - meta.length * 13) - 14;
}

function cabeceraTabla(l: Lienzo): void {
  const { f } = l;
  l.rect(M.izq, l.y - 18, ANCHO_UTIL, 18, C.texto);
  const yT = l.y - 12;
  l.texto("Nº", COL.num.x, yT, f.negrita, 7.5, C.blanco);
  l.texto("DESCRIPCIÓN", COL.desc.x, yT, f.negrita, 7.5, C.blanco);
  l.textoDerecha("CANT.", COL.cant.fin, yT, f.negrita, 7.5, C.blanco);
  l.texto("UD.", COL.ud.x, yT, f.negrita, 7.5, C.blanco);
  l.textoDerecha("PRECIO", COL.precio.fin, yT, f.negrita, 7.5, C.blanco);
  l.textoDerecha("IMPORTE", COL.importe.fin, yT, f.negrita, 7.5, C.blanco);
  l.y -= 18;
}

/** Líneas secundarias de una partida: código, medición estimada y motivo de pendiente. */
function notasDeLinea(linea: LineaPresupuesto): Array<{ texto: string; color: RGB; cursiva: boolean }> {
  const notas: Array<{ texto: string; color: RGB; cursiva: boolean }> = [];
  if (linea.pendiente) {
    notas.push({ texto: `Precio pendiente: ${TEXTO_MOTIVO[linea.pendiente].toLowerCase()}.`, color: C.ambar, cursiva: false });
  }
  if (linea.medicion === "estimada") {
    notas.push({ texto: `Medición estimada${linea.notaMedicion ? `: ${linea.notaMedicion}` : ""}`, color: C.gris, cursiva: true });
  }
  if (linea.codigo) {
    notas.push({ texto: `Ref. ${linea.codigo} · Dicho: «${linea.dicho}»`, color: C.grisClaro, cursiva: false });
  }
  return notas;
}

function filaPartida(l: Lienzo, linea: LineaPresupuesto, sombreada: boolean): void {
  const { f } = l;
  const desc = partir(linea.descripcion, f.negrita, 9, COL.desc.ancho);
  const notas = notasDeLinea(linea).map((n) => ({ ...n, lineas: partir(n.texto, n.cursiva ? f.cursiva : f.normal, 7.5, COL.desc.ancho) }));
  const alto = 10 + desc.length * 12 + notas.reduce((s, n) => s + n.lineas.length * 10, 0);

  if (l.asegurar(alto)) cabeceraTabla(l);
  if (sombreada) l.rect(M.izq, l.y - alto, ANCHO_UTIL, alto, C.fondo);

  const yPrimera = l.y - 15;
  l.texto(String(linea.numero), COL.num.x, yPrimera, f.normal, 9, C.gris);
  desc.forEach((t, i) => l.texto(t, COL.desc.x, yPrimera - i * 12, f.negrita, 9));
  let y = yPrimera - desc.length * 12 + 1;
  for (const n of notas) {
    for (const t of n.lineas) {
      l.texto(t, COL.desc.x, y, n.cursiva ? f.cursiva : f.normal, 7.5, n.color);
      y -= 10;
    }
  }

  const cantidad = linea.cantidad === null ? "—" : `${formatearCantidad(linea.cantidad)}${linea.medicion === "estimada" ? "*" : ""}`;
  l.textoDerecha(cantidad, COL.cant.fin, yPrimera, f.normal, 9);
  l.texto(ETIQUETA_UNIDAD[linea.unidad], COL.ud.x, yPrimera, f.normal, 9, C.gris);
  if (linea.precioUnitarioCent !== null && linea.pendiente !== "unidad-distinta") {
    l.textoDerecha(formatearEuros(linea.precioUnitarioCent), COL.precio.fin, yPrimera, f.normal, 9);
  } else {
    l.textoDerecha("pendiente", COL.precio.fin, yPrimera, f.negrita, 9, C.ambar);
  }
  if (linea.importeCent !== null) {
    l.textoDerecha(formatearEuros(linea.importeCent), COL.importe.fin, yPrimera, f.negrita, 9);
  } else {
    l.textoDerecha("—", COL.importe.fin, yPrimera, f.normal, 9, C.ambar);
  }

  l.y -= alto;
  l.linea(l.y);
}

function totales(l: Lienzo, p: Presupuesto): void {
  const { f } = l;
  const x = A4.ancho - M.der - 210;
  const fin = COL.importe.fin;
  const filas: Array<[string, string, boolean]> = [
    ["Base imponible", formatearEuros(p.baseImponibleCent), false],
    [`IVA (${String(p.ivaPorcentaje).replace(".", ",")} %)`, formatearEuros(p.cuotaIvaCent), false],
    ["TOTAL", formatearEuros(p.totalCent), true],
  ];
  l.asegurar(filas.length * 17 + 34);
  l.y -= 8;
  for (const [k, v, fuerte] of filas) {
    if (fuerte) {
      l.rect(x, l.y - 20, fin - x + 6, 20, C.texto);
      l.texto(k, x + 8, l.y - 14, f.negrita, 10, C.blanco);
      l.textoDerecha(v, fin, l.y - 14, f.negrita, 11, C.blanco);
      l.y -= 20;
    } else {
      l.texto(k, x + 8, l.y - 12, f.normal, 9, C.gris);
      l.textoDerecha(v, fin, l.y - 12, f.normal, 9);
      l.y -= 17;
    }
  }
  if (p.lineasPendientes > 0) {
    const t =
      p.lineasPendientes === 1
        ? "1 partida con precio pendiente: no está sumada en el total."
        : `${p.lineasPendientes} partidas con precio pendiente: no están sumadas en el total.`;
    l.y -= 4;
    l.textoDerecha(t, fin, l.y - 9, f.negrita, 8, C.ambar);
    l.y -= 14;
  }
  l.y -= 12;
}

function seccion(l: Lienzo, titulo: string): void {
  l.asegurar(40);
  l.y -= 6;
  l.texto(titulo.toUpperCase(), M.izq, l.y - 8, l.f.negrita, 7.5, C.gris);
  l.y -= 14;
}

function vinetas(l: Lienzo, items: string[], tamano = 8.5, color: RGB = C.texto): void {
  for (const it of items) {
    const lineas = partir(it, l.f.normal, tamano, ANCHO_UTIL - 12);
    lineas.forEach((t, i) => {
      l.asegurar(tamano * 1.4);
      if (i === 0) l.texto("•", M.izq + 2, l.y - tamano, l.f.normal, tamano, C.rojo);
      l.texto(t, M.izq + 12, l.y - tamano, l.f.normal, tamano, color);
      l.y -= tamano * 1.4;
    });
    l.y -= 2;
  }
}

function cuerpoFinal(l: Lienzo, p: Presupuesto): void {
  if (p.sugerencias.length) {
    seccion(l, "Suele ir con este trabajo · no incluido en el total");
    vinetas(
      l,
      p.sugerencias.map((s) => {
        const precio =
          s.precioUnitarioCent !== null && s.unidad
            ? `${formatearEuros(s.precioUnitarioCent)}/${ETIQUETA_UNIDAD[s.unidad]}`
            : "precio pendiente";
        return `${s.descripcion} (${precio}). ${s.motivo}`;
      }),
    );
  }
  if (p.avisos.length) {
    seccion(l, "Revisa antes de enviarlo");
    vinetas(l, p.avisos);
  }
  if (p.transcripcion) {
    seccion(l, "Lo que dijiste en el audio");
    l.y -= 2;
    l.parrafo(`«${p.transcripcion}»`, M.izq + 2, ANCHO_UTIL - 4, l.f.cursiva, 8.5, C.gris);
    l.y -= 4;
  }
  if (p.empresa.condiciones.length) {
    seccion(l, "Condiciones");
    vinetas(l, p.empresa.condiciones, 7.5, C.gris);
  }
}

function pies(l: Lienzo): void {
  const { f } = l;
  const total = l.paginas.length;
  l.paginas.forEach((pagina, i) => {
    const y = 34;
    pagina.drawLine({ start: { x: M.izq, y: y + 12 }, end: { x: A4.ancho - M.der, y: y + 12 }, thickness: 0.6, color: C.linea });
    const aviso = "Borrador preparado a partir de un audio. Revísalo antes de enviarlo: no se envía solo al cliente.";
    pagina.drawText(limpiar(aviso, f.normal), { x: M.izq, y, size: 7, font: f.normal, color: C.gris });
    const pag = `Página ${i + 1} de ${total}`;
    pagina.drawText(pag, { x: A4.ancho - M.der - f.normal.widthOfTextAtSize(pag, 7), y, size: 7, font: f.normal, color: C.gris });
    pagina.drawRectangle({ x: M.izq, y: y - 13, width: 4, height: 4, color: C.rojo });
    pagina.drawText("T800 Labs · t800labs.com", { x: M.izq + 8, y: y - 13, size: 6.5, font: f.normal, color: C.grisClaro });
  });
}

export async function renderizarPresupuestoPdf(p: Presupuesto): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const f: Fuentes = {
    normal: await doc.embedFont(StandardFonts.Helvetica),
    negrita: await doc.embedFont(StandardFonts.HelveticaBold),
    cursiva: await doc.embedFont(StandardFonts.HelveticaOblique),
  };
  const titulo = limpiar(`Presupuesto ${p.numero} · ${p.titulo}`, f.normal);
  doc.setTitle(titulo);
  doc.setAuthor(limpiar(p.empresa.nombre, f.normal));
  doc.setSubject(p.empresa.datosDeEjemplo ? "Borrador · Datos de ejemplo" : "Borrador");
  doc.setCreator("T800 Labs");
  doc.setProducer("T800 Labs");
  doc.setLanguage("es-ES");
  doc.setCreationDate(p.fecha);
  doc.setModificationDate(p.fecha);

  const l = new Lienzo(doc, f);
  cabecera(l, p);
  cabeceraTabla(l);
  p.lineas.forEach((linea, i) => filaPartida(l, linea, i % 2 === 1));
  totales(l, p);
  cuerpoFinal(l, p);
  pies(l);

  return doc.save();
}

/** Nombre de archivo seguro: «presupuesto-B-261017-7K3Q.pdf». */
export function nombreDeArchivo(p: Presupuesto): string {
  return `presupuesto-${p.numero.replace(/[^A-Za-z0-9-]/g, "")}.pdf`;
}
