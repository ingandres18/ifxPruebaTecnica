/**
 * Cliente HTTP de la API. Same-origin vía el proxy de Vite (base `/api`), la cookie HttpOnly
 * viaja sola. El frontend NUNCA maneja el token. Los errores se normalizan desde ProblemDetails.
 */

import { getConnectionId } from "./signalr"

const BASE = "/api"

/** Forma de un error RFC 7807 devuelto por el backend. */
export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
}

/** Error tipado de la API: expone el status y el ProblemDetails cuando existe. */
export class ApiError extends Error {
  readonly status: number
  readonly problem?: ProblemDetails

  constructor(status: number, message: string, problem?: ProblemDetails) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.problem = problem
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { headers, ...rest } = options

  // Adjuntamos el connectionId de SignalR (si hay conexión): el backend excluye a esta conexión
  // del broadcast en las mutaciones, evitando el eco de la propia acción.
  const connectionId = getConnectionId()

  const response = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(connectionId ? { "X-Connection-Id": connectionId } : {}),
      ...headers,
    },
    ...rest,
  })

  if (!response.ok) {
    let problem: ProblemDetails | undefined
    try {
      problem = (await response.json()) as ProblemDetails
    } catch {
      // Respuesta sin cuerpo JSON (p. ej. 401 del middleware de auth).
    }
    throw new ApiError(response.status, problem?.title ?? response.statusText, problem)
  }

  // 204 No Content (p. ej. logout) o cuerpo vacío.
  if (response.status === 204) return undefined as T
  const text = await response.text()
  return (text ? (JSON.parse(text) as T) : (undefined as T))
}
