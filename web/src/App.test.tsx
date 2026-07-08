import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import App from "./App"

/**
 * Smoke test del harness de frontend (Slice 1): confirma que el layout base monta y muestra
 * la marca. Los tests reales (schema zod, cálculo de totales) llegan en slices posteriores.
 */
describe("App (layout base)", () => {
  it("renderiza la marca de la aplicación", () => {
    render(<App />)
    expect(screen.getByText(/IFX · Gestión de VMs/i)).toBeInTheDocument()
  })

  it("muestra el toggle de dark mode accesible", () => {
    render(<App />)
    expect(screen.getByLabelText(/modo (oscuro|claro)/i)).toBeInTheDocument()
  })
})
