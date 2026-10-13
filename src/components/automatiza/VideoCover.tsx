import Image from "next/image";
import { BRAND_NAMES, type PublishedVideo } from "@/lib/escaparate/feed";

type Props = {
  video: PublishedVideo;
  /** Ancho al que se pinta, para que el navegador pida la portada a su tamaño. */
  sizes: string;
  className?: string;
};

/** Portada vertical del vídeo. Sin portada, el nombre de la marca sobre fondo oscuro. */
export function VideoCover({ video, sizes, className = "" }: Props) {
  return (
    <div className={`relative aspect-[9/16] overflow-hidden rounded-md border border-white/10 bg-[#141414] ${className}`}>
      {video.cover ? (
        <Image src={video.cover} alt="" fill sizes={sizes} className="object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center px-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          {BRAND_NAMES[video.brand]}
        </span>
      )}
    </div>
  );
}
