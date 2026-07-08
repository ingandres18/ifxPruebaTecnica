import { BarChart3 } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useVms } from "@/features/vms/useVms"

import {
  computeOsDistribution,
  computeRamByOs,
  computeResourceTotals,
  computeStatusDistribution,
} from "./dashboardStats"
import { OsBarChart } from "./OsBarChart"
import { RamByOsChart } from "./RamByOsChart"
import { ResourceKpis, ResourceKpisSkeleton } from "./ResourceKpis"
import { StatusDonut } from "./StatusDonut"

/**
 * Panel de recursos (SPEC §5/§6). Todo se deriva del caché de useVms: al crear/editar/eliminar
 * o cambiar el estado de una VM, los KPIs y gráficos se recalculan solos, sin endpoint extra.
 */
export function DashboardSection() {
  const { data: vms, isLoading } = useVms()

  if (isLoading) return <DashboardSkeleton />

  if (!vms || vms.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 p-12 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
          <BarChart3 className="size-6" />
        </span>
        <p className="font-medium">Aún no hay datos que mostrar</p>
        <p className="text-sm text-muted-foreground">
          Crea tu primera máquina virtual para ver las estadísticas de recursos.
        </p>
      </Card>
    )
  }

  const totals = computeResourceTotals(vms)
  const statusDist = computeStatusDistribution(vms)
  const osDist = computeOsDistribution(vms)
  const ramByOs = computeRamByOs(vms)

  return (
    <div className="flex flex-col gap-4">
      <ResourceKpis totals={totals} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StatusDonut data={statusDist} />
        <OsBarChart data={osDist} />
      </div>

      {/* Panel EXTRA (opcional): quitar esta línea para simplificar. */}
      <RamByOsChart data={ramByOs} />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <ResourceKpisSkeleton />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-[160px] w-full" />
    </Card>
  )
}
