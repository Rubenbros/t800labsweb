"use client";

import dynamic from "next/dynamic";

/**
 * La demo lee el código de acceso del enlace y del almacenamiento del móvil:
 * se pinta solo en el navegador para no tener que hidratar un estado distinto
 * al del servidor.
 */
export const GrabadorPresupuestoCliente = dynamic(
  () => import("./GrabadorPresupuesto").then((m) => m.GrabadorPresupuesto),
  { ssr: false, loading: () => <main className="min-h-[100svh] bg-black" /> },
);
