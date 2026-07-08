import { ArrowLeft, Construction } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

/**
 * Placeholder del formulario de VM (Slice 3). El formulario real con react-hook-form + zod y las
 * mutaciones optimistas (crear/editar/eliminar) se implementan en el Slice 4. La ruta y el guard
 * por rol ya son reales.
 */
export function VmFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams()
  const title = mode === "create" ? "Nueva máquina virtual" : "Editar máquina virtual"

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <Button asChild variant="ghost" size="sm" className="self-start">
        <Link to="/">
          <ArrowLeft />
          Volver
        </Link>
      </Button>

      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <span className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Construction className="size-6" />
        </span>
        <div>
          <h1 className="font-semibold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            El formulario con validación en tiempo real y guardado optimista llega en el Slice 4.
            {mode === "edit" && id ? ` (VM: ${id})` : ""}
          </p>
        </div>
      </Card>
    </div>
  )
}
