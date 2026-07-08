import { apiFetch } from "@/lib/apiClient"
import type { Vm } from "./types"

/** Lista todas las VMs (Admin y Cliente). */
export const fetchVms = () => apiFetch<Vm[]>("/vms")
