import { useQuery } from "@tanstack/react-query"

import { fetchVms } from "./api"

/** Clave del caché de VMs. Fuente única para el listado y (en slice 5) el dashboard. */
export const vmsKey = ["vms"] as const

export function useVms() {
  return useQuery({
    queryKey: vmsKey,
    queryFn: fetchVms,
  })
}
