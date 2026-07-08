import type { VmStatus } from "@/features/vms/types"

/** Colores de datos (fijos, legibles en claro y oscuro). El "chrome" (ejes, grid, tooltip)
 *  usa currentColor / tokens para ser theme-aware. */
export const statusColor: Record<VmStatus, string> = {
  Encendida: "#10b981", // emerald-500
  Apagada: "#a1a1aa", // zinc-400
  Suspendida: "#f59e0b", // amber-500
}

/** Rampa índigo/violeta para categorías (OS). */
export const indigoRamp = ["#6366f1", "#818cf8", "#4f46e5", "#a5b4fc", "#7c3aed"]

/** Color estable por sistema operativo (consistente entre los gráficos de conteo y de RAM). */
export const osColor: Record<string, string> = {
  Ubuntu: "#6366f1",
  Debian: "#818cf8",
  "Windows Server": "#4f46e5",
  RHEL: "#a5b4fc",
  Otro: "#7c3aed",
}

/** Devuelve el color de un OS, con fallback a la rampa para valores no previstos. */
export function osColorFor(os: string, index: number): string {
  return osColor[os] ?? indigoRamp[index % indigoRamp.length]
}

export const primaryColor = "#6366f1"
