import { Component, type ErrorInfo, type ReactNode } from "react"
import { RotateCcw, TriangleAlert } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Red de seguridad ante errores de renderizado: si cualquier componente lanza durante el render,
 * React desmontaría toda la app (pantalla en blanco). Aquí lo atrapamos y mostramos un fallback
 * con opción de recargar. Debe ser un componente de clase (React no ofrece equivalente en hooks).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // En producción esto iría a un servicio de observabilidad; en dev, a la consola.
    console.error("ErrorBoundary capturó un error de renderizado:", error, info)
  }

  render() {
    if (this.state.hasError) return <Fallback />
    return this.props.children
  }
}

// Fallback con markup mínimo (sin componentes compartidos que podrían ser la causa del error).
function Fallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
      <span className="grid size-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <TriangleAlert className="size-7" />
      </span>
      <div>
        <h1 className="text-lg font-semibold">Algo salió mal</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Ocurrió un error inesperado. Recarga la página para continuar.
        </p>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <RotateCcw className="size-4" />
        Recargar la página
      </button>
    </div>
  )
}
