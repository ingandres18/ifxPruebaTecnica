import { describe, expect, it } from "vitest"

import type { Vm } from "@/features/vms/types"
import {
  computeOsDistribution,
  computeRamByOs,
  computeResourceTotals,
  computeStatusDistribution,
} from "./dashboardStats"

function vm(partial: Partial<Vm>): Vm {
  return {
    id: crypto.randomUUID(),
    name: "vm",
    cores: 1,
    ram: 1,
    disk: 10,
    os: "Ubuntu",
    status: "Encendida",
    createdAt: "",
    updatedAt: "",
    ...partial,
  }
}

const mixed: Vm[] = [
  vm({ cores: 4, ram: 8, disk: 80, os: "Ubuntu", status: "Encendida" }),
  vm({ cores: 8, ram: 16, disk: 160, os: "Debian", status: "Encendida" }),
  vm({ cores: 2, ram: 4, disk: 40, os: "Ubuntu", status: "Apagada" }),
  vm({ cores: 16, ram: 32, disk: 500, os: "RHEL", status: "Suspendida" }),
]

describe("computeResourceTotals", () => {
  it("suma recursos SOLO de las VMs encendidas en 'active'", () => {
    const totals = computeResourceTotals(mixed)
    // Encendidas: 4+8 cores, 8+16 ram, 80+160 disk
    expect(totals.cores.active).toBe(12)
    expect(totals.ram.active).toBe(24)
    expect(totals.disk.active).toBe(240)
    expect(totals.activeCount).toBe(2)
  })

  it("suma TODAS las VMs en 'total' (aprovisionado)", () => {
    const totals = computeResourceTotals(mixed)
    expect(totals.cores.total).toBe(30)
    expect(totals.ram.total).toBe(60)
    expect(totals.disk.total).toBe(780)
    expect(totals.totalCount).toBe(4)
  })

  it("no cuenta apagadas ni suspendidas como activas", () => {
    const totals = computeResourceTotals([
      vm({ cores: 10, status: "Apagada" }),
      vm({ cores: 10, status: "Suspendida" }),
    ])
    expect(totals.cores.active).toBe(0)
    expect(totals.cores.total).toBe(20)
    expect(totals.activeCount).toBe(0)
  })

  it("maneja una lista vacía sin romperse", () => {
    const totals = computeResourceTotals([])
    expect(totals).toMatchObject({
      totalCount: 0,
      activeCount: 0,
      cores: { active: 0, total: 0 },
    })
  })
})

describe("computeStatusDistribution", () => {
  it("cuenta por estado en orden fijo", () => {
    const dist = computeStatusDistribution(mixed)
    expect(dist).toEqual([
      { status: "Encendida", count: 2 },
      { status: "Apagada", count: 1 },
      { status: "Suspendida", count: 1 },
    ])
  })
})

describe("computeOsDistribution", () => {
  it("cuenta por OS de mayor a menor", () => {
    const dist = computeOsDistribution(mixed)
    expect(dist[0]).toEqual({ os: "Ubuntu", count: 2 })
    expect(dist).toHaveLength(3)
  })
})

describe("computeRamByOs", () => {
  it("agrega la RAM por OS y ordena descendente", () => {
    const byOs = computeRamByOs(mixed)
    // Ubuntu: 8 + 4 = 12, Debian: 16, RHEL: 32
    expect(byOs).toEqual([
      { os: "RHEL", ram: 32 },
      { os: "Debian", ram: 16 },
      { os: "Ubuntu", ram: 12 },
    ])
  })
})
