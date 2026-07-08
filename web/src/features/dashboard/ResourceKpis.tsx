import type { ReactNode } from "react"
import { Cpu, HardDrive, MemoryStick, Server } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { ResourceTotals } from "./dashboardStats"

export function ResourceKpis({ totals }: { totals: ResourceTotals }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard
        icon={<Server className="size-5" />}
        label="VMs activas"
        value={totals.activeCount}
        total={totals.totalCount}
        footnote={`de ${totals.totalCount} máquinas`}
      />
      <KpiCard
        icon={<Cpu className="size-5" />}
        label="Cores activos"
        value={totals.cores.active}
        total={totals.cores.total}
        footnote={`de ${totals.cores.total} aprovisionados`}
      />
      <KpiCard
        icon={<MemoryStick className="size-5" />}
        label="RAM activa"
        value={totals.ram.active}
        total={totals.ram.total}
        unit="GB"
        footnote={`de ${totals.ram.total} GB aprovisionados`}
      />
      <KpiCard
        icon={<HardDrive className="size-5" />}
        label="Disco activo"
        value={totals.disk.active}
        total={totals.disk.total}
        unit="GB"
        footnote={`de ${totals.disk.total} GB aprovisionados`}
      />
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  total,
  unit,
  footnote,
}: {
  icon: ReactNode
  label: string
  value: number
  total: number
  unit?: string
  footnote: string
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <Card className="flex flex-col gap-3 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
            {value.toLocaleString("es")}
            {unit && <span className="ml-1 text-base font-normal text-muted-foreground">{unit}</span>}
          </p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
          {icon}
        </span>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{footnote}</span>
          <span className="font-medium text-foreground">{pct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Card>
  )
}

export function ResourceKpisSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
            <Skeleton className="size-9 rounded-lg" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </Card>
      ))}
    </div>
  )
}
