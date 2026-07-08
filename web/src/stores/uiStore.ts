import { create } from "zustand"
import { persist } from "zustand/middleware"

/** Preferencias de UI puramente de cliente (no server state). Persistidas como el theme. */
interface UiState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
    }),
    { name: "ifx-ui" },
  ),
)
