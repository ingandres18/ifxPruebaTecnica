export type VmStatus = "Encendida" | "Apagada" | "Suspendida"

export type OsName = "Ubuntu" | "Debian" | "Windows Server" | "RHEL" | "Otro"

/** Máquina virtual tal como la devuelve GET /api/vms (enums como texto de display). */
export interface Vm {
  id: string
  name: string
  cores: number
  ram: number
  disk: number
  os: string
  status: VmStatus
  createdAt: string
  updatedAt: string
}
