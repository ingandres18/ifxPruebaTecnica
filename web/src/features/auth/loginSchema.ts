import { z } from "zod"

/** Validación del formulario de login (UX). La validación real de credenciales es del backend. */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .pipe(z.email("Ingresa un email válido")),
  password: z.string().min(1, "La contraseña es requerida"),
})

export type LoginValues = z.infer<typeof loginSchema>
