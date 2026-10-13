// Imagen para compartir: la genera src/app/opengraph-image.tsx. Se declara a mano en cada
// página porque un `openGraph` definido en un segmento hijo sustituye entero al del padre,
// y con él la imagen que Next añadiría sola.
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "T800 Labs — Software Development",
} as const;
