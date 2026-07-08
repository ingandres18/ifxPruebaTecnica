import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { LoginPage } from "./LoginPage"

function renderLogin() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/login"]}>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe("LoginPage", () => {
  beforeEach(() => {
    // Sin backend en el test: /auth/me falla → sesión ausente → se muestra el login.
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("sin servidor"))
  })

  it("renderiza el formulario de login con sus campos", async () => {
    renderLogin()

    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument()
  })
})
