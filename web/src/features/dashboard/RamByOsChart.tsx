import type { ReactNode } from "react"
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { ChartCard } from "./ChartCard"
import { ChartTooltip } from "./ChartTooltip"
import { osColorFor } from "./chartColors"
import type { RamByOsSlice } from "./dashboardStats"

/**
 * Panel EXTRA (opcional): RAM total aprovisionada por sistema operativo. Complementa al conteo por
 * OS con un lente de recursos (una plataforma con pocas VMs pero pesadas concentra memoria).
 * Autocontenido: quitarlo es borrar una línea en DashboardSection.
 */
export function RamByOsChart({ data }: { data: RamByOsSlice[] }) {
  const height = Math.max(140, data.length * 40)

  return (
    <ChartCard title="Memoria por sistema operativo" subtitle="GB de RAM aprovisionada por plataforma">
      <div className="w-full px-3 text-muted-foreground" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 40, bottom: 4, left: 8 }}
            barCategoryGap={10}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="os"
              width={110}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "currentColor", fontSize: 12 }}
            />
            <Tooltip
              content={<ChartTooltip unit="GB" />}
              cursor={{ fill: "currentColor", fillOpacity: 0.06 }}
            />
            <Bar dataKey="ram" name="RAM" radius={[0, 6, 6, 0]} maxBarSize={26}>
              {data.map((slice, i) => (
                <Cell key={slice.os} fill={osColorFor(slice.os, i)} />
              ))}
              <LabelList
                dataKey="ram"
                position="right"
                className="fill-foreground"
                style={{ fontSize: 11, fontWeight: 500 }}
                formatter={(value: ReactNode) => `${value} GB`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
