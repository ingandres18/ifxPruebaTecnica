import { apiFetch } from "@/lib/apiClient"
import type { SessionUser } from "./types"

export interface LoginInput {
  email: string
  password: string
}

/** Rehidrata la sesión desde la cookie. 401 si no hay sesión válida. */
export const fetchMe = () => apiFetch<SessionUser>("/auth/me")

/** Autentica y deja la cookie HttpOnly seteada. Devuelve el usuario (sin token). */
export const login = (input: LoginInput) =>
  apiFetch<SessionUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  })

/** Borra la cookie de sesión en el backend. */
export const logout = () => apiFetch<void>("/auth/logout", { method: "POST" })
