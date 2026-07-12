export interface DashboardKpis {
  activeVehicles: number
  availableVehicles: number
  vehiclesInMaintenance: number
  activeTrips: number
  pendingTrips: number
  driversOnDuty: number
  fleetUtilization: number
}

export interface VehicleStats {
  vehicleId: string
  registrationNumber: string
  name: string
  type: string
  acquisitionCost: number
  totalDistance: number
  totalMaintenanceCost: number
  totalFuelCost: number
  totalFuelLiters: number
  totalExpensesCost: number
  totalOperationalCost: number
  fuelEfficiency: number
  revenue: number
  roi: number
}
