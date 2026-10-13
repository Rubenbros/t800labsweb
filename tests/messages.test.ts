import { describe, expect, it } from "vitest";

import en from "../messages/en.json";
import es from "../messages/es.json";
import { CUSTOM_TIERS, PACKAGES } from "@/lib/automatiza/offer";
import { ORIGINS } from "@/lib/automatiza/whatsapp";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/** Rutas de todas las hojas: `Automatiza.packages.p1.includes[2]`. */
function leafPaths(value: Json, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => leafPaths(item, `${prefix}[${i}]`));
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      leafPaths(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
}

describe("traducciones", () => {
  it("español e inglés tienen exactamente las mismas claves", () => {
    const esPaths = leafPaths(es as Json).sort();
    const enPaths = leafPaths(en as Json).sort();
    expect(enPaths).toEqual(esPaths);
  });

  it("ningún texto está vacío", () => {
    for (const messages of [es, en]) {
      const empty = leafPaths(messages as Json).filter((path) => {
        const value = path
          .replace(/\[(\d+)\]/g, ".$1")
          .split(".")
          .reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], messages);
        return typeof value !== "string" || value.trim() === "";
      });
      expect(empty).toEqual([]);
    }
  });

  it("cada paquete de la oferta tiene sus textos", () => {
    for (const messages of [es, en]) {
      for (const { id } of PACKAGES) {
        const pkg = messages.Automatiza.packages[id];
        expect(pkg.name).toBeTruthy();
        expect(pkg.includes.length).toBeGreaterThan(0);
        expect(pkg.excludes.length).toBeGreaterThan(0);
      }
    }
  });

  it("cada tramo a medida tiene sus textos", () => {
    for (const messages of [es, en]) {
      expect(Object.keys(messages.Automatiza.custom.tiers).sort()).toEqual(
        CUSTOM_TIERS.map((tier) => tier.id).sort(),
      );
    }
  });

  it("hay un mensaje de WhatsApp por cada origen", () => {
    for (const messages of [es, en]) {
      expect(Object.keys(messages.Automatiza.whatsapp.origins).sort()).toEqual(
        [...ORIGINS].sort(),
      );
    }
  });
});
