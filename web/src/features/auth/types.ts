export type Role = "Administrador" | "Cliente"

/** Usuario autenticado tal como lo devuelve /auth/me y /auth/login. Sin token: va en cookie. */
export interface SessionUser {
  id: string
  email: string
  role: Role
}
