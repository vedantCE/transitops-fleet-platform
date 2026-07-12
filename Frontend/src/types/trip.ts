import type { VehicleStatus } from './vehicle'
import type { DriverStatus } from './driver'

export type TripStatus = 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED'

export interface TripVehicleSummary {
  id: string
  registrationNumber: string
  name: string
  status: VehicleStatus
}

export interface TripDriverSummary {
  id: string
  name: string
  licenseNumber: string
  status: DriverStatus
}

export interface Trip {
  id: string
  source: string
  destination: string
  vehicleId: string
  driverId: string
  cargoWeight: number
  plannedDistance: number
  actualDistance: number | null
  fuelConsumed: number | null
  status: TripStatus
  dispatchedAt: string | null
  completedAt: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
  vehicle: TripVehicleSummary
  driver: TripDriverSummary
}

export interface TripInput {
  source: string
  destination: string
  vehicleId: string
  driverId: string
  cargoWeight: number
  plannedDistance: number
}

export interface CompleteTripInput {
  finalOdometer: number
  fuelConsumed: number
}
