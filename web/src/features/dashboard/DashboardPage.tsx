import { Sparkles } from "lucide-react"

import { useSession } from "@/features/auth/useSession"

/**
 * Página protegida "/" (SPEC §6). Placeholder del Slice 2: confirma la sesión activa.
 * El listado de VMs (Slice 3) y los KPIs/charts (Slice 5) se agregan aquí.
 */
export function DashboardPage() {
  const { user, isAdmin } = useSession()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola, {user?.email.split("@")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rol activo:{" "}
          <span className="font-medium text-foreground">
            {isAdmin ? "Administrador" : "Cliente"}
          </span>
        </p>
      </div>

      <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h2 className="font-medium">Sesión iniciada correctamente</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            El listado de máquinas virtuales y el dashboard de recursos llegan en los próximos
            slices.
          </p>
        </div>
      </div>
    </div>
  )
}
