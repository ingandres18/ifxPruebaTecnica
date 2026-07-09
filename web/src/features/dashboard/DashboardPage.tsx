import { usePageTitle } from "@/lib/usePageTitle"
import { DashboardSection } from "./DashboardSection"

/** Ruta "/" (SPEC §6): panel de recursos (KPIs + charts), separado de la gestión de VMs. */
export function DashboardPage() {
  usePageTitle("Dashboard")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen de recursos de tu infraestructura
        </p>
      </div>
      <DashboardSection />
    </div>
  )
}
