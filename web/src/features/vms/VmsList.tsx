import { Link } from "react-router-dom"
import { AlertCircle, Plus, ServerOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/features/auth/useSession"

import { VmCard } from "./VmCard"
import { useVms } from "./useVms"

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

export function VmsList() {
  const { isAdmin } = useSession()
  const { data: vms, isLoading, isError, refetch, isFetching } = useVms()

  if (isLoading) {
    return (
      <Grid>
        {Array.from({ length: 6 }).map((_, i) => (
          <VmCardSkeleton key={i} />
        ))}
      </Grid>
    )
  }

  if (isError) {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <AlertCircle className="size-8 text-destructive" />
        <div>
          <p className="font-medium">No se pudieron cargar las VMs</p>
          <p className="text-sm text-muted-foreground">Revisa tu conexión e intenta de nuevo.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          Reintentar
        </Button>
      </Card>
    )
  }

  if (!vms || vms.length === 0) {
    return <EmptyState isAdmin={isAdmin} />
  }

  return (
    <Grid>
      {vms.map((vm) => (
        <VmCard key={vm.id} vm={vm} isAdmin={isAdmin} />
      ))}
    </Grid>
  )
}

function VmCardSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    </Card>
  )
}

function EmptyState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Card className="flex flex-col items-center gap-4 p-12 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
        <ServerOff className="size-7" />
      </span>
      <div>
        <p className="font-medium">Aún no hay máquinas virtuales</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {isAdmin
            ? "Crea tu primera VM para empezar a gestionar tu infraestructura."
            : "Cuando un administrador cree VMs, aparecerán aquí."}
        </p>
      </div>
      {isAdmin && (
        <Button asChild>
          <Link to="/vms/new">
            <Plus />
            Crear VM
          </Link>
        </Button>
      )}
    </Card>
  )
}
