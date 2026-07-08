import { apiFetch } from "@/lib/apiClient"
import type { VmFormValues } from "./vmSchema"
import type { Vm } from "./types"

/** Lista todas las VMs (Admin y Cliente). */
export const fetchVms = () => apiFetch<Vm[]>("/vms")

/** Crea una VM. Solo Admin (el backend rechaza con 403 a Cliente). */
export const createVm = (input: VmFormValues) =>
  apiFetch<Vm>("/vms", { method: "POST", body: JSON.stringify(input) })

/** Actualiza una VM existente. Solo Admin. */
export const updateVm = (id: string, input: VmFormValues) =>
  apiFetch<Vm>(`/vms/${id}`, { method: "PUT", body: JSON.stringify(input) })

/** Elimina una VM. Solo Admin. Idempotente: 404 si ya no existe. */
export const deleteVm = (id: string) => apiFetch<void>(`/vms/${id}`, { method: "DELETE" })
