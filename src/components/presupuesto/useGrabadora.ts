"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Formatos por orden de preferencia: Chrome/Android (webm), Safari/iPhone (mp4), Firefox (ogg). */
const FORMATOS = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

export const MAX_SEGUNDOS_GRABACION = 120;

export type EstadoGrabadora = "parada" | "pidiendo-permiso" | "grabando";

function formatoSoportado(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return FORMATOS.find((f) => MediaRecorder.isTypeSupported(f));
}

/**
 * Graba una nota de voz con MediaRecorder. `alTerminar` recibe el audio cuando
 * se para (a mano o al llegar a MAX_SEGUNDOS_GRABACION).
 */
export function useGrabadora(alTerminar: (audio: Blob) => void) {
  const [estado, setEstado] = useState<EstadoGrabadora>("parada");
  const [segundos, setSegundos] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const grabadora = useRef<MediaRecorder | null>(null);
  const flujo = useRef<MediaStream | null>(null);
  const trozos = useRef<Blob[]>([]);
  const reloj = useRef<number | null>(null);
  const alTerminarRef = useRef(alTerminar);
  useEffect(() => {
    alTerminarRef.current = alTerminar;
  });

  const liberar = useCallback(() => {
    if (reloj.current !== null) window.clearInterval(reloj.current);
    reloj.current = null;
    flujo.current?.getTracks().forEach((t) => t.stop());
    flujo.current = null;
  }, []);

  useEffect(() => liberar, [liberar]);

  const parar = useCallback(() => {
    const g = grabadora.current;
    if (g && g.state !== "inactive") g.stop();
  }, []);

  const empezar = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Este navegador no puede grabar audio. Sube un audio o escribe el trabajo.");
      return;
    }
    setEstado("pidiendo-permiso");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      });
      flujo.current = stream;
      const mimeType = formatoSoportado();
      const g = new MediaRecorder(stream, mimeType ? { mimeType, audioBitsPerSecond: 32_000 } : undefined);
      trozos.current = [];
      g.ondataavailable = (e) => {
        if (e.data.size > 0) trozos.current.push(e.data);
      };
      g.onstop = () => {
        liberar();
        setEstado("parada");
        const audio = new Blob(trozos.current, { type: g.mimeType || mimeType || "audio/webm" });
        trozos.current = [];
        if (audio.size > 0) alTerminarRef.current(audio);
      };
      grabadora.current = g;
      g.start(250);
      const inicio = Date.now();
      setSegundos(0);
      setEstado("grabando");
      reloj.current = window.setInterval(() => {
        const s = Math.floor((Date.now() - inicio) / 1000);
        setSegundos(s);
        if (s >= MAX_SEGUNDOS_GRABACION) parar();
      }, 200);
    } catch {
      liberar();
      setEstado("parada");
      setError("No hay permiso para usar el micrófono. Actívalo en el navegador o sube un audio.");
    }
  }, [liberar, parar]);

  return { estado, segundos, error, empezar, parar };
}
