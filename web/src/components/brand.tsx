import { Server } from "lucide-react"

import { cn } from "@/lib/utils"

/** Marca de la app: chip con el ícono sobre el color primario + wordmark. Reutilizable. */
export function Brand({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/30">
        <Server className="size-5" />
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight">IFX</span>
          <span className="text-xs text-muted-foreground">Gestión de VMs</span>
        </span>
      )}
    </div>
  )
}
