import { Toaster } from "sonner"

import { useThemeStore } from "@/stores/themeStore"

/** Toaster de sonner sincronizado con el theme de la app (claro/oscuro). */
export function ThemedToaster() {
  const theme = useThemeStore((s) => s.theme)
  return <Toaster theme={theme} richColors position="top-right" />
}
