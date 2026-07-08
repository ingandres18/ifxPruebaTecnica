import type { ReactNode } from "react"
import { useState } from "react"
import { Menu } from "lucide-react"

import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { useRealtimeVms } from "@/features/vms/useRealtimeVms"
import { useUiStore } from "@/stores/uiStore"
import { cn } from "@/lib/utils"
import { Sidebar } from "./Sidebar"

/**
 * Layout de las páginas autenticadas: sidebar de navegación (fijo en desktop, drawer en móvil)
 * que separa el Dashboard de la gestión de VMs. En desktop el sidebar es colapsable a rail.
 */
export function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  // Conexión real-time mientras haya sesión (este layout solo se monta autenticado).
  useRealtimeVms()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar fijo (desktop), ancho según estado de colapso */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-border bg-card/40 transition-[width] duration-200 md:block",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <Sidebar collapsed={collapsed} onToggleCollapse={toggleSidebar} />
      </aside>

      {/* Sidebar como drawer (móvil): siempre expandido */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card shadow-xl transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </aside>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Contenido, con padding izquierdo según el ancho del sidebar */}
      <div className={cn("transition-[padding] duration-200", collapsed ? "md:pl-16" : "md:pl-60")}>
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu />
          </Button>
          <Brand />
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  )
}
