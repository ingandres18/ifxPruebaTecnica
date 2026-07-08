import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { ApiError } from "@/lib/apiClient"
import { fetchMe, login, logout } from "./api"
import type { SessionUser } from "./types"

/** Clave del query que ES la sesión (fuente única de verdad; no se duplica en Zustand). */
export const sessionKey = ["session"] as const

/**
 * Lee la sesión actual desde el caché del query de /auth/me.
 * Un 401 significa "no autenticado", no un error a mostrar.
 */
export function useSession() {
  const query = useQuery<SessionUser>({
    queryKey: sessionKey,
    queryFn: fetchMe,
    retry: false,
    staleTime: Infinity,
  })

  const user = query.data ?? null

  return {
    user,
    isAdmin: user?.role === "Administrador",
    isAuthenticated: !!user,
    isLoading: query.isLoading,
    // 401 esperado = sesión ausente; cualquier otro error sí es un problema real.
    isUnauthorized:
      query.isError && query.error instanceof ApiError && query.error.status === 401,
  }
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      // El login (mutación) alimenta el caché de la sesión: no es "copiar un query", es su origen.
      queryClient.setQueryData(sessionKey, user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(sessionKey, null)
      // Limpia el resto del caché de servidor al cerrar sesión (VMs llegan en el slice 3).
      queryClient.removeQueries({ queryKey: ["vms"] })
    },
  })
}
