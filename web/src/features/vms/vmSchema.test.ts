import { describe, expect, it } from "vitest"

import { vmSchema } from "./vmSchema"

const validVm = {
  name: "web-01",
  cores: 4,
  ram: 8,
  disk: 80,
  os: "Ubuntu",
  status: "Encendida",
}

describe("vmSchema", () => {
  it("acepta un caso válido", () => {
    const result = vmSchema.safeParse(validVm)
    expect(result.success).toBe(true)
  })

  it("rechaza RAM negativa", () => {
    const result = vmSchema.safeParse({ ...validVm, ram: -8 })
    expect(result.success).toBe(false)
  })

  it("rechaza nombre con formato inválido (empieza con número)", () => {
    const result = vmSchema.safeParse({ ...validVm, name: "1-web" })
    expect(result.success).toBe(false)
  })

  it("rechaza nombre demasiado corto", () => {
    const result = vmSchema.safeParse({ ...validVm, name: "ab" })
    expect(result.success).toBe(false)
  })

  it("rechaza cores fuera de rango", () => {
    expect(vmSchema.safeParse({ ...validVm, cores: 0 }).success).toBe(false)
    expect(vmSchema.safeParse({ ...validVm, cores: 65 }).success).toBe(false)
  })

  it("rechaza disco fuera de rango", () => {
    expect(vmSchema.safeParse({ ...validVm, disk: 9 }).success).toBe(false)
    expect(vmSchema.safeParse({ ...validVm, disk: 4097 }).success).toBe(false)
  })

  it("rechaza un sistema operativo inválido", () => {
    const result = vmSchema.safeParse({ ...validVm, os: "MacOS" })
    expect(result.success).toBe(false)
  })
})
