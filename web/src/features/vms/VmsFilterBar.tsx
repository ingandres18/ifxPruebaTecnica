import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { VmStatus } from "./types"

export type StatusFilter = "todos" | VmStatus

const filters: StatusFilter[] = ["todos", "Encendida", "Apagada", "Suspendida"]

/** Filtros client-side del listado: búsqueda por nombre + estado. Reactivo sobre el caché. */
export function VmsFilterBar({
  search,
  onSearch,
  status,
  onStatus,
}: {
  search: string
  onSearch: (value: string) => void
  status: StatusFilter
  onStatus: (value: StatusFilter) => void
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative sm:max-w-xs sm:flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar por nombre..."
          aria-label="Buscar máquinas virtuales por nombre"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onStatus(f)}
            aria-pressed={status === f}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              status === f
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {f === "todos" ? "Todos" : f}
          </button>
        ))}
      </div>
    </div>
  )
}
