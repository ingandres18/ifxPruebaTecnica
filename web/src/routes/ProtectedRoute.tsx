import { Loader2 } from "lucide-react"
import { Navigate, Outlet } from "react-router-dom"

import { useSession } from "@/features/auth/useSession"
import { AppLayout } from "./AppLayout"

/**
 * Guard de autenticación. Mientras /auth/me resuelve muestra un loader (evita parpadeo a login
 * al recargar). Sin sesión → redirige a /login. La autorización real por rol está en el backend.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useSession()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
