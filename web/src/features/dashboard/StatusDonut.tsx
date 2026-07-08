import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { cn } from "@/lib/utils"
import { ChartCard } from "./ChartCard"
import { ChartTooltip } from "./ChartTooltip"
import { statusColor } from "./chartColors"
import type { StatusSlice } from "./dashboardStats"

export function StatusDonut({ data }: { data: StatusSlice[] }) {
  const total = data.reduce((acc, s) => acc + s.count, 0)
  const visible = data.filter((s) => s.count > 0)

  return (
    <ChartCard title="Estado de las máquinas" subtitle="Distribución por estado operativo">
      <div className="flex flex-col items-center gap-4 px-3 sm:flex-row">
        <div className="relative h-[160px] w-full max-w-[180px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={visible}
                dataKey="count"
                nameKey="status"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={visible.length > 1 ? 3 : 0}
                strokeWidth={0}
                startAngle={90}
                endAngle={-270}
              >
                {visible.map((slice) => (
                  <Cell key={slice.status} fill={statusColor[slice.status]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums">{total}</span>
            <span className="text-xs text-muted-foreground">máquinas</span>
          </div>
        </div>

        <ul className="flex w-full flex-col gap-2">
          {data.map((slice) => {
            const pct = total > 0 ? Math.round((slice.count / total) * 100) : 0
            return (
              <li key={slice.status} className="flex items-center gap-2 text-sm">
                <span
                  className="size-2.5 rounded-[3px]"
                  style={{ backgroundColor: statusColor[slice.status] }}
                />
                <span className="text-muted-foreground">{slice.status}</span>
                <span className={cn("ml-auto font-medium tabular-nums")}>{slice.count}</span>
                <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{pct}%</span>
              </li>
            )
          })}
        </ul>
      </div>
    </ChartCard>
  )
}
