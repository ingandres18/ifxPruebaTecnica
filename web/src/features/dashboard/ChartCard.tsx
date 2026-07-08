import type { ReactNode } from "react"

import { Card } from "@/components/ui/card"

/** Contenedor consistente para cada gráfico: título, subtítulo opcional y cuerpo. */
export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-2 p-5 pb-2">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="px-2 pb-3">{children}</div>
    </Card>
  )
}
