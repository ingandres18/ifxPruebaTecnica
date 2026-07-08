import { useEffect } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { toast } from "sonner"

import { useSession } from "@/features/auth/useSession"

/**
 * Guard de rol. Va anidado dentro de ProtectedRoute (la sesión ya está resuelta aquí).
 * Un Cliente que fuerza la URL de una ruta de escritura → redirect a "/" con toast (SPEC §6).
 * La autorización real vive en el backend; esto es UX.
 */
export function AdminRoute() {
  const { isAdmin } = useSession()

  useEffect(() => {
    if (!isAdmin) {
      toast.error("No tienes permiso para acceder a esa sección")
    }
  }, [isAdmin])

  if (!isAdmin) return <Navigate to="/" replace />

  return <Outlet />
}
