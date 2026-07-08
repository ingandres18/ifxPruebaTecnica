import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useThemeStore } from "@/stores/themeStore"

/** Botón accesible para alternar dark mode. aria-label porque es un botón solo-icono (CLAUDE.md). */
export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  )
}
