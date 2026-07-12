import type { VehicleStatus } from './vehicle'

export type MaintenanceStatus = 'ACTIVE' | 'CLOSED'

export interface MaintenanceLog {
  id: string
  vehicleId: string
  description: string
  cost: number
  status: MaintenanceStatus
  startDate: string
  endDate: string | null
  createdAt: string
  updatedAt: string
  vehicle: {
    id: string
    registrationNumber: string
    name: string
    status: VehicleStatus
  }
}

export interface MaintenanceInput {
  vehicleId: string
  description: string
  cost?: number
}
