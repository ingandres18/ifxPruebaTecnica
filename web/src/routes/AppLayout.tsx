import type { ReactNode } from "react"
import { LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Brand } from "@/components/brand"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useLogout, useSession } from "@/features/auth/useSession"

/** Layout de las páginas autenticadas: header sticky con marca, usuario, theme toggle y logout. */
export function AppLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin } = useSession()
  const logoutMutation = useLogout()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate("/login", { replace: true }),
      onError: () => toast.error("No se pudo cerrar sesión"),
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Brand />
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <div className="hidden items-center gap-2 sm:flex">
                <div className="text-right leading-tight">
                  <p className="text-sm font-medium">{user.email}</p>
                  <span
                    className={
                      isAdmin
                        ? "text-xs font-medium text-primary"
                        : "text-xs text-muted-foreground"
                    }
                  >
                    {isAdmin ? "Administrador" : "Cliente"}
                  </span>
                </div>
                <span className="grid size-9 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
