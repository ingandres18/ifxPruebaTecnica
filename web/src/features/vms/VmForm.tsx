import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import type { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import type { Vm } from "./types"
import { osOptions, statusOptions, vmSchema, type VmFormValues } from "./vmSchema"
import { useCreateVm, useUpdateVm } from "./useVmMutations"

// z.coerce.number() en cores/ram/disk hace que el tipo de entrada (lo que teclea el usuario,
// `unknown`) difiera del tipo de salida (`number` tras parsear). react-hook-form necesita ambos:
// input para los <input>, output (VmFormValues) para el onSubmit.
type VmFormInput = z.input<typeof vmSchema>

const selectClass = cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
)

export function VmForm({ mode, vm }: { mode: "create" | "edit"; vm?: Vm }) {
  const navigate = useNavigate()
  const createMutation = useCreateVm()
  const updateMutation = useUpdateVm()

  const form = useForm<VmFormInput, unknown, VmFormValues>({
    resolver: zodResolver(vmSchema),
    mode: "onChange",
    defaultValues: vm
      ? {
          name: vm.name,
          cores: vm.cores,
          ram: vm.ram,
          disk: vm.disk,
          os: vm.os as VmFormValues["os"],
          status: vm.status,
        }
      : {
          name: "",
          cores: 1,
          ram: 1,
          disk: 10,
          os: "Ubuntu",
          status: "Apagada",
        },
  })

  const { errors, isValid } = form.formState

  // Optimistic UI: al enviar, la mutación actualiza el caché al instante y navegamos ya —
  // no esperamos la respuesta del servidor. Si falla, el rollback ocurre en la lista (onError).
  const onSubmit = form.handleSubmit((values) => {
    if (mode === "create") {
      createMutation.mutate(values)
    } else if (vm) {
      updateMutation.mutate({ id: vm.id, input: values })
    }
    navigate("/vms")
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <Field label="Nombre" htmlFor="name" error={errors.name?.message}>
        <Input id="name" placeholder="web-01" aria-invalid={!!errors.name} {...form.register("name")} />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Cores" htmlFor="cores" error={errors.cores?.message}>
          <Input
            id="cores"
            type="number"
            aria-invalid={!!errors.cores}
            {...form.register("cores")}
          />
        </Field>
        <Field label="RAM (GB)" htmlFor="ram" error={errors.ram?.message}>
          <Input id="ram" type="number" aria-invalid={!!errors.ram} {...form.register("ram")} />
        </Field>
        <Field label="Disco (GB)" htmlFor="disk" error={errors.disk?.message}>
          <Input
            id="disk"
            type="number"
            aria-invalid={!!errors.disk}
            {...form.register("disk")}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Sistema operativo" htmlFor="os" error={errors.os?.message}>
          <select id="os" className={selectClass} aria-invalid={!!errors.os} {...form.register("os")}>
            {osOptions.map((os) => (
              <option key={os} value={os}>
                {os}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Estado" htmlFor="status" error={errors.status?.message}>
          <select
            id="status"
            className={selectClass}
            aria-invalid={!!errors.status}
            {...form.register("status")}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Button type="submit" disabled={!isValid || isPending} className="mt-2">
        {isPending && <Loader2 className="animate-spin" />}
        {mode === "create" ? "Crear VM" : "Guardar cambios"}
      </Button>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
