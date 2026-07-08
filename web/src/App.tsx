import { Server } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"

/**
 * Layout base (Slice 1). Header con marca + toggle de dark mode y un cuerpo placeholder.
 * Las páginas reales (login, dashboard, VMs) llegan en slices posteriores.
 */
function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Server className="size-5 text-primary" />
            <span className="text-lg font-semibold">IFX · Gestión de VMs</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-xl border border-border bg-card p-10 text-center text-card-foreground">
          <h1 className="text-2xl font-semibold">Scaffolding listo</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Slice 1 — harness, dark mode y base visual. Las features llegan en los próximos slices.
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
