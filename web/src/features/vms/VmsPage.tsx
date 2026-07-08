import { Plus } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useSession } from "@/features/auth/useSession"

import { VmsList } from "./VmsList"

/** Ruta "/" (SPEC §6). En Slice 5 se añadirán arriba los KPIs y charts del dashboard. */
export function VmsPage() {
  const { isAdmin } = useSession()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Máquinas virtuales</h1>
          <p className="mt-1 text-sm text-muted-foreground">Inventario de tu infraestructura</p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link to="/vms/new">
              <Plus />
              Nueva VM
            </Link>
          </Button>
        )}
      </div>

      <VmsList />
    </div>
  )
}
