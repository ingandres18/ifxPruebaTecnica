import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createVm, deleteVm, updateVm } from "./api"
import { vmsKey } from "./useVms"
import type { Vm } from "./types"
import type { VmFormValues } from "./vmSchema"

/**
 * Patrón optimista (CLAUDE.md, SPEC §6) aplicado a las 3 mutaciones de VMs:
 * onMutate (cancelar + snapshot + update optimista) → onError (rollback + toast)
 * → onSuccess (toast) → onSettled (invalidate para reconciliar con el servidor).
 */

async function snapshotAndCancel(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.cancelQueries({ queryKey: vmsKey })
  return queryClient.getQueryData<Vm[]>(vmsKey)
}

function rollback(
  queryClient: ReturnType<typeof useQueryClient>,
  previous: Vm[] | undefined,
  message: string,
) {
  if (previous) queryClient.setQueryData(vmsKey, previous)
  toast.error(message)
}

export function useCreateVm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: VmFormValues) => createVm(input),
    onMutate: async (input) => {
      const previous = await snapshotAndCancel(queryClient)

      const now = new Date().toISOString()
      const optimisticVm: Vm = {
        id: `temp-${crypto.randomUUID()}`,
        name: input.name,
        cores: input.cores,
        ram: input.ram,
        disk: input.disk,
        os: input.os,
        status: input.status,
        createdAt: now,
        updatedAt: now,
      }
      queryClient.setQueryData<Vm[]>(vmsKey, (old) => [optimisticVm, ...(old ?? [])])

      return { previous }
    },
    onError: (_err, _input, context) => {
      rollback(queryClient, context?.previous, "No se pudo crear la VM")
    },
    onSuccess: () => {
      toast.success("VM creada correctamente")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: vmsKey })
    },
  })
}

export function useUpdateVm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VmFormValues }) => updateVm(id, input),
    onMutate: async ({ id, input }) => {
      const previous = await snapshotAndCancel(queryClient)

      queryClient.setQueryData<Vm[]>(vmsKey, (old) =>
        old?.map((vm) =>
          vm.id === id
            ? { ...vm, ...input, updatedAt: new Date().toISOString() }
            : vm,
        ),
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      rollback(queryClient, context?.previous, "No se pudo actualizar la VM")
    },
    onSuccess: () => {
      toast.success("VM actualizada correctamente")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: vmsKey })
    },
  })
}

export function useDeleteVm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteVm(id),
    onMutate: async (id) => {
      const previous = await snapshotAndCancel(queryClient)

      queryClient.setQueryData<Vm[]>(vmsKey, (old) => old?.filter((vm) => vm.id !== id))

      return { previous }
    },
    onError: (_err, _id, context) => {
      rollback(queryClient, context?.previous, "No se pudo eliminar la VM")
    },
    onSuccess: () => {
      toast.success("VM eliminada correctamente")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: vmsKey })
    },
  })
}
