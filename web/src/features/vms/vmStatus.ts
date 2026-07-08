import type { VmStatus } from "./types"

/** Estilos semánticos por estado de VM. Colores directos (no tokens) por ser semánticos. */
export const statusConfig: Record<VmStatus, { label: string; dot: string; badge: string }> = {
  Encendida: {
    label: "Encendida",
    dot: "bg-emerald-500",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  Apagada: {
    label: "Apagada",
    dot: "bg-zinc-400",
    badge: "border-zinc-500/20 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400",
  },
  Suspendida: {
    label: "Suspendida",
    dot: "bg-amber-500",
    badge: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
}
