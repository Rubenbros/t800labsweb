import { cargarTarifa, type Tarifa } from "../dominio/tarifa";
import tarifaEjemplo from "./tarifa-ejemplo.json";

/**
 * Tarifa de la empresa ficticia de la demo. Precios de mercado de España en 2026,
 * sin IVA; fuentes y método en docs/presupuesto-audio/tarifa-ejemplo-fuentes.md.
 * Se valida al cargar: una tarifa mal formada rompe el arranque y las pruebas,
 * no un presupuesto delante de un cliente.
 */
export const TARIFA_EJEMPLO: Tarifa = cargarTarifa(tarifaEjemplo);
