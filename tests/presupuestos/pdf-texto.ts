/**
 * Extrae el texto pintado en un PDF de pdf-lib (fuentes estándar): descomprime
 * los flujos de contenido y decodifica las cadenas hexadecimales de `Tj` en
 * WinAnsi. Suficiente para comprobar qué dice el PDF sin un lector externo.
 */
import { inflateSync } from "node:zlib";
import { PDFDocument, PDFRawStream, PDFName } from "pdf-lib";

const WIN_ANSI_ALTOS: Record<number, string> = {
  0x80: "€", 0x85: "…", 0x91: "‘", 0x92: "’", 0x93: "“", 0x94: "”", 0x95: "•", 0x96: "–", 0x97: "—",
};

function decodificar(hex: string): string {
  let out = "";
  for (let i = 0; i < hex.length; i += 2) {
    const b = parseInt(hex.slice(i, i + 2), 16);
    out += WIN_ANSI_ALTOS[b] ?? String.fromCharCode(b);
  }
  return out;
}

export async function textoDelPdf(bytes: Uint8Array): Promise<{ paginas: number; texto: string }> {
  const doc = await PDFDocument.load(bytes);
  const trozos: string[] = [];
  for (const [, obj] of doc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    const filtro = obj.dict.get(PDFName.of("Filter"));
    let contenido: string;
    try {
      const datos = obj.getContents();
      contenido = (filtro?.toString() === "/FlateDecode" ? inflateSync(datos) : Buffer.from(datos)).toString("latin1");
    } catch {
      continue;
    }
    for (const m of contenido.matchAll(/<([0-9A-Fa-f]*)>\s*Tj/g)) trozos.push(decodificar(m[1]));
  }
  return { paginas: doc.getPageCount(), texto: trozos.join("\n") };
}
