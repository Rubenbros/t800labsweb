import type { Metadata } from "next";
import { GrabadorPresupuestoCliente } from "@/components/presupuesto/GrabadorPresupuestoCliente";

/** Demo privada (con código): fuera de buscadores. Solo en español. */
export const metadata: Metadata = {
  title: "Presupuesto por audio · Demo · T800 Labs",
  description: "Demo: un audio y te llega el borrador del presupuesto en PDF. Datos de ejemplo.",
  robots: { index: false, follow: false },
};

export default function PresupuestoPorAudioPage() {
  return <GrabadorPresupuestoCliente />;
}
