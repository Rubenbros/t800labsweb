/** Lee un flujo de bytes entero sin pasar de `maxBytes` (corta en cuanto se pasa). */
export class DemasiadoGrande extends Error {
  constructor() {
    super("Contenido demasiado grande");
    this.name = "DemasiadoGrande";
  }
}

export async function leerConTope(flujo: ReadableStream<Uint8Array> | null, maxBytes: number): Promise<Uint8Array> {
  if (!flujo) return new Uint8Array(0);
  const lector = flujo.getReader();
  const trozos: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await lector.cancel().catch(() => {});
      throw new DemasiadoGrande();
    }
    trozos.push(value);
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const t of trozos) {
    out.set(t, off);
    off += t.byteLength;
  }
  return out;
}
