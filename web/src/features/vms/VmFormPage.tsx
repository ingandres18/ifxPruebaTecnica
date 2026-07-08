import { ArrowLeft } from "lucide-react"
import { Link, Navigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { VmForm } from "./VmForm"
import { useVms } from "./useVms"

/**
 * No existe GET /vms/{id} en el SPEC: para editar se busca la VM en el caché de la lista
 * (mismo query que el listado). Si se entra directo por URL sin caché, useVms la trae.
 */
export function VmFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams()
  const { data: vms, isLoading } = useVms()

  const vm = mode === "edit" ? vms?.find((v) => v.id === id) : undefined

  if (mode === "edit" && !isLoading && !vm) {
    return <Navigate to="/vms" replace />
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <Button asChild variant="ghost" size="sm" className="self-start">
        <Link to="/vms">
          <ArrowLeft />
          Volver
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Nueva máquina virtual" : "Editar máquina virtual"}</CardTitle>
        </CardHeader>
        <CardContent>
          {mode === "edit" && isLoading ? (
            <FormSkeleton />
          ) : (
            // key por VM: fuerza remonte del form (react-hook-form solo aplica defaultValues al
            // montar), evitando que los valores queden "pegados" si cambia la VM objetivo.
            <VmForm key={vm?.id ?? "new"} mode={mode} vm={vm} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-9 w-full" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  )
}
