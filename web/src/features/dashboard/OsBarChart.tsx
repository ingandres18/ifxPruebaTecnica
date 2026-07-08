import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { ChartCard } from "./ChartCard"
import { ChartTooltip } from "./ChartTooltip"
import { osColorFor } from "./chartColors"
import type { OsSlice } from "./dashboardStats"

export function OsBarChart({ data }: { data: OsSlice[] }) {
  return (
    <ChartCard title="Sistemas operativos" subtitle="Máquinas por sistema operativo">
      <div className="h-[200px] w-full px-3 text-muted-foreground">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <XAxis
              dataKey="os"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "currentColor", fontSize: 11 }}
              interval={0}
            />
            <YAxis hide allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", fillOpacity: 0.06 }} />
            <Bar dataKey="count" name="Máquinas" radius={[6, 6, 0, 0]} maxBarSize={56}>
              {data.map((slice, i) => (
                <Cell key={slice.os} fill={osColorFor(slice.os, i)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
