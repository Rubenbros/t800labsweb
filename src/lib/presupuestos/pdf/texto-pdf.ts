/**
 * Utilidades de texto para el PDF con fuentes estándar (Helvetica, codificación
 * WinAnsi): limpieza de caracteres que la fuente no puede pintar y partido de
 * líneas por ancho real. Las fuentes estándar no necesitan ficheros ni
 * dependencias nativas, que es lo que mantiene el PDF ligero en Cloud Run.
 */
import type { PDFFont } from "pdf-lib";

/** Sustituciones de caracteres frecuentes fuera de WinAnsi por su equivalente legible. */
const SUSTITUCIONES: Array<[RegExp, string]> = [
  [/[≈]/g, "aprox. "], // ≈
  [/[−‐‑]/g, "-"], // − ‐ ‑
  [/[→]/g, "->"],
  [/[≤]/g, "<="],
  [/[≥]/g, ">="],
  [/[    ]/g, " "], // espacios finos
  [/[​-‍﻿]/g, ""], // espacios de ancho cero
];

const cacheConjuntos = new WeakMap<PDFFont, Set<number>>();

function conjunto(fuente: PDFFont): Set<number> {
  let c = cacheConjuntos.get(fuente);
  if (!c) {
    c = new Set(fuente.getCharacterSet());
    cacheConjuntos.set(fuente, c);
  }
  return c;
}

/** Deja solo caracteres que la fuente sabe pintar (lo demás, sustituido o fuera). */
export function limpiar(texto: string, fuente: PDFFont): string {
  let t = texto.normalize("NFC").replace(/[\r\n\t]+/g, " ");
  for (const [re, por] of SUSTITUCIONES) t = t.replace(re, por);
  const admitidos = conjunto(fuente);
  let out = "";
  for (const ch of t) {
    const cp = ch.codePointAt(0)!;
    if (admitidos.has(cp)) out += ch;
  }
  return out.replace(/ {2,}/g, " ").trim();
}

/** Parte un texto en líneas que caben en `ancho` puntos. Corta palabras más largas que la línea. */
export function partir(texto: string, fuente: PDFFont, tamano: number, ancho: number): string[] {
  const limpio = limpiar(texto, fuente);
  if (!limpio) return [];
  const medir = (s: string) => fuente.widthOfTextAtSize(s, tamano);
  const lineas: string[] = [];
  let actual = "";

  const empujarPalabraLarga = (palabra: string) => {
    let trozo = "";
    for (const ch of palabra) {
      if (medir(trozo + ch) > ancho && trozo) {
        lineas.push(trozo);
        trozo = ch;
      } else {
        trozo += ch;
      }
    }
    return trozo;
  };

  for (const palabra of limpio.split(" ")) {
    const candidata = actual ? `${actual} ${palabra}` : palabra;
    if (medir(candidata) <= ancho) {
      actual = candidata;
      continue;
    }
    if (actual) lineas.push(actual);
    actual = medir(palabra) > ancho ? empujarPalabraLarga(palabra) : palabra;
  }
  if (actual) lineas.push(actual);
  return lineas;
}

/** Recorta con «…» para que quepa en una línea. */
export function recortar(texto: string, fuente: PDFFont, tamano: number, ancho: number): string {
  const limpio = limpiar(texto, fuente);
  if (fuente.widthOfTextAtSize(limpio, tamano) <= ancho) return limpio;
  let s = limpio;
  while (s.length > 1 && fuente.widthOfTextAtSize(`${s}…`, tamano) > ancho) s = s.slice(0, -1);
  return `${s.trimEnd()}…`;
}
