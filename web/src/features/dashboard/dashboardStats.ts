import type { OsName, Vm, VmStatus } from "@/features/vms/types"

/** Un recurso en dos dimensiones: lo que está encendido (en uso) vs lo aprovisionado (total). */
export interface ResourcePair {
  active: number
  total: number
}

export interface ResourceTotals {
  totalCount: number
  activeCount: number
  cores: ResourcePair
  ram: ResourcePair
  disk: ResourcePair
}

const isActive = (vm: Vm) => vm.status === "Encendida"

function sumBy(vms: Vm[], selector: (vm: Vm) => number): number {
  return vms.reduce((acc, vm) => acc + selector(vm), 0)
}

/**
 * Totales de recursos (SPEC §6): la suma "active" cuenta SOLO las VMs encendidas; "total" suma
 * todas (aprovisionado). La diferencia habilita el indicador de utilización.
 */
export function computeResourceTotals(vms: Vm[]): ResourceTotals {
  const active = vms.filter(isActive)
  return {
    totalCount: vms.length,
    activeCount: active.length,
    cores: { active: sumBy(active, (v) => v.cores), total: sumBy(vms, (v) => v.cores) },
    ram: { active: sumBy(active, (v) => v.ram), total: sumBy(vms, (v) => v.ram) },
    disk: { active: sumBy(active, (v) => v.disk), total: sumBy(vms, (v) => v.disk) },
  }
}

export interface StatusSlice {
  status: VmStatus
  count: number
}

/** Conteo por estado, en orden fijo (para el donut y su leyenda). */
export function computeStatusDistribution(vms: Vm[]): StatusSlice[] {
  const order: VmStatus[] = ["Encendida", "Apagada", "Suspendida"]
  return order.map((status) => ({
    status,
    count: vms.filter((vm) => vm.status === status).length,
  }))
}

export interface OsSlice {
  os: string
  count: number
}

/** Conteo por sistema operativo, solo los presentes, de mayor a menor. */
export function computeOsDistribution(vms: Vm[]): OsSlice[] {
  const counts = new Map<string, number>()
  for (const vm of vms) {
    counts.set(vm.os, (counts.get(vm.os) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([os, count]) => ({ os, count }))
    .sort((a, b) => b.count - a.count)
}

export interface RamByOsSlice {
  os: string
  ram: number
}

/** RAM (GB) aprovisionada agregada por sistema operativo, de mayor a menor (panel extra). */
export function computeRamByOs(vms: Vm[]): RamByOsSlice[] {
  const totals = new Map<string, number>()
  for (const vm of vms) {
    totals.set(vm.os, (totals.get(vm.os) ?? 0) + vm.ram)
  }
  return [...totals.entries()]
    .map(([os, ram]) => ({ os, ram }))
    .sort((a, b) => b.ram - a.ram)
}

export const knownOsOrder: OsName[] = ["Ubuntu", "Debian", "Windows Server", "RHEL", "Otro"]
