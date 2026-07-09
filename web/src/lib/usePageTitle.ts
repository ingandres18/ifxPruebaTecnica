import { useEffect } from "react"

const BASE = "IFX · Gestión de VMs"

/** Fija el título de la pestaña por página (accesibilidad y contexto al navegar). */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · IFX` : BASE
    return () => {
      document.title = BASE
    }
  }, [title])
}
