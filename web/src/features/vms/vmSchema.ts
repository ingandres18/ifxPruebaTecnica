import { z } from "zod"

/** Sistemas operativos válidos (SPEC §3), en el mismo orden que el backend. */
export const osOptions = ["Ubuntu", "Debian", "Windows Server", "RHEL", "Otro"] as const

/** Estados válidos de una VM (SPEC §3). */
export const statusOptions = ["Encendida", "Apagada", "Suspendida"] as const

/**
 * Validación del formulario de VM. Espeja exactamente las reglas server-side (SPEC §3 /
 * VmValidation.cs): esta es solo UX, el backend es la fuente de verdad real.
 */
export const vmSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener entre 3 y 50 caracteres")
    .max(50, "El nombre debe tener entre 3 y 50 caracteres")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9-]*$/,
      "Debe iniciar con letra y contener solo letras, números y guiones",
    ),
  cores: z.coerce
    .number({ error: "Ingresa un número" })
    .int("Los cores deben ser un número entero")
    .min(1, "Los cores deben estar entre 1 y 64")
    .max(64, "Los cores deben estar entre 1 y 64"),
  ram: z.coerce
    .number({ error: "Ingresa un número" })
    .int("La RAM debe ser un número entero")
    .min(1, "La RAM (GB) debe estar entre 1 y 512")
    .max(512, "La RAM (GB) debe estar entre 1 y 512"),
  disk: z.coerce
    .number({ error: "Ingresa un número" })
    .int("El disco debe ser un número entero")
    .min(10, "El disco (GB) debe estar entre 10 y 4096")
    .max(4096, "El disco (GB) debe estar entre 10 y 4096"),
  os: z.enum(osOptions, { error: "Selecciona un sistema operativo" }),
  status: z.enum(statusOptions, { error: "Selecciona un estado" }),
})

export type VmFormValues = z.infer<typeof vmSchema>
