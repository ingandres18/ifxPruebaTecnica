import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { HubConnectionState } from "@microsoft/signalr"

import { getOrCreateConnection, setConnectionId } from "@/lib/signalr"
import { useHighlightStore } from "@/stores/highlightStore"

import type { Vm } from "./types"
import { vmsKey } from "./useVms"

/**
 * Suscripción real-time a los eventos del hub. Al recibir un evento actualiza el caché de VMs
 * (setQueryData) y resalta la tarjeta. El originador de la mutación NO recibe estos eventos
 * (el servidor lo excluye por connectionId), así que no se duplica ni re-anima su propia acción.
 * Se monta en el área autenticada: conecta al entrar, cierra la conexión al salir.
 */
export function useRealtimeVms() {
  const queryClient = useQueryClient()
  const flash = useHighlightStore((s) => s.flash)

  useEffect(() => {
    const connection = getOrCreateConnection()

    const onCreated = (vm: Vm) => {
      queryClient.setQueryData<Vm[]>(vmsKey, (old) => {
        if (!old) return old
        if (old.some((v) => v.id === vm.id)) return old
        return [vm, ...old]
      })
      flash(vm.id)
    }

    const onUpdated = (vm: Vm) => {
      queryClient.setQueryData<Vm[]>(vmsKey, (old) => old?.map((v) => (v.id === vm.id ? vm : v)))
      flash(vm.id)
    }

    const onDeleted = (id: string) => {
      queryClient.setQueryData<Vm[]>(vmsKey, (old) => old?.filter((v) => v.id !== id))
    }

    connection.on("VmCreated", onCreated)
    connection.on("VmUpdated", onUpdated)
    connection.on("VmDeleted", onDeleted)

    // Iniciar solo si está desconectada (idempotente ante el doble-montaje de StrictMode).
    if (connection.state === HubConnectionState.Disconnected) {
      connection
        .start()
        .then(() => setConnectionId(connection.connectionId))
        .catch(() => {
          // La reconexión automática se encarga de reintentar; no bloqueamos la UI.
        })
    } else {
      setConnectionId(connection.connectionId)
    }

    return () => {
      // Solo quitamos los handlers; la conexión se cierra en el logout (resetConnection),
      // no en cada cleanup, para evitar churn con StrictMode.
      connection.off("VmCreated", onCreated)
      connection.off("VmUpdated", onUpdated)
      connection.off("VmDeleted", onDeleted)
    }
  }, [queryClient, flash])
}
