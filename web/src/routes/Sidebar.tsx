import { ChevronLeft, LayoutDashboard, LogOut, Server } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Brand } from "@/components/brand"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useLogout, useSession } from "@/features/auth/useSession"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/vms", label: "Máquinas virtuales", icon: Server, end: false },
]

/**
 * Contenido del sidebar: marca, navegación con estado activo y bloque de usuario/sesión.
 * `collapsed` (solo en desktop) reduce a un rail de iconos; el drawer móvil siempre va expandido.
 */
export function Sidebar({
  collapsed = false,
  onToggleCollapse,
  onNavigate,
}: {
  collapsed?: boolean
  onToggleCollapse?: () => void
  onNavigate?: () => void
}) {
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
    <div className="flex h-full flex-col gap-2 p-3">
      <div className={cn("py-3", collapsed ? "flex justify-center" : "px-2")}>
        <Brand showText={!collapsed} />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            aria-label={item.label}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )
            }
          >
            <item.icon className="size-4 shrink-0" />
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-3 border-t border-border pt-3">
        <div className={cn("flex items-center gap-2", collapsed ? "justify-center" : "px-1")}>
          <span
            className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
            title={collapsed ? user?.email : undefined}
          >
            {user?.email.charAt(0).toUpperCase()}
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">{isAdmin ? "Administrador" : "Cliente"}</p>
            </div>
          )}
        </div>

        <div className={cn("flex items-center gap-2", collapsed && "flex-col")}>
          <ThemeToggle />
          <Button
            variant="outline"
            size={collapsed ? "icon" : "sm"}
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className={collapsed ? "" : "flex-1"}
            title={collapsed ? "Salir" : undefined}
            aria-label="Salir"
          >
            <LogOut />
            {!collapsed && "Salir"}
          </Button>
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? "Expandir menú" : "Colapsar menú"}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
          >
            <ChevronLeft className={cn("size-4 shrink-0 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && "Colapsar"}
          </button>
        )}
      </div>
    </div>
  )
}
