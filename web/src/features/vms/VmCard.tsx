import type { ReactNode } from "react"
import { Cpu, HardDrive, MemoryStick, Pencil } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { Vm } from "./types"
import { statusConfig } from "./vmStatus"

export function VmCard({ vm, isAdmin }: { vm: Vm; isAdmin: boolean }) {
  const status = statusConfig[vm.status]

  return (
    <Card className="flex flex-col gap-4 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{vm.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{vm.os}</p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
            status.badge,
          )}
        >
          <span className={cn("size-1.5 rounded-full", status.dot)} />
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Spec icon={<Cpu className="size-3.5" />} label="Cores" value={vm.cores} />
        <Spec icon={<MemoryStick className="size-3.5" />} label="RAM" value={`${vm.ram} GB`} />
        <Spec icon={<HardDrive className="size-3.5" />} label="Disco" value={`${vm.disk} GB`} />
      </div>

      {isAdmin && (
        <div className="flex justify-end border-t border-border pt-3">
          <Button asChild variant="ghost" size="sm">
            <Link to={`/vms/${vm.id}/edit`}>
              <Pencil />
              Editar
            </Link>
          </Button>
        </div>
      )}
    </Card>
  )
}

function Spec({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-2.5">
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
