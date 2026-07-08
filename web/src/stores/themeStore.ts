import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Theme = "light" | "dark"

/** Valor inicial: respeta prefers-color-scheme si el usuario aún no eligió (SPEC §6). */
function systemTheme(): Theme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

/** Aplica/quita la clase `dark` en <html>. El token JAMÁS va aquí; el theme sí (CLAUDE.md). */
function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return
  document.documentElement.classList.toggle("dark", theme === "dark")
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: systemTheme(),
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
      toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
    }),
    {
      name: "ifx-theme",
      // Al rehidratar desde localStorage, sincroniza la clase del <html> con el valor guardado.
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    },
  ),
)
