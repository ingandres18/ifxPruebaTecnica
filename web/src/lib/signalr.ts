import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr"

/**
 * Conexión única al hub de VMs (same-origin vía el proxy `/hubs`, la cookie viaja en el handshake).
 * El `connectionId` se comparte con el apiClient para que el servidor excluya al originador de una
 * mutación de su propio broadcast (evita duplicar/re-animar la propia acción).
 */
let connection: HubConnection | null = null
let connectionId: string | null = null

export function getConnectionId(): string | null {
  return connectionId
}

export function getOrCreateConnection(): HubConnection {
  if (!connection) {
    connection = new HubConnectionBuilder()
      .withUrl("/hubs/vms")
      .withAutomaticReconnect()
      .build()

    connection.onreconnected((id) => {
      connectionId = id ?? null
    })
    connection.onclose(() => {
      connectionId = null
    })
  }
  return connection
}

export function setConnectionId(id: string | null | undefined) {
  connectionId = id ?? null
}

export async function resetConnection() {
  if (connection) {
    const current = connection
    connection = null
    connectionId = null
    try {
      await current.stop()
    } catch {
      // silencioso: cerrar una conexión ya cerrada no es un error relevante
    }
  }
}
