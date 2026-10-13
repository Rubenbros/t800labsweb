"use client";

import { useEffect, useState } from "react";
import type { PublishedVideo } from "./feed";

// Todos los bloques de la página comparten una sola petición.
let request: Promise<PublishedVideo[] | null> | null = null;

function fetchLatest(): Promise<PublishedVideo[] | null> {
  request ??= fetch("/api/escaparate")
    .then((response) => (response.ok ? response.json() : null))
    .then((data: { videos?: PublishedVideo[] } | null) => (Array.isArray(data?.videos) ? data.videos : null))
    .catch(() => null);
  return request;
}

/**
 * Los vídeos publicados: arranca con los que traía la página del servidor y se pone al
 * día en el navegador. Una respuesta vacía no borra lo que ya se enseñaba.
 */
export function usePublishedVideos(initial: PublishedVideo[] = []): PublishedVideo[] {
  const [videos, setVideos] = useState(initial);

  useEffect(() => {
    let active = true;
    fetchLatest().then((latest) => {
      if (active && latest && latest.length > 0) setVideos(latest);
    });
    return () => {
      active = false;
    };
  }, []);

  return videos;
}
