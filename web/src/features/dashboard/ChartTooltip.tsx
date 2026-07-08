interface TooltipEntry {
  name?: string
  value?: number | string
  color?: string
  payload?: { fill?: string }
}

/** Tooltip con la estética de la app (bg-popover, borde, texto), en vez del default de Recharts. */
export function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
  unit?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-popover-foreground">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className="size-2 rounded-[3px]"
            style={{ backgroundColor: entry.color ?? entry.payload?.fill ?? "currentColor" }}
          />
          <span>{entry.name}:</span>
          <span className="font-medium text-foreground">
            {entry.value}
            {unit ? ` ${unit}` : ""}
          </span>
        </div>
      ))}
    </div>
  )
}
