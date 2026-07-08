import { create } from "zustand"

/** Resaltado transitorio de VMs que cambiaron por un evento real-time (~1.5s). */
interface HighlightState {
  ids: Set<string>
  flash: (id: string) => void
}

const FLASH_MS = 1500

export const useHighlightStore = create<HighlightState>((set) => ({
  ids: new Set(),
  flash: (id) => {
    set((state) => ({ ids: new Set(state.ids).add(id) }))
    setTimeout(() => {
      set((state) => {
        const next = new Set(state.ids)
        next.delete(id)
        return { ids: next }
      })
    }, FLASH_MS)
  },
}))
